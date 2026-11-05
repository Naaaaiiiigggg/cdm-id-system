import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Logo from './Logo';
import SignatureView from './SignatureView';
import { CARD_H, CARD_W } from './cardSize';
import { PROGRAMS } from '../data/programs';
import { C } from '../theme';

// Front of the ID (standard PVC card proportions). photo is a data URI from the Registrar;
// signature is { path, box } drawn by the student.
export default function IdCard({ name, studentNo, program, photo, signature, style }) {
  const course = (PROGRAMS[program]?.name || program || '').toUpperCase();
  return (
    <View style={[styles.card, style]}>
      <View style={styles.head}>
        <Logo size={34} />
        <Text style={styles.school}>COLEGIO DE MONTALBAN</Text>
      </View>

      <View style={styles.body}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.noPhoto]}>
            <Feather name="user" size={46} color="#9AA89F" />
            <Text style={styles.noPhotoTx}>Photo not uploaded yet</Text>
          </View>
        )}

        <View style={{ alignItems: 'center', paddingHorizontal: 14 }}>
          <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>{name.toUpperCase()}</Text>
          <Text style={styles.no}>STUDENT NUMBER: {studentNo}</Text>
          <Text style={styles.course} numberOfLines={3}>{course}</Text>
        </View>

        <View style={styles.sigBox}>
          <View style={styles.sigArea}>
            {signature ? <SignatureView sig={signature} width={170} height={52} /> : <Text style={styles.noSig}>Signature not added yet</Text>}
          </View>
          <View style={styles.sigLine} />
          <Text style={styles.sigCap}>Student Signature</Text>
        </View>
      </View>

      <View style={styles.stripe}><View style={styles.gold} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'center', width: CARD_W, height: CARD_H, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.ln, marginTop: 12, elevation: 4 },
  head: { backgroundColor: C.g9, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 56 },
  school: { color: '#fff', fontWeight: '800', fontSize: 14, flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly' },
  photo: { width: 136, height: 170, borderRadius: 8, backgroundColor: '#E8ECF0' },
  noPhoto: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  noPhotoTx: { fontSize: 10, color: '#7B8A82' },
  name: { fontSize: 19, fontWeight: '800', color: C.g9, textAlign: 'center' },
  no: { marginTop: 5, fontSize: 11, fontWeight: '700', color: C.ink },
  course: { marginTop: 5, fontSize: 9.5, lineHeight: 12, fontWeight: '600', color: C.ink, textAlign: 'center' },
  sigBox: { width: 170, alignItems: 'center' },
  sigArea: { height: 52, justifyContent: 'center' },
  noSig: { fontSize: 10, color: '#9AA89F' },
  sigLine: { height: 1, backgroundColor: C.ink, width: 170, marginTop: 2 },
  sigCap: { fontSize: 9, color: C.mu, marginTop: 3 },
  stripe: { height: 16, backgroundColor: C.g9 },
  gold: { height: 4, backgroundColor: C.gold },
});
