import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { C } from '../theme';

export default function Btn({ title, onPress, kind = 'main', style, disabled }) {
  return (
    <TouchableOpacity style={[styles.btn, kind === 'ghost' && styles.ghost, style]} onPress={onPress} activeOpacity={0.8} disabled={disabled}>
      <Text style={[styles.tx, kind === 'ghost' && { color: C.g7 }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: C.g9, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
  ghost: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln },
  tx: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
