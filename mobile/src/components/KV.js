import { StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';

export default function KV({ k, v }) {
  return (
    <View style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 4 },
  k: { width: 100, color: C.mu, fontSize: 13 },
  v: { flex: 1, fontWeight: '600', color: C.ink, fontSize: 13 },
});
