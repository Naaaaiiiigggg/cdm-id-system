// Student number format: 00-00000 (example: 24-66298)
export const STUDENT_NO_RE = /^\d{2}-\d{5}$/;
export const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "2466298" -> "24-66298"
export function formatStudentNo(text) {
  const d = text.replace(/\D/g, '').slice(0, 7);
  return d.length > 2 ? `${d.slice(0, 2)}-${d.slice(2)}` : d;
}

// "20050921" -> "2005-09-21"
export function formatBirthdate(text) {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length > 6) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
  if (d.length > 4) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return d;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Firestore Timestamp -> "03 Oct 2026"
export function formatDate(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Strong password rules (shown as a live checklist on the registration screen)
export const PASSWORD_RULES = [
  { key: 'len', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'up', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'low', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { key: 'num', label: 'One number (0-9)', test: (p) => /\d/.test(p) },
  { key: 'sym', label: 'One symbol (e.g. ! @ # $ %)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];
export const isStrongPassword = (p) => PASSWORD_RULES.every((r) => r.test(p));
