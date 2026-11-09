import { useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Pill from './Pill';
import Btn from './Btn';
import IdCard from './IdCard';
import IdCardBack from './IdCardBack';
import { getMySignature, updateRequest } from '../services/requests';
import { friendly } from '../services/errors';
import { formatDate } from '../utils/format';
import { programName } from '../data/programs';
import { C, STATUSES, common } from '../theme';

const MAX_NOTE = 200;

// Pop-up for the Registrar to manage one request: pick the stage, write a note to the student, save.
// request = the request document, student = that student's Registrar record.
export default function ManageRequestModal({ request, student = {}, onClose, onSaved }) {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [showId, setShowId] = useState(false);
  const [side, setSide] = useState('front');
  const [sig, setSig] = useState(null);

  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setNote(request.adminNote || '');
      setErr('');
      setBusy(false);
      setShowId(false);
      setSide('front');
      setSig(null);
      // the signature the student drew (the admin is allowed to read it)
      getMySignature(request.studentNo).then(setSig).catch(() => setSig(null));
    }
  }, [request?.id]);

  if (!request) return <Modal visible={false} transparent />;

  const cur = STATUSES.indexOf(request.status);
  const sel = STATUSES.indexOf(status);
  const trimmed = note.trim();
  const changed = status !== request.status || trimmed !== (request.adminNote || '');

  const save = async (target) => {
    if (target === 'Rejected' && !trimmed) return setErr('Please write a note that explains why the request is rejected.');
    setBusy(true);
    setErr('');
    try {
      await updateRequest(request, { status: target, note: trimmed });
      onSaved?.();
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <View style={styles.sheet}>
            <View style={common.rowBetween}>
              <View>
                <Text style={styles.title}>Manage request</Text>
                <Text style={common.mu}>{request.requestNo}</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={C.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
              {/* student + request details */}
              <View style={styles.box}>
                <Text style={common.bold}>{student.name || request.studentNo}</Text>
                <Text style={common.mu}>
                  {request.studentNo}{student.program ? ` · ${programName(student.program)}` : ''}{student.yearLevel ? ` · ${student.yearLevel}` : ''}
                </Text>
                {student.contact ? <Text style={[common.mu, { marginTop: 2 }]}>Contact: {student.contact}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  <Pill s={request.type} />
                  <Pill s={request.status} />
                </View>
                {request.reason ? <Text style={[common.mu, { marginTop: 8 }]}>Reason: <Text style={{ color: C.ink, fontWeight: '600' }}>{request.reason}</Text></Text> : null}
                <Text style={common.mu}>Submitted: {formatDate(request.createdAt)}</Text>
              </View>

              {/* ID preview (works for New ID and Replacement requests) */}
              <TouchableOpacity style={styles.previewBtn} onPress={() => { setSide('front'); setShowId(!showId); }} activeOpacity={0.85}>
                <Feather name={showId ? 'eye-off' : 'eye'} size={16} color="#fff" />
                <Text style={styles.previewTx}>{showId ? 'Hide ID preview' : 'Preview ID'}</Text>
              </TouchableOpacity>
              {showId ? (
                <View style={{ marginTop: 6 }}>
                  <View style={styles.seg}>
                    {['front', 'back'].map((sd) => (
                      <TouchableOpacity key={sd} style={[styles.segBtn, side === sd && styles.segOn]} onPress={() => setSide(sd)}>
                        <Text style={[styles.segTx, side === sd && { color: C.ink }]}>{sd === 'front' ? 'Front' : 'Back'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {side === 'front'
                    ? <IdCard name={student.name || request.studentNo} studentNo={request.studentNo} program={student.program} photo={student.photo} signature={sig} />
                    : <IdCardBack info={student} />}
                  {!student.photo || !sig ? (
                    <View style={[common.note, { marginBottom: 0 }]}>
                      <Text style={common.noteTx}>
                        Not ready to print: {[!student.photo && 'the photo has not been uploaded', !sig && 'the student has not signed yet'].filter(Boolean).join(' and ')}.
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* stage picker */}
              <Text style={styles.sec}>Set the stage</Text>
              {request.status === 'Rejected' ? <Text style={[common.mu, { color: C.bad }]}>This request was rejected. Pick a stage to reopen it.</Text> : null}
              <View style={styles.bars}>
                {STATUSES.map((n, i) => (
                  <View key={n} style={[styles.bar, i < sel && { backgroundColor: C.g9 }, i === sel && { backgroundColor: C.gold }]} />
                ))}
              </View>
              <Text style={styles.stepTx}>
                {sel >= 0 ? `The student will see: Step ${sel + 1} of ${STATUSES.length} · ${status}` : 'Pick a stage below'}
              </Text>

              {STATUSES.map((name, i) => {
                const on = status === name;
                const done = sel >= 0 && i < sel;
                return (
                  <TouchableOpacity key={name} activeOpacity={0.8} onPress={() => setStatus(name)} style={[styles.step, on && styles.stepOn]}>
                    <View style={[styles.dot, done && styles.dotDone, on && styles.dotOn]}>
                      {done ? <Feather name="check" size={13} color="#fff" /> : <Text style={{ fontSize: 11, fontWeight: '800', color: on ? C.g9 : C.mu }}>{i + 1}</Text>}
                    </View>
                    <Text style={[styles.stepName, on && { color: C.ink, fontWeight: '800' }]}>{name}</Text>
                    {i === cur ? <Text style={styles.curTag}>Current</Text> : null}
                    {on ? <Feather name="check-circle" size={18} color={C.g7} /> : null}
                  </TouchableOpacity>
                );
              })}

              {/* note to the student */}
              <Text style={styles.sec}>Note to the student</Text>
              <TextInput
                style={styles.input}
                multiline
                maxLength={MAX_NOTE}
                value={note}
                onChangeText={setNote}
                placeholder="Optional. For example: Please bring a valid ID when you claim."
                placeholderTextColor="#9AA89F"
              />
              <Text style={[common.mu, { textAlign: 'right', marginTop: 4 }]}>{note.length}/{MAX_NOTE}</Text>

              <Text style={common.err}>{err}</Text>
              <Btn title={busy ? 'Saving…' : 'Save changes'} onPress={() => save(status)} disabled={busy || !changed} style={(!changed || busy) && { opacity: 0.45 }} />
              {request.status !== 'Rejected' ? (
                <TouchableOpacity onPress={busy ? undefined : () => save('Rejected')}>
                  <Text style={styles.reject}>Reject this request</Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  kav: { width: '100%' },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 30, maxHeight: Dimensions.get('window').height * 0.92 },
  title: { fontSize: 18, fontWeight: '800', color: C.ink },
  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.g9, borderRadius: 12, paddingVertical: 12, marginTop: 12 },
  previewTx: { color: '#fff', fontWeight: '700', fontSize: 14 },
  seg: { flexDirection: 'row', backgroundColor: C.g1, borderRadius: 12, padding: 4, marginTop: 6 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segOn: { backgroundColor: '#fff' },
  segTx: { fontWeight: '700', color: C.mu, fontSize: 13 },
  box: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 14, padding: 14, marginTop: 14 },
  sec: { fontSize: 14, fontWeight: '800', color: C.ink, marginTop: 18, marginBottom: 8 },
  bars: { flexDirection: 'row', gap: 4, marginTop: 4 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.ln },
  stepTx: { fontSize: 11, color: C.mu, fontWeight: '600', marginTop: 6, marginBottom: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  stepOn: { backgroundColor: C.sf, borderColor: C.gold },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.ln, backgroundColor: C.sf, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: C.g9, borderColor: C.g9 },
  dotOn: { borderColor: C.gold },
  stepName: { flex: 1, fontSize: 14, color: C.mu },
  curTag: { fontSize: 10, fontWeight: '800', color: C.g7, backgroundColor: C.g1, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7, overflow: 'hidden' },
  input: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 12, padding: 12, minHeight: 84, textAlignVertical: 'top', fontSize: 14, color: C.ink },
  reject: { color: C.bad, fontWeight: '700', textAlign: 'center', marginTop: 16, marginBottom: 4 },
});
