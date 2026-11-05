import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';

// Password fields (secureTextEntry) get a show/hide eye automatically.
export default function Field({ label, secureTextEntry, style, ...props }) {
  const [hidden, setHidden] = useState(true);
  if (!secureTextEntry) {
    return (
      <View>
        <Text style={styles.lbl}>{label}</Text>
        <TextInput style={[styles.fld, style]} placeholderTextColor="#9AA89F" autoCapitalize="none" {...props} />
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.lbl}>{label}</Text>
      <View>
        <TextInput
          style={[styles.fld, { paddingRight: 44 }, style]} placeholderTextColor="#9AA89F" autoCapitalize="none"
          autoCorrect={false} secureTextEntry={hidden} {...props}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setHidden((h) => !h)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name={hidden ? 'eye' : 'eye-off'} size={18} color={C.g7} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lbl: { fontSize: 12, fontWeight: '700', color: C.g7, marginTop: 13, marginBottom: 5 },
  fld: { borderWidth: 1, borderColor: C.ln, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 13, backgroundColor: C.sf, color: C.ink, fontSize: 14 },
  eye: { position: 'absolute', right: 13, top: 0, bottom: 0, justifyContent: 'center' },
});
