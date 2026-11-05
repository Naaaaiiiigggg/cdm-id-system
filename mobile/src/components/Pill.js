import { StyleSheet, Text, View } from 'react-native';
import { PILL } from '../theme';

export default function Pill({ s }) {
  return (
    <View style={[styles.pill, { backgroundColor: PILL[s][0] }]}>
      <Text style={[styles.tx, { color: PILL[s][1] }]}>{s}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start' },
  tx: { fontSize: 11, fontWeight: '800' },
});
