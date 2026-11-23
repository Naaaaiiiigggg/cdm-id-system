// The ONLY allowed stage changes for an ID request.
// Keep it identical to backend/app/core/config.py (ALLOWED_TRANSITIONS) and firestore.rules (validMove).
// A request only moves forward. Rejecting is possible only before Approved. Claimed is final.
export const ALLOWED_TRANSITIONS = {
  Submitted: ['Under Review', 'Rejected'],
  'Under Review': ['Approved', 'Rejected'],
  Approved: ['For Printing'],
  'For Printing': ['Ready for Pickup'],
  'Ready for Pickup': ['Claimed'],
  Claimed: [],
  Rejected: ['Under Review'], // reopen only
};

// From these stages on, the ID needs the Registrar photo and the student's signature.
export const PRINT_STAGES = ['For Printing', 'Ready for Pickup', 'Claimed'];

export const nextStages = (status) => ALLOWED_TRANSITIONS[status] || [];
export const canMove = (from, to) => nextStages(from).includes(to);
export const isFinal = (status) => nextStages(status).length === 0;
export const canReject = (status) => canMove(status, 'Rejected');

// The one forward stage (never Rejected). Same stage if the request can't move on.
export const forwardStage = (status) => nextStages(status).find((s) => s !== 'Rejected') || status;

// Text of the confirmation pop-up before a move.
export function confirmCopy(from, to) {
  if (to === 'Rejected') return { title: 'Reject this request?', message: 'The student will get an alert with your reason.', confirmText: 'Reject', destructive: true };
  if (from === 'Rejected') return { title: 'Reopen this request?', message: 'It goes back to Under Review. The student will get an alert.', confirmText: 'Reopen', destructive: false };
  if (to === 'Approved') return { title: 'Approve this request?', message: 'This cannot be undone, and the student will be notified.', confirmText: 'Approve', destructive: false };
  if (to === 'Claimed') return { title: 'Mark as Claimed?', message: 'This is final. The ID was handed out and this request can no longer be changed.', confirmText: 'Mark as Claimed', destructive: false };
  return { title: `Move to ${to}?`, message: 'The student will get an alert.', confirmText: 'Move', destructive: false };
}
