import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Btn from './Btn';
import { C } from '../theme';

const pad = (n) => String(n).padStart(2, '0');
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Opens a calendar. value / onChange use the text "YYYY-MM-DD".
// Optional: minimumDate, maximumDate, initialDate (defaults suit a birthdate).
export default function DateField({ label, value, onChange, placeholder = 'Select a date', minimumDate, maximumDate, initialDate }) {
  const [showIos, setShowIos] = useState(false);
  const min = minimumDate === undefined ? new Date(1950, 0, 1) : minimumDate;
  const max = maximumDate === undefined ? new Date() : maximumDate;
  const date = value ? new Date(`${value}T00:00:00`) : (initialDate || new Date(2005, 0, 1));
  const shown = value ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}` : '';

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date, mode: 'date', maximumDate: max, minimumDate: min,
        onChange: (e, d) => { if (e.type === 'set' && d) onChange(toStr(d)); },
      });
    } else {
      setShowIos(true);
    }
  };

  return (
    <View>
      <Text style={styles.lbl}>{label}</Text>
      <TouchableOpacity style={styles.fld} onPress={open} activeOpacity={0.8}>
        <Text style={[styles.tx, !shown && { color: '#9AA89F' }]}>{shown || placeholder}</Text>
        <Feather name="calendar" size={18} color={C.g7} />
      </TouchableOpacity>
      {showIos && (
        <View>
          <DateTimePicker
            value={date} mode="date" display="inline"
            maximumDate={max} minimumDate={min}
            onChange={(e, d) => { if (d) onChange(toStr(d)); }}
          />
          <Btn title="Done" onPress={() => setShowIos(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lbl: { fontSize: 12, fontWeight: '700', color: C.g7, marginTop: 13, marginBottom: 5 },
  fld: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: C.ln, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 13, backgroundColor: C.sf },
  tx: { fontSize: 14, color: C.ink },
});
