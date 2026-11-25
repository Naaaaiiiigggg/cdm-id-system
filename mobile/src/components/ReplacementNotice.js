import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { REPLACEMENT_FEE_TEXT, needsAffidavit } from '../data/replacement';

// What a student must bring for a replacement ID. Shown before they submit the request.
// The affidavit of loss is only listed for Lost / Stolen; the fee applies to every replacement.
export default function ReplacementNotice({ reason }) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <View style={styles.head}>
        <Feather name="alert-circle" size={16} color="#8A6A12" />
        <Text style={styles.title}>Replacement ID requirements</Text>
      </View>
      <Text style={styles.tx}>Bring these to the Registrar's Office on your scheduled pickup date:</Text>
      {needsAffidavit(reason) ? (
        <View style={styles.row}>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.tx}>
            <Text style={styles.b}>Affidavit of loss</Text>, required because your ID was {reason.toLowerCase()}.
          </Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.tx}>
          <Text style={styles.b}>Replacement fee: {REPLACEMENT_FEE_TEXT}</Text>, paid when you pick up your new ID.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#FBF3DA', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#F0DFA8' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 13, fontWeight: '800', color: '#8A6A12' },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot: { color: '#5a4410', fontSize: 13 },
  tx: { flex: 1, fontSize: 13, color: '#5a4410', lineHeight: 19 },
  b: { fontWeight: '800' },
});

// Student Home, inside the "Pick up your ID" box: what to bring and pay for a replacement.
// bring = what the Registrar typed under "What to bring" (so the affidavit is not listed twice).
export function ReplacementPickupInfo({ reason, bring }) {
  const listAffidavit = needsAffidavit(reason) && !/affidavit/i.test(bring || '');
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={pick.head}>Replacement requirements</Text>
      {listAffidavit ? (
        <Text style={pick.line}>• <Text style={styles.b}>Affidavit of loss</Text></Text>
      ) : null}
      <Text style={pick.line}>• <Text style={styles.b}>Replacement fee: {REPLACEMENT_FEE_TEXT}</Text>, paid when you pick up your ID</Text>
    </View>
  );
}

// Admin Manage request pop-up: what to check and collect when a replacement ID is handed over.
export function ReplacementAdminReminder({ reason }) {
  return (
    <View style={[styles.box, { marginTop: 10 }]}>
      <View style={styles.head}>
        <Feather name="info" size={16} color="#8A6A12" />
        <Text style={styles.title}>Replacement request</Text>
      </View>
      <Text style={styles.tx}>
        At pickup: {needsAffidavit(reason) ? 'receive the ' : 'collect the '}
        <Text style={styles.b}>{needsAffidavit(reason) ? 'affidavit of loss' : `${REPLACEMENT_FEE_TEXT} replacement fee`}</Text>
        {needsAffidavit(reason) ? <Text> and collect the <Text style={styles.b}>{REPLACEMENT_FEE_TEXT} replacement fee</Text></Text> : null}.
      </Text>
    </View>
  );
}

const pick = StyleSheet.create({
  head: { fontSize: 12, fontWeight: '800', color: '#8A6A12' },
  line: { fontSize: 13, color: '#5a4410', marginTop: 3, lineHeight: 18 },
});
