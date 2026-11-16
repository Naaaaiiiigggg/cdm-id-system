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

const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "2006-02-04" -> "February 4, 2006"
export function longDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '');
  return m ? `${FULL_MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : text || '—';
}

// "09123456789" -> "0912••••789" (used before the student has an account)
export const maskPhone = (p) => (p && p.length >= 8 ? `${p.slice(0, 4)}${'•'.repeat(p.length - 7)}${p.slice(-3)}` : p || '—');

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad2 = (n) => String(n).padStart(2, '0');

// Today as "2026-11-09"
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

// Firestore Timestamp -> "7 Nov"
export function shortDate(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  return d ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : '';
}

// "2026-11-09" -> "Monday, November 9, 2026"
export function weekdayDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '');
  if (!m) return text || '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${WEEKDAYS[d.getDay()]}, ${FULL_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// "14:30" -> "2:30 PM"
export function time12(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
  if (!m) return '';
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

// ("08:00", "16:00") -> "8:00 AM – 4:00 PM"; one side only -> "From 8:00 AM" / "Until 4:00 PM"
export function timeRange(from, to) {
  if (from && to) return `${time12(from)} – ${time12(to)}`;
  if (from) return `From ${time12(from)}`;
  if (to) return `Until ${time12(to)}`;
  return '';
}
