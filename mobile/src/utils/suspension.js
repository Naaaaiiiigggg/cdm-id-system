// Everything about suspended accounts that does not need Firebase.

export const DURATIONS = [
  { key: '1d', label: '1 day', days: 1 },
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: 'custom', label: 'Pick a date' },
  { key: 'perm', label: 'Permanent' },
];

// Quick reasons the Registrar can tap (each is under the 100-character limit).
export const SUSPEND_REASONS = [
  'Violation of school policy',
  'Account misuse',
  'Pending clearance',
  'Incorrect or false information',
];

export const DEFAULT_TEMP_MSG = 'You can sign in again after that date.';
export const DEFAULT_PERM_MSG = "Please visit the Registrar's Office to have your account reactivated.";
const DEFAULT_OLD_MSG = "Please contact the Registrar's Office.";

// Same limits as firestore.rules
export const MAX_REASON = 100;
export const MAX_MESSAGE = 300;

// Written to the account when it is switched back on.
export const CLEARED = { suspendedAt: null, suspendedUntil: null, suspendPermanent: false, suspendReason: '', suspendMessage: '' };

const toDate = (v) => (v && v.toDate ? v.toDate() : v instanceof Date ? v : null);

// true when the suspension had an end date and that date has passed
export function suspensionEnded(p) {
  const d = toDate(p.suspendedUntil);
  return !p.suspendPermanent && !!d && d.getTime() <= Date.now();
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const fmtLong = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

// The suspension details of a users/{uid} document, in plain values for the screens.
export const suspensionInfo = (p) => ({
  until: toDate(p.suspendedUntil),
  permanent: !!p.suspendPermanent,
  reason: p.suspendReason || '',
  message: p.suspendMessage || '',
  at: toDate(p.suspendedAt),
});

// The text a suspended student reads on the sign-in screen.
export function studentNotice(p) {
  const until = toDate(p.suspendedUntil);
  const timed = !p.suspendPermanent && !!until;
  const lines = [timed ? `Your account is suspended until ${fmtLong(until)}.` : 'Your account is suspended.'];
  if (p.suspendReason) lines.push(`Reason: ${p.suspendReason}`);
  lines.push(p.suspendMessage || (p.suspendPermanent ? DEFAULT_PERM_MSG : timed ? DEFAULT_TEMP_MSG : DEFAULT_OLD_MSG));
  return lines.join('\n');
}
