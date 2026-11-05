import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { getStudentMap } from './students';

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
