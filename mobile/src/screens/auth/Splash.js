import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Logo from '../../components/Logo';
import { C } from '../../theme';

export default function Splash({ onNext }) {
  return (
    <TouchableOpacity style={styles.wrap} activeOpacity={1} onPress={onNext}>
      <Logo />
      <Text style={styles.sm}>COLEGIO DE MONTALBAN</Text>
      <Text style={styles.h}>Student{'\n'}Identification System</Text>
      <Text style={styles.sub}>ID ISSUANCE & REPLACEMENT</Text>
      <Text style={[styles.sub, { marginTop: 40, opacity: 0.6 }]}>Tap to continue</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.g9, alignItems: 'center', justifyContent: 'center', padding: 24 },
  sm: { color: C.gold, letterSpacing: 2, fontSize: 11, marginTop: 14 },
  h: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8, lineHeight: 34 },
  sub: { color: '#CFE0D6', letterSpacing: 1.5, fontSize: 12, marginTop: 8 },
});
