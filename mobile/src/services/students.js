import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

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
export async function listAccounts() {
  const [regSnap, userSnap] = await Promise.all([
    getDocs(collection(db, 'registrar_students')),
    getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
  ]);
  const users = {};
  userSnap.forEach((d) => { users[d.data().studentNo] = { uid: d.id, ...d.data() }; });
  const list = [];
  regSnap.forEach((d) => {
    const r = d.data();
    const u = users[d.id];
    list.push({
      studentNo: d.id, name: r.name, program: r.program, yearLevel: r.yearLevel,
      uid: u ? u.uid : null, email: u ? u.email : '', status: u ? u.status : 'Not registered',
    });
  });
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export const setAccountStatus = (uid, status) => updateDoc(doc(db, 'users', uid), { status });
