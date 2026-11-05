import { collection, getDocs, query, where } from 'firebase/firestore';
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
