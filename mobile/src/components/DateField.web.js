import { StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { WEB_FONT, ensureInputStyle } from '../utils/webInput';

ensureInputStyle();

// Browser version of DateField: the browser's own date picker (<input type="date">).
// Metro uses this file on the web and DateField.js on phones. Same props, same "YYYY-MM-DD" text.
const pad = (n) => String(n).padStart(2, '0');
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const nice = (t) => new Date(`${t}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function DateField({ label, placeholder, value, onChange, minimumDate, maximumDate }) {
  const min = minimumDate === undefined ? new Date(1950, 0, 1) : minimumDate;
  const max = maximumDate === undefined ? new Date() : maximumDate;
  const minText = min ? toStr(min) : undefined;
  const maxText = max ? toStr(max) : undefined;
  const outOfRange = !!value && ((minText && value < minText) || (maxText && value > maxText));

  return (
    <View>
      <Text style={styles.lbl}>{label}</Text>
      <input
        type="date"
        className={value ? 'cdm-input cdm-has' : 'cdm-input'}
        data-ph={placeholder || 'Select a date'}
        value={value || ''}
        min={minText}
        max={maxText}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...input, ...(outOfRange ? { borderColor: C.bad } : null) }}
      />
      {outOfRange ? (
        <Text style={styles.warn}>Choose a date between {minText ? nice(minText) : '…'} and {maxText ? nice(maxText) : '…'}.</Text>
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
  fontFamily: WEB_FONT,
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
  warn: { fontSize: 12, color: C.bad, marginTop: 5 },
});
