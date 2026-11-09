import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Btn from './Btn';
import { time12 } from '../utils/format';
import { C } from '../theme';

const pad = (n) => String(n).padStart(2, '0');
const toStr = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Opens a clock. value / onChange use "HH:MM" (24-hour). An empty string means "not set".
export default function TimeField({ label, value, onChange, placeholder = 'Optional' }) {
  const [showIos, setShowIos] = useState(false);
  const base = new Date();
  if (value) {
    const [h, m] = value.split(':');
    base.setHours(Number(h), Number(m), 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: base, mode: 'time', is24Hour: false,
        onChange: (e, d) => { if (e.type === 'set' && d) onChange(toStr(d)); },
      });
    } else {
      setShowIos(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.lbl}>{label}</Text>
      <View style={styles.fld}>
        <TouchableOpacity style={{ flex: 1 }} onPress={open} activeOpacity={0.8}>
          <Text style={[styles.tx, !value && { color: '#9AA89F' }]}>{value ? time12(value) : placeholder}</Text>
        </TouchableOpacity>
        {value ? (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={16} color={C.mu} />
          </TouchableOpacity>
        ) : (
          <Feather name="clock" size={16} color={C.g7} />
        )}
      </View>
      {showIos && (
        <View>
          <DateTimePicker value={base} mode="time" display="spinner" onChange={(e, d) => { if (d) onChange(toStr(d)); }} />
          <Btn title="Done" onPress={() => setShowIos(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lbl: { fontSize: 12, fontWeight: '700', color: C.g7, marginTop: 13, marginBottom: 5 },
  fld: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.ln, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 13, backgroundColor: C.sf },
  tx: { fontSize: 14, color: C.ink },
});
