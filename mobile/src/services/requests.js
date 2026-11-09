import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getStudentMap } from './students';
import { STATUSES } from '../theme';
import { timeRange, weekdayDate } from '../utils/format';

const newestFirst = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
const toList = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(newestFirst);

// A student's own requests, newest first.
export async function getMyRequests(uid) {
  return toList(await getDocs(query(collection(db, 'requests'), where('uid', '==', uid))));
}

// A student's own alerts, newest first.
export async function getMyAlerts(uid) {
  return toList(await getDocs(query(collection(db, 'notifications'), where('uid', '==', uid))));
}

// Admin: all requests plus the student names to show next to them.
export async function getAdminData() {
  const [snap, students] = await Promise.all([getDocs(collection(db, 'requests')), getStudentMap()]);
  return { requests: toList(snap), students };
}

// The student's Registrar record, fresh from Firestore: photo (uploaded by the Registrar),
// birthdate, contact, address, guardian and guardianContact. Used to draw the ID card.
export async function getMyMedia(studentNo) {
  const snap = await getDoc(doc(db, 'registrar_students', studentNo));
  return snap.exists() ? snap.data() : {};
}

const DONE = ['Claimed', 'Rejected'];
export const activeRequest = (list) => list.find((r) => !DONE.includes(r.status)) || null;

// Creates the student's ID request. Returns the request number.
export async function submitRequest({ uid, studentNo, type, reason }) {
  if (activeRequest(await getMyRequests(uid))) {
    const e = new Error('You already have an active ID request.');
    e.code = 'app/active-request';
    throw e;
  }
  const requestNo = `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
  await setDoc(doc(db, 'requests', requestNo), {
    uid, studentNo, requestNo, type, reason, status: 'Submitted', createdAt: serverTimestamp(),
  });
  return requestNo;
}

// Everything the request screen needs in one go.
export async function getMediaAndRequests(me) {
  const [media, signature, requests] = await Promise.all([getMyMedia(me.studentNo), getMySignature(me.studentNo), getMyRequests(me.uid)]);
  return { media, signature, requests };
}

// The signature the student drew: { path, box } or null. It is saved once and printed on the ID.
export async function getMySignature(studentNo) {
  const snap = await getDoc(doc(db, 'student_signatures', studentNo));
  return snap.exists() ? snap.data() : null;
}

export async function saveMySignature(studentNo, { path, box }) {
  if (path.length > 20000) {
    const e = new Error('That signature is too detailed. Please sign again more simply.');
    e.code = 'app/signature-too-long';
    throw e;
  }
  await setDoc(doc(db, 'student_signatures', studentNo), { path, box, updatedAt: serverTimestamp() });
  return { path, box };
}

// The date each step was reached: { 'Approved': <timestamp>, ... }. Going back a step removes the later dates.
function nextStageDates(prev = {}, status) {
  const i = STATUSES.indexOf(status);
  const out = {};
  Object.entries(prev).forEach(([k, v]) => {
    if (status === 'Rejected') out[k] = v;
    else if (k !== 'Rejected' && STATUSES.indexOf(k) <= i) out[k] = v;
  });
  out[status] = serverTimestamp();
  return out;
}

const pickupSentence = (p) => {
  const t = timeRange(p.from, p.to);
  return ` Pick it up on ${weekdayDate(p.date)}${t ? `, ${t}` : ''}.${p.bring ? ` Bring: ${p.bring}.` : ''}`;
};

// Admin: change a request's status, the note to the student and (for Ready for Pickup) the pickup details.
// pickup = { date: 'YYYY-MM-DD', from: 'HH:MM' | '', to: 'HH:MM' | '', bring: '' }
// One batch: updates the request, sends the student an alert, and writes an audit log entry.
export async function updateRequest(request, { status, note, pickup }) {
  const admin = auth.currentUser;
  const statusChanged = status !== request.status;
  const noteChanged = note !== (request.adminNote || '');
  const pickupChanged = !!pickup && (
    pickup.date !== (request.pickupDate || '') || pickup.from !== (request.pickupFrom || '')
    || pickup.to !== (request.pickupTo || '') || pickup.bring !== (request.pickupBring || '')
  );
  if (!statusChanged && !noteChanged && !pickupChanged) return;

  let message;
  if (status === 'Rejected') message = `Your ID request ${request.requestNo} was rejected.`;
  else if (statusChanged) {
    message = `Your ID request ${request.requestNo} is now: ${status}.`;
    if (pickup && status === 'Ready for Pickup') message += pickupSentence(pickup);
  } else if (pickupChanged) {
    message = `The pickup details for your ID request ${request.requestNo} were updated.${pickupSentence(pickup)}`;
  } else message = `The Registrar left a note on your request ${request.requestNo}.`;
  if (note) message += ` Note: ${note}`;
  message = message.slice(0, 600);

  const changes = { status, adminNote: note, updatedAt: serverTimestamp() };
  if (statusChanged) changes.stageDates = nextStageDates(request.stageDates, status);
  if (pickup) {
    changes.pickupDate = pickup.date;
    changes.pickupFrom = pickup.from;
    changes.pickupTo = pickup.to;
    changes.pickupBring = pickup.bring;
  }

  const batch = writeBatch(db);
  batch.update(doc(db, 'requests', request.id), changes);
  batch.set(doc(collection(db, 'notifications')), {
    uid: request.uid, requestNo: request.requestNo, message, createdAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, 'audit_logs')), {
    action: statusChanged ? `set_status:${status}` : pickupChanged ? 'set_pickup' : 'set_note', target: request.requestNo,
    by: admin.uid, byEmail: admin.email, createdAt: serverTimestamp(),
  });
  await batch.commit();
}
