import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../theme';

// Browser version of TimeField: the browser's own time picker (<input type="time">).
// Same props as the phone version. value / onChange use "HH:MM" (24-hour). '' means "not set".
export default function TimeField({ label, value, onChange }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.lbl}>{label}</Text>
      <input
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChange('')} style={{ alignSelf: 'flex-start', marginTop: 5 }}>
          <Text style={styles.clear}>Clear</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const input = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 46,
  padding: '10px 13px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: C.ink,
  backgroundColor: C.sf,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: C.ln,
  borderRadius: 12,
  outline: 'none',
  colorScheme: 'light',
};

const styles = StyleSheet.create({
  lbl: { fontSize: 12, fontWeight: '700', color: C.g7, marginTop: 13, marginBottom: 5 },
  clear: { fontSize: 12, color: C.g7, fontWeight: '700' },
});
