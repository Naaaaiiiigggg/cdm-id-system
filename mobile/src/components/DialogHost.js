import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { registerDialogHost } from '../utils/dialog';
import { C } from '../theme';

// Draws the confirm / message pop-ups in a browser. Mount it once, near the top of App.js.
export default function DialogHost() {
  const [d, setD] = useState(null);
  useEffect(() => registerDialogHost(setD), []);
  if (!d) return null;

  const close = (value) => {
    const done = d.resolve;
    setD(null);
    done?.(value);
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => close(false)}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)} />
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{d.title}</Text>
          {d.message ? <Text style={styles.msg}>{d.message}</Text> : null}
          <View style={styles.row}>
            {d.cancelText ? (
              <Pressable style={({ hovered }) => [styles.btn, styles.ghost, hovered && { backgroundColor: C.g1 }]} onPress={() => close(false)}>
                <Text style={styles.ghostTx}>{d.cancelText}</Text>
              </Pressable>
            ) : null}
            <Pressable style={({ hovered }) => [styles.btn, d.destructive && { backgroundColor: C.bad }, hovered && { opacity: 0.9 }]} onPress={() => close(true)}>
              <Text style={styles.tx}>{d.confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 380, backgroundColor: C.bg, borderRadius: 18, padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: C.ink },
  msg: { fontSize: 14, color: C.mu, marginTop: 8, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  btn: { backgroundColor: C.g9, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 18 },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.ln },
  tx: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ghostTx: { color: C.g7, fontWeight: '700', fontSize: 14 },
});
