import { StyleSheet, Text, View } from 'react-native';
import { CARD_H, CARD_W } from './cardSize';
import { longDate } from '../utils/format';
import { C } from '../theme';

function Row({ k, v }) {
  return (
    <View style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{(v || '—').toUpperCase()}</Text>
    </View>
  );
}

// Back of the ID: personal details, emergency contact, terms and the President's name.
// info = the student's Registrar record { birthdate, contact, address, guardian, guardianContact }.
export default function IdCardBack({ info = {}, style }) {
  return (
    <View style={[styles.card, style]}>
      <View>
        <View style={styles.box}>
          <Row k="BIRTHDAY:" v={longDate(info.birthdate)} />
          <Row k="CONTACT:" v={info.contact} />
          <Row k="ADDRESS:" v={info.address} />
          <Text style={styles.emerg}>IN CASE OF EMERGENCY, PLEASE NOTIFY:</Text>
          <Row k="GUARDIAN:" v={info.guardian} />
          <Row k="CONTACT:" v={info.guardianContact} />
        </View>

        <Text style={styles.terms}>Term &amp; Conditions:</Text>
        <Text style={styles.bullet}>• Wear this ID at all times while inside the premises of Colegio de Montalban.</Text>
        <Text style={styles.bullet}>• If found, please return to the Registrar's Office.</Text>
        </View>

      <View style={styles.pres}>
        <View style={styles.presLine} />
        <Text style={styles.presName}>DR. JOY U. MERCADO</Text>
        <Text style={styles.presRole}>CDM President</Text>
      </View>
      <View style={styles.stripe}><View style={styles.gold} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'center', width: CARD_W, height: CARD_H, justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.ln, marginTop: 12, elevation: 4 },
  box: { margin: 14, padding: 10, borderWidth: 1, borderColor: C.g7, borderRadius: 4 },
  row: { flexDirection: 'row', paddingVertical: 3, gap: 6 },
  k: { width: 74, fontSize: 9, fontWeight: '700', color: C.g7 },
  v: { flex: 1, fontSize: 10, fontWeight: '800', color: C.ink },
  emerg: { textAlign: 'center', fontSize: 9, fontWeight: '800', color: C.g7, marginVertical: 8 },
  terms: { fontSize: 12, fontWeight: '800', color: C.g7, textAlign: 'center', marginTop: 4 },
  bullet: { fontSize: 9.5, color: C.ink, paddingHorizontal: 18, marginTop: 4 },
  pres: { alignItems: 'center', marginBottom: 14 },
  presLine: { height: 1, width: 150, backgroundColor: C.ink },
  presName: { fontSize: 11, fontWeight: '800', color: C.g9, marginTop: 4 },
  presRole: { fontSize: 9, color: C.ink },
  stripe: { height: 16, backgroundColor: C.g9, justifyContent: 'flex-start' },
  gold: { height: 4, backgroundColor: C.gold },
});
