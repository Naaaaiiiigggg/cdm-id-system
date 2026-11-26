import { useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import StudentForm from './StudentForm';
import PhotoUploader from './PhotoUploader';
import { addStudent } from '../services/students';
import { friendly } from '../services/errors';
import { useWide } from '../utils/wide';
import { C, common } from '../theme';

// Pop-up form: add a student to the Registrar list. The student can then register with their number and birthdate.
// In the browser the Registrar also chooses the student's ID photo here (required), so it is saved in the same step.
export default function AddStudentModal({ visible, onClose, onSaved }) {
  const wide = useWide();
  const { height: winH } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [photo, setPhoto] = useState('');      // the cropped photo (a JPEG data URI), or '' for none
  const [picking, setPicking] = useState(false); // true while the photo chooser is shown instead of the form

  if (!visible) return <Modal visible={false} transparent />;

  const save = async (data, studentNo) => {
    // The ID cannot be printed without a photo, so it is required here (in the browser, where the photo can be chosen).
    if (Platform.OS === 'web' && !photo) {
      setErr("Add the student's photo first. It is needed to print the ID.");
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await addStudent(studentNo, data, photo);
      setBusy(false);
      setPhoto('');
      onSaved({ studentNo, name: data.name });
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const close = () => { if (!busy) { setErr(''); setPhoto(''); setPicking(false); onClose(); } };

  const photoSlot = Platform.OS === 'web' ? (
    <View style={[styles.photoRow, !photo && /photo/i.test(err) && { borderColor: '#B42318' }]}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}><Feather name="camera" size={20} color={C.mu} /></View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.photoLbl}>Photo (required)</Text>
        <Text style={common.mu}>{photo ? 'Photo ready. It is saved together with the student.' : 'Needed to print the ID.'}</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={() => setPicking(true)} disabled={busy}>
          <Text style={styles.photoBtnTx}>{photo ? 'Change photo' : 'Add photo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

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
              {/* The form stays mounted (just hidden) while the photo is chosen, so nothing typed is lost. */}
              <View style={picking ? { display: 'none' } : null}>
                <StudentForm isNew busy={busy} error={err} submitLabel="Add student" onSubmit={save} onCancel={close} photoSlot={photoSlot} />
              </View>
              {picking ? (
                <PhotoUploader currentPhoto={photo} onPick={(uri) => { setPhoto(uri); setPicking(false); }} onCancel={() => setPicking(false)} />
              ) : null}
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
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14, padding: 12, backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 14 },
  thumb: { width: 64, height: 80, borderRadius: 8, backgroundColor: '#E8ECF0' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  photoLbl: { fontSize: 13, fontWeight: '800', color: C.ink, marginBottom: 2 },
  photoBtn: { alignSelf: 'flex-start', marginTop: 8, borderWidth: 1, borderColor: C.g9, borderRadius: 12, paddingVertical: 7, paddingHorizontal: 14 },
  photoBtnTx: { color: C.g9, fontWeight: '700', fontSize: 13 },
});
