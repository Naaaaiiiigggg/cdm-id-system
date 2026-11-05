import { StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';

export default function Logo({ size = 124 }) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.tx, { fontSize: size * 0.27 }]}>CdM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { backgroundColor: C.g9, borderWidth: 4, borderColor: C.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  tx: { color: '#fff', fontWeight: '800' },
});
