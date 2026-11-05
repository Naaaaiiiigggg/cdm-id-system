import {
  EmailAuthProvider, deleteUser, linkWithCredential, sendPasswordResetEmail,
  signInAnonymously, signInWithEmailAndPassword, signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';

// While a student is registering, the app must not jump into the main screens
// until the "Is this you?" confirmation has been shown.
let registering = false;
export const isRegistering = () => registering;
export const finishRegistration = () => { registering = false; };

// Loads the signed-in person's profile from Firestore.
// Returns null when the account has no profile yet.
export async function buildSession(user) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  const p = snap.data();
  if (p.status !== 'Active') {
    const e = new Error('Account suspended. Please contact the Registrar.');
    e.code = 'app/suspended';
    throw e;
  }
  const session = {
    uid: user.uid, email: user.email, role: p.role,
    studentNo: p.studentNo || null, staffId: p.staffId || null, name: p.name || '',
  };
  if (p.role === 'student') {
    const r = await getDoc(doc(db, 'registrar_students', p.studentNo));
    if (r.exists()) {
      const d = r.data();
      session.name = d.name;
      session.program = d.program;
      session.yearLevel = d.yearLevel;
    }
  }
  return session;
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  try {
    const s = await buildSession(cred.user);
    if (!s) throw new Error('This account is not set up yet. Please contact the Registrar.');
    return s;
  } catch (e) {
    await signOut(auth);
    throw e;
  }
}

export const signOutUser = () => signOut(auth);

export const sendReset = (email) => sendPasswordResetEmail(auth, email.trim().toLowerCase());

/* Registration
   1. verifyStudent: temporary guest login; Firestore rules confirm student number +
      birthdate against the Registrar record (the list itself is never exposed).
      Then that one record is read for "Is this you?".
   2. createLogin: the guest is upgraded to a real account with the personal email. */
export async function verifyStudent({ studentNo, birthdate }) {
  registering = true;
  if (auth.currentUser && !auth.currentUser.isAnonymous) await signOut(auth);
  if (!auth.currentUser) await signInAnonymously(auth);
  try {
    await setDoc(doc(db, 'verifications', auth.currentUser.uid), {
      studentNo, birthdate, createdAt: serverTimestamp(),
    });
  } catch (e) {
    const err = new Error('We could not match this student number and birthdate with the Registrar list, or this number already has an account.');
    err.code = 'app/not-verified';
    throw err;
  }
  const snap = await getDoc(doc(db, 'registrar_students', studentNo));
  if (!snap.exists()) throw new Error('Student record not found. Please see the Registrar.');
  return snap.data();
}

export async function createLogin({ studentNo, email, password }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Your session expired. Please start again.');
  await linkWithCredential(user, EmailAuthProvider.credential(email, password));
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', user.uid), {
      role: 'student', status: 'Active', studentNo, email, createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'registered_students', studentNo), { uid: user.uid, createdAt: serverTimestamp() });
    await batch.commit();
  } catch (e) {
    registering = false;
    await deleteUser(auth.currentUser).catch(() => {});
    const err = new Error('Registration could not be completed. This student number may already have an account. Please start again.');
    err.code = 'app/registration-rejected';
    throw err;
  }
}

// Student leaves the registration screens: remove the temporary guest login.
export async function cancelRegistration() {
  registering = false;
  const u = auth.currentUser;
  if (u && u.isAnonymous) await deleteUser(u).catch(() => signOut(auth));
}
