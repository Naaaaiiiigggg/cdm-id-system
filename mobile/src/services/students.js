import {
  Timestamp, collection, deleteField, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { CLEARED, suspensionEnded, suspensionInfo } from '../utils/suspension';

// One Registrar record (read-only). Allowed only for the owner or an admin.
export async function getRegistrarRecord(studentNo) {
  const snap = await getDoc(doc(db, 'registrar_students', studentNo));
  return snap.exists() ? snap.data() : null;
}

// { '24-66298': { name, program, yearLevel }, ... } (admin only)
export async function getStudentMap() {
  const snap = await getDocs(collection(db, 'registrar_students'));
  const map = {};
  snap.forEach((d) => { map[d.id] = d.data(); });
  return map;
}

// Every Registrar student with their account status (admin only).
// Accounts whose suspension end date has passed are switched back to Active here.
export async function listAccounts() {
  const [regSnap, userSnap] = await Promise.all([
    getDocs(collection(db, 'registrar_students')),
    getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
  ]);
  const users = {};
  userSnap.forEach((d) => { users[d.data().studentNo] = { uid: d.id, ...d.data() }; });

  // auto-reactivation: the end date has passed
  const ended = Object.values(users).filter((u) => u.status === 'Suspended' && suspensionEnded(u));
  await Promise.all(ended.map(async (u) => {
    try {
      await updateDoc(doc(db, 'users', u.uid), { status: 'Active', ...CLEARED });
      Object.assign(u, { status: 'Active', ...CLEARED });
    } catch (e) { /* leave it suspended; the next visit tries again */ }
  }));

  const list = [];
  regSnap.forEach((d) => {
    const r = d.data();
    const u = users[d.id];
    const status = u ? u.status : 'Not registered';
    list.push({
      studentNo: d.id, name: r.name, program: r.program, yearLevel: r.yearLevel, contact: r.contact || '',
      photo: r.photo || '', birthdate: r.birthdate || '', address: r.address || '', guardian: r.guardian || '', guardianContact: r.guardianContact || '',
      uid: u ? u.uid : null, email: u ? u.email : '', status,
      suspension: u && status === 'Suspended' ? suspensionInfo(u) : null,
    });
  });
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

// Admin: suspend an account.  { reason, message, until: Date | null, permanent: boolean }
// One batch: updates the account and writes an audit log entry.
export async function suspendAccount(account, { reason, message, until, permanent }) {
  const admin = auth.currentUser;
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', account.uid), {
    status: 'Suspended',
    suspendedAt: serverTimestamp(),
    suspendedUntil: permanent ? null : Timestamp.fromDate(until),
    suspendPermanent: !!permanent,
    suspendReason: reason,
    suspendMessage: message,
  });
  batch.set(doc(collection(db, 'audit_logs')), {
    action: permanent ? 'suspend:permanent' : 'suspend:temporary', target: account.studentNo,
    by: admin.uid, byEmail: admin.email, createdAt: serverTimestamp(),
  });
  await batch.commit();
}

// Admin: switch an account back on and clear the suspension details.
export async function reactivateAccount(account) {
  const admin = auth.currentUser;
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', account.uid), { status: 'Active', ...CLEARED });
  batch.set(doc(collection(db, 'audit_logs')), {
    action: 'reactivate', target: account.studentNo,
    by: admin.uid, byEmail: admin.email, createdAt: serverTimestamp(),
  });
  await batch.commit();
}

// ---------------- Registrar list: add, edit, delete (admin only) ----------------
// These write to registrar_students. firestore.rules check the same rules again on the server.

const writeLog = (batch, action, target) => {
  const admin = auth.currentUser;
  batch.set(doc(collection(db, 'audit_logs')), {
    action, target, by: admin.uid, byEmail: admin.email, createdAt: serverTimestamp(),
  });
};

const noPermission = (e, text) => (e && e.code === 'permission-denied' ? new Error(text) : e);

// data: { name, program, yearLevel, birthdate, contact, address, guardian, guardianContact } (see cleanStudent)
// photo (optional): a JPEG data URI made by PhotoUploader. It is saved together with the student, in one step.
export async function addStudent(studentNo, data, photo) {
  const ref = doc(db, 'registrar_students', studentNo);
  if ((await getDoc(ref)).exists()) throw new Error(`${studentNo} is already on the Registrar list.`);
  const batch = writeBatch(db);
  batch.set(ref, photo ? { ...data, photo, photoUpdatedAt: serverTimestamp() } : data);
  writeLog(batch, 'create_registrar_student', studentNo);
  if (photo) writeLog(batch, 'upload_photo', studentNo);
  try {
    await batch.commit();
  } catch (e) {
    throw noPermission(e, 'Not allowed. Check that the latest Firestore rules are published.');
  }
}

export async function updateStudent(studentNo, data) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'registrar_students', studentNo), data);
  writeLog(batch, 'update_registrar_student', studentNo);
  try {
    await batch.commit();
  } catch (e) {
    throw noPermission(e, 'Not allowed. Check that the latest Firestore rules are published.');
  }
}

// Only works for a student who has no account yet (the rules refuse it otherwise).
export async function deleteStudent(studentNo) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'registrar_students', studentNo));
  writeLog(batch, 'delete_registrar_student', studentNo);
  try {
    await batch.commit();
  } catch (e) {
    throw noPermission(e, 'Could not delete. If this student already has an account, suspend the account instead. Otherwise check that the latest Firestore rules are published.');
  }
}

// ---------------- Student photo (admin only) ----------------
// The photo is a small JPEG data URI stored on the student's Registrar record, like the backend does.

export async function saveStudentPhoto(studentNo, dataUri) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'registrar_students', studentNo), { photo: dataUri, photoUpdatedAt: serverTimestamp() });
  writeLog(batch, 'upload_photo', studentNo);
  try {
    await batch.commit();
  } catch (e) {
    throw noPermission(e, 'Not allowed. Check that the latest Firestore rules are published.');
  }
}

export async function removeStudentPhoto(studentNo) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'registrar_students', studentNo), { photo: deleteField(), photoUpdatedAt: deleteField() });
  writeLog(batch, 'delete_photo', studentNo);
  try {
    await batch.commit();
  } catch (e) {
    throw noPermission(e, 'Not allowed. Check that the latest Firestore rules are published.');
  }
}
