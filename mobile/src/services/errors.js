// Turns Firebase error codes into messages a student can understand.
export function friendly(e) {
  const c = e?.code || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found'))
    return 'Incorrect email or password.';
  if (c.includes('email-already-in-use')) return 'This email already has an account. Sign in instead.';
  if (c.includes('invalid-email')) return 'Enter a valid email address.';
  if (c.includes('weak-password')) return 'Password is too weak. Use at least 8 characters.';
  if (c.includes('too-many-requests')) return 'Too many attempts. Please wait a few minutes and try again.';
  if (c.includes('network-request-failed') || c.includes('unavailable'))
    return 'No connection. Check your internet and try again.';
  if (c.includes('operation-not-allowed'))
    return 'Anonymous sign-in is turned off in Firebase (Authentication > Sign-in method). Turn it on and try again.';
  if (c.includes('permission-denied')) return 'You do not have permission to do that.';
  return e?.message || 'Something went wrong. Please try again.';
}
