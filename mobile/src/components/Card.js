import { StyleSheet, View } from 'react-native';
import { C } from '../theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 16, padding: 14, marginTop: 12 },
});
