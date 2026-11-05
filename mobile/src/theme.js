import { StyleSheet } from 'react-native';

// Colors (same as the HTML prototype)
export const C = {
  g9: '#0E3B2A', g7: '#1F5C43', g1: '#E6F0EB', gold: '#F2C230',
  ink: '#16201B', mu: '#5E6B64', ln: '#DDE5E0', bg: '#F4F7F5', sf: '#FFFFFF', bad: '#B42318',
};

// Request status flow
export const STATUSES = ['Submitted', 'Under Review', 'Approved', 'For Printing', 'Ready for Pickup', 'Claimed'];

// Pill colors: [background, text]
export const PILL = {
  Submitted: ['#E8ECF0', '#44505C'], 'Under Review': ['#FBF0D5', '#B7791F'],
  Approved: ['#DDF1E6', '#1F7A4D'], 'For Printing': ['#E1E8F7', '#2B4C9B'],
  'Ready for Pickup': ['#F2C230', '#0E3B2A'], Claimed: ['#E6F0EB', '#1F5C43'],
  Rejected: ['#FDECEA', '#B42318'], Active: ['#DDF1E6', '#1F7A4D'],
  Suspended: ['#FDECEA', '#B42318'], 'Not registered': ['#E8ECF0', '#44505C'],
};

// Styles shared by many screens
export const common = StyleSheet.create({
  pad: { padding: 18, paddingBottom: 30 },
  h2: { fontSize: 20, fontWeight: '800', color: C.ink },
  h2c: { fontSize: 20, fontWeight: '800', color: C.ink, textAlign: 'center' },
  h3: { fontSize: 14, fontWeight: '800', color: C.ink },
  mu: { color: C.mu, fontSize: 12 },
  bold: { fontWeight: '700', color: C.ink, fontSize: 14 },
  err: { color: C.bad, fontSize: 12, minHeight: 16, marginTop: 8 },
  link: { color: C.g7, fontWeight: '700', textAlign: 'center', marginTop: 14 },
  note: { backgroundColor: '#FBF3DA', borderRadius: 10, padding: 10, marginVertical: 12 },
  noteTx: { color: '#5a4410', fontSize: 12 },
  hd: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  bk: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.ln, backgroundColor: C.sf, alignItems: 'center', justifyContent: 'center' },
  bkTx: { fontSize: 20, color: C.ink, marginTop: -2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.ln },
});
