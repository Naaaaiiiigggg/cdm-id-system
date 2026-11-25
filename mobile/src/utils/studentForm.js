// Rules for a Registrar student record. They match the backend (schemas.py) and firestore.rules.
import { PROGRAMS } from '../data/programs';

export const PROGRAM_CODES = Object.keys(PROGRAMS);
export const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const EMPTY_STUDENT = {
  studentNo: '', name: '', program: '', yearLevel: '', birthdate: '', contact: '', address: '', guardian: '', guardianContact: '',
};

// "2466298" -> "24-66298" (digits only, at most 7)
export const formatStudentNo = (t) => {
  const d = String(t).replace(/\D/g, '').slice(0, 7);
  return d.length > 2 ? `${d.slice(0, 2)}-${d.slice(2)}` : d;
};
// phone numbers: digits only, at most 11
export const formatPhone = (t) => String(t).replace(/\D/g, '').slice(0, 11);

const PHONE = /^09\d{9}$/;

function realPastDate(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
  if (!m) return false;
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return false; // e.g. 2004-02-31
  return dt <= new Date() && y >= 1900;
}

// Returns the first problem as a sentence, or '' when everything is fine.
export function validateStudent(f, isNew) {
  if (isNew && !/^\d{2}-\d{5}$/.test(f.studentNo)) return 'Student number must look like 24-66298.';
  const name = f.name.trim();
  if (name.length < 2 || name.length > 100) return 'Write the full name (at least 2 letters).';
  if (!PROGRAM_CODES.includes(f.program)) return 'Choose a program.';
  if (!YEAR_LEVELS.includes(f.yearLevel)) return 'Choose a year level.';
  if (!realPastDate(f.birthdate)) return 'Choose a real birthdate that is not in the future.';
  if (!PHONE.test(f.contact)) return 'Contact number must be 11 digits starting with 09.';
  const address = f.address.trim();
  if (address.length < 5 || address.length > 150) return 'Address must be 5 to 150 characters.';
  const guardian = f.guardian.trim();
  if (guardian.length < 2 || guardian.length > 80) return "Write the guardian's name.";
  if (!PHONE.test(f.guardianContact)) return "Guardian's contact number must be 11 digits starting with 09.";
  return '';
}

// Trimmed copy that is safe to save
export const cleanStudent = (f) => ({
  name: f.name.trim(), program: f.program, yearLevel: f.yearLevel, birthdate: f.birthdate,
  contact: f.contact, address: f.address.trim(), guardian: f.guardian.trim(), guardianContact: f.guardianContact,
});
