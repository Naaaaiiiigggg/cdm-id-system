import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Logo from './Logo';
import { useWideWindow } from '../utils/wide';
import { C, common } from '../theme';

const POINTS = [
  ['file-plus', 'Request a new or replacement ID online'],
  ['activity', 'Follow your request from submission to pickup'],
  ['bell', 'Get notes and updates from the Registrar'],
];

// Wraps the sign-in, register and forgot-password screens.
// Phone / narrow window: the same scrolling page as before.
// Wide browser window: a green brand panel on the left and the form in a card on the right.
export default function AuthShell({ children }) {
  const wide = useWideWindow();

  if (!wide) {
    return <ScrollView contentContainerStyle={common.pad} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={styles.brand}>
        <View style={styles.circleA} />
        <View style={styles.circleB} />
        <Text style={styles.sm}>COLEGIO DE MONTALBAN</Text>
        <Text style={styles.h}>Student Identification System</Text>
        <Text style={styles.sub}>ID ISSUANCE & REPLACEMENT</Text>
        <View style={styles.points}>
          {POINTS.map(([icon, text]) => (
            <View key={text} style={styles.point}>
              <View style={styles.pointIcon}><Feather name={icon} size={16} color={C.gold} /></View>
              <Text style={styles.pointTx}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <ScrollView contentContainerStyle={styles.formWrap} keyboardShouldPersistTaps="handled">
          <View style={styles.formBox}>{children}</View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flex: 1, backgroundColor: C.g9, justifyContent: 'center', padding: 64, overflow: 'hidden' },
  circleA: { position: 'absolute', width: 380, height: 380, borderRadius: 190, backgroundColor: 'rgba(255,255,255,0.04)', right: -120, top: -120 },
  circleB: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(242,194,48,0.08)', left: -80, bottom: -90 },
  sm: { color: C.gold, letterSpacing: 2, fontSize: 12, fontWeight: '700', marginTop: 14 },
  h: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 10, lineHeight: 44, maxWidth: 440 },
  sub: { color: '#CFE0D6', letterSpacing: 1.5, fontSize: 12, marginTop: 12 },
  points: { marginTop: 44, gap: 16 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pointIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  pointTx: { color: '#E4EFE9', fontSize: 14 },
  formWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  formBox: { width: '100%', maxWidth: 460, backgroundColor: C.sf, borderRadius: 20, borderWidth: 1, borderColor: C.ln, padding: 30 },
});
