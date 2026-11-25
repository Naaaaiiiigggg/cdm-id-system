import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import StudentForm from './StudentForm';
import { addStudent } from '../services/students';
import { friendly } from '../services/errors';
import { useWide } from '../utils/wide';
import { C, common } from '../theme';

// Pop-up form: add a student to the Registrar list. The student can then register with their number and birthdate.
export default function AddStudentModal({ visible, onClose, onSaved }) {
  const wide = useWide();
  const { height: winH } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!visible) return <Modal visible={false} transparent />;

  const save = async (data, studentNo) => {
    setBusy(true);
    setErr('');
    try {
      await addStudent(studentNo, data);
      setBusy(false);
      onSaved({ studentNo, name: data.name });
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const close = () => { if (!busy) { setErr(''); onClose(); } };

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <View style={[styles.backdrop, wide && { justifyContent: 'center' }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.kav, wide && { maxWidth: 560 }]}>
          <View style={[styles.sheet, { maxHeight: winH * 0.94 }, wide && { borderRadius: 22 }]}>
            <View style={common.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Add student</Text>
                <Text style={common.mu}>The student can register once they are on this list.</Text>
              </View>
              <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={C.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
              <StudentForm isNew busy={busy} error={err} submitLabel="Add student" onSubmit={save} onCancel={close} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', alignItems: 'center' },
  kav: { width: '100%', maxWidth: 480 },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 30 },
  title: { fontSize: 18, fontWeight: '800', color: C.ink },
});
