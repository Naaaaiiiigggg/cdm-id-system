import { Fragment, useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Pill from './Pill';
import Btn from './Btn';
import Field from './Field';
import DateField from './DateField';
import TimeField from './TimeField';
import IdCard from './IdCard';
import IdCardBack from './IdCardBack';
import { ReplacementAdminReminder } from './ReplacementNotice';
import { getMySignature, updateRequest } from '../services/requests';
import { friendly } from '../services/errors';
import { formatDate, todayStr } from '../utils/format';
import { programName } from '../data/programs';
import { REJECT_REASONS, TEMPLATES } from '../data/templates';
import { useWide } from '../utils/wide';
import { confirmDialog } from '../utils/dialog';
import { PRINT_STAGES, canReject, confirmCopy, forwardStage, isFinal } from '../data/stageRules';
import { C, STATUSES, common } from '../theme';

const MAX_NOTE = 200;
const MAX_BRING = 100;
const defaultBring = (req) => (req.type === 'Replacement' && /lost|stolen/i.test(req.reason || '') ? 'Valid ID and Affidavit of Loss' : 'Valid ID');

const Chips = ({ items, onPick }) => (
  <View style={styles.chips}>
    {items.map((t) => (
      <TouchableOpacity key={t.label} style={styles.chip} onPress={() => onPick(t.text)} activeOpacity={0.8}>
        <Feather name="zap" size={12} color={C.g7} />
        <Text style={styles.chipTx}>{t.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Pop-up for the Registrar to manage one request.
// The main button moves it to the next allowed stage, after a confirmation. There is no way to skip or go back
// (see data/stageRules.js). Reject is only offered before Approved, and a Claimed request is final.
// request = the request document, student = that student's Registrar record.
export default function ManageRequestModal({ request, student = {}, onClose, onSaved }) {
  const wide = useWide();
  const { height: winH } = useWindowDimensions();
  const [mode, setMode] = useState('move'); // move | reject
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [pDate, setPDate] = useState('');
  const [pFrom, setPFrom] = useState('');
  const [pTo, setPTo] = useState('');
  const [pBring, setPBring] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [showId, setShowId] = useState(false);
  const [side, setSide] = useState('front');
  const [sig, setSig] = useState(undefined); // undefined = still loading, null = the student has not signed

  useEffect(() => {
    if (request) {
      setMode('move');
      setStatus(forwardStage(request.status));
      setNote('');
      setPDate(request.pickupDate || '');
      setPFrom(request.pickupFrom || '');
      setPTo(request.pickupTo || '');
      setPBring(request.pickupBring ?? defaultBring(request));
      setErr('');
      setBusy(false);
      setShowId(false);
      setSide('front');
      setSig(undefined);
      // the signature the student drew (the admin is allowed to read it)
      getMySignature(request.studentNo).then(setSig).catch(() => setSig(null));
    }
  }, [request?.id]);

  if (!request) return <Modal visible={false} transparent />;

  const final = isFinal(request.status);
  const sel = STATUSES.indexOf(status);
  const moving = status !== request.status;
  const trimmed = note.trim();
  const needsPickup = status === 'Ready for Pickup';
  const pickupChanged = needsPickup && !moving && (
    pDate !== (request.pickupDate || '') || pFrom !== (request.pickupFrom || '')
    || pTo !== (request.pickupTo || '') || pBring.trim() !== (request.pickupBring || '')
  );
  const changed = moving || trimmed !== (request.adminNote || '') || pickupChanged;

  // The ID can't be printed (or handed out) without the Registrar photo and the student's signature.
  const missing = [!student.photo && 'the photo has not been uploaded', sig === null && 'the student has not signed yet'].filter(Boolean);
  const blocked = moving && PRINT_STAGES.includes(status) && (sig === undefined || missing.length > 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDay = new Date(today);
  lastDay.setFullYear(lastDay.getFullYear() + 1);

  const save = async (target) => {
    if (target === 'Rejected' && !trimmed) return setErr('Please give a reason. Tap a quick reason or write your own.');
    let pickup = null;
    if (target === 'Ready for Pickup') {
      if (!pDate) return setErr('Pick the pickup date. The student needs it to know when to come.');
      if (pDate !== request.pickupDate && pDate < todayStr()) return setErr('The pickup date cannot be in the past.');
      if (pFrom && pTo && pTo <= pFrom) return setErr('The end time must be later than the start time.');
      pickup = { date: pDate, from: pFrom, to: pTo, bring: pBring.trim() };
    }
    // Ask before every stage move (a note-only or pickup-only change needs no confirmation).
    if (target !== request.status && !(await confirmDialog(confirmCopy(request.status, target)))) return;
    setBusy(true);
    setErr('');
    try {
      await updateRequest(request, { status: target, note: trimmed, pickup });
      onSaved?.();
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const goReject = () => { setMode('reject'); setNote(''); setErr(''); };
  const cancelReject = () => { setMode('move'); setNote(''); setErr(''); };

  const label = busy ? 'Saving…' : moving ? (request.status === 'Rejected' ? `Reopen as ${status} →` : `Move to ${status} →`) : 'Save changes';
  const off = busy || !changed || blocked;

  const sideBySide = wide && showId;
  const Row = sideBySide ? View : Fragment;
  const rowProps = sideBySide ? { style: { flexShrink: 1, flexDirection: 'row', gap: 20 } } : {};
  const previewBlock = showId ? (
                <View style={{ marginTop: 6 }}>
                  {sideBySide ? null : (
                  <View style={[styles.seg, sideBySide && { alignSelf: 'center', width: 200, marginTop: 14 }]}>
                    {['front', 'back'].map((sd) => (
                      <TouchableOpacity key={sd} style={[styles.segBtn, sideBySide && { paddingVertical: 6 }, side === sd && styles.segOn]} onPress={() => setSide(sd)}>
                        <Text style={[styles.segTx, side === sd && { color: C.ink }]}>{sd === 'front' ? 'Front' : 'Back'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  )}
                  {side === 'front'
                    ? <IdCard name={student.name || request.studentNo} studentNo={request.studentNo} program={student.program} photo={student.photo} signature={sig || null} />
                    : <IdCardBack info={student} />}
                  {sideBySide ? (
                  <View style={[styles.seg, sideBySide && { alignSelf: 'center', width: 200, marginTop: 14 }]}>
                    {['front', 'back'].map((sd) => (
                      <TouchableOpacity key={sd} style={[styles.segBtn, sideBySide && { paddingVertical: 6 }, side === sd && styles.segOn]} onPress={() => setSide(sd)}>
                        <Text style={[styles.segTx, side === sd && { color: C.ink }]}>{sd === 'front' ? 'Front' : 'Back'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  ) : null}
                  {sig !== undefined && missing.length ? (
                    <View style={[common.note, { marginBottom: 0 }]}>
                      <Text style={common.noteTx}>Not ready to print: {missing.join(' and ')}.</Text>
                    </View>
                  ) : null}
                </View>
  ) : null;

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={[styles.backdrop, wide && { justifyContent: 'center' }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.kav, wide && { maxWidth: sideBySide ? 940 : 640 }]}>
          <View style={[styles.sheet, { maxHeight: winH * 0.92 }, wide && { borderRadius: 22 }]}>
            <View style={common.rowBetween}>
              <View>
                <Text style={styles.title}>Manage request</Text>
                <Text style={common.mu}>{request.requestNo}</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={C.ink} />
              </TouchableOpacity>
            </View>

            <Row {...rowProps}>
            <ScrollView style={sideBySide ? { flex: 1 } : undefined} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
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
                {request.type === 'Replacement' ? <ReplacementAdminReminder reason={request.reason} /> : null}
              </View>

              {/* ID preview (works for New ID and Replacement requests) */}
              <TouchableOpacity style={styles.previewBtn} onPress={() => { setSide('front'); setShowId(!showId); }} activeOpacity={0.85}>
                <Feather name={showId ? 'eye-off' : 'eye'} size={16} color="#fff" />
                <Text style={styles.previewTx}>{showId ? 'Hide ID preview' : 'Preview ID'}</Text>
              </TouchableOpacity>
              {!sideBySide ? previewBlock : null}

              {mode === 'reject' ? (
                /* ---------------- reject ---------------- */
                <>
                  <Text style={styles.sec}>Reject this request</Text>
                  <Text style={common.mu}>Tap a quick reason or write your own. The student will see it.</Text>
                  <Chips items={REJECT_REASONS} onPick={setNote} />
                  <TextInput
                    style={styles.input} multiline maxLength={MAX_NOTE} value={note} onChangeText={setNote}
                    placeholder="Reason for rejecting" placeholderTextColor="#9AA89F"
                  />
                  <Text style={[common.mu, { textAlign: 'right', marginTop: 4 }]}>{note.length}/{MAX_NOTE}</Text>
                  <Text style={common.err}>{err}</Text>
                  <Btn title={busy ? 'Saving…' : 'Reject request'} onPress={() => save('Rejected')} disabled={busy} style={[{ backgroundColor: C.bad }, busy && { opacity: 0.45 }]} />
                  <TouchableOpacity onPress={busy ? undefined : cancelReject}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                </>
              ) : final ? (
                /* ---------------- Claimed: final ---------------- */
                <View style={[common.note, { marginTop: 18 }]}>
                  <Text style={common.noteTx}>This request is Claimed. The ID was already handed out, so it can't be changed.</Text>
                </View>
              ) : (
                /* ---------------- move to a stage ---------------- */
                <>
                  <Text style={styles.sec}>{request.status === 'Rejected' ? 'Reopen this request' : moving ? 'Move to the next step' : 'This request is on this step'}</Text>
                  {request.status === 'Rejected' ? <Text style={[common.mu, { color: C.bad }]}>This request was rejected. Reopen it to continue.</Text> : null}
                  <View style={styles.bars}>
                    {STATUSES.map((n, i) => (
                      <View key={n} style={[styles.bar, i < sel && { backgroundColor: C.g9 }, i === sel && { backgroundColor: C.gold }]} />
                    ))}
                  </View>
                  <Text style={styles.stepTx}>The student will see: Step {sel + 1} of {STATUSES.length} · {status}</Text>

                  {blocked && missing.length ? (
                    <View style={[common.note, { marginTop: 0 }]}>
                      <Text style={common.noteTx}>Can't move to {status} yet: {missing.join(' and ')}.</Text>
                    </View>
                  ) : null}

                  {needsPickup ? (
                    <View style={styles.pickup}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Feather name="calendar" size={16} color={C.g7} />
                        <Text style={styles.pickupHead}>Pickup details</Text>
                      </View>
                      <DateField label="Pickup date (required)" placeholder="Select the pickup date" value={pDate} onChange={setPDate} minimumDate={today} maximumDate={lastDay} initialDate={today} />
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TimeField label="From (optional)" value={pFrom} onChange={setPFrom} />
                        <TimeField label="To (optional)" value={pTo} onChange={setPTo} />
                      </View>
                      <Field label="What to bring (optional)" placeholder="e.g. Valid ID" value={pBring} onChangeText={setPBring} maxLength={MAX_BRING} autoCapitalize="sentences" />
                      <Chips items={[{ label: 'Valid ID', text: 'Valid ID' }, { label: 'Valid ID + Affidavit', text: 'Valid ID and Affidavit of Loss' }]} onPick={setPBring} />
                    </View>
                  ) : null}

                  <Text style={styles.sec2}>Note to the student {needsPickup ? '(optional)' : ''}</Text>
                  {(TEMPLATES[status] || []).length ? <Chips items={TEMPLATES[status]} onPick={setNote} /> : null}
                  <TextInput
                    style={styles.input} multiline maxLength={MAX_NOTE} value={note} onChangeText={setNote}
                    placeholder="Optional. Tap a ready-made note above, or write your own." placeholderTextColor="#9AA89F"
                  />
                  <Text style={[common.mu, { textAlign: 'right', marginTop: 4 }]}>{note.length}/{MAX_NOTE}</Text>

                  <Text style={common.err}>{err}</Text>
                  <Btn title={label} onPress={() => save(status)} disabled={off} style={off && { opacity: 0.45 }} />

                  {canReject(request.status) ? (
                    <TouchableOpacity onPress={busy ? undefined : goReject}>
                      <Text style={styles.reject}>Reject this request</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </ScrollView>
            {sideBySide ? (
              <ScrollView style={{ width: 330, flexGrow: 0, flexShrink: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
                {previewBlock}
              </ScrollView>
            ) : null}
            </Row>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', alignItems: 'center' },
  kav: { width: '100%', maxWidth: 480 },
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
  sec2: { fontSize: 14, fontWeight: '800', color: C.ink, marginTop: 14, marginBottom: 8 },
  bars: { flexDirection: 'row', gap: 4, marginTop: 4 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.ln },
  stepTx: { fontSize: 11, color: C.mu, fontWeight: '600', marginTop: 6, marginBottom: 8 },
  pickup: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.gold, borderRadius: 14, padding: 14, marginTop: 4 },
  pickupHead: { fontSize: 14, fontWeight: '800', color: C.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.ln, backgroundColor: C.sf, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 11 },
  chipTx: { fontSize: 12, fontWeight: '700', color: C.g7 },
  input: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 12, padding: 12, minHeight: 84, textAlignVertical: 'top', fontSize: 14, color: C.ink },
  reject: { color: C.bad, fontWeight: '700', textAlign: 'center', marginTop: 12, marginBottom: 4 },
  cancel: { color: C.mu, fontWeight: '700', textAlign: 'center', marginTop: 14, marginBottom: 4 },
});
