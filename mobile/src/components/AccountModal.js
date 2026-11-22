import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Pill from './Pill';
import Btn from './Btn';
import DateField from './DateField';
import { sendReset } from '../services/auth';
import { reactivateAccount, suspendAccount } from '../services/students';
import { friendly } from '../services/errors';
import { programName } from '../data/programs';
import { EMAIL_RE } from '../utils/format';
import { useWide } from '../utils/wide';
import {
  DEFAULT_PERM_MSG, DEFAULT_TEMP_MSG, DURATIONS, MAX_MESSAGE, MAX_REASON, SUSPEND_REASONS, fmtLong, studentNotice,
} from '../utils/suspension';
import { C, common } from '../theme';

const pad = (n) => String(n).padStart(2, '0');
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function Row({ k, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <View style={{ flex: 1 }}>{typeof children === 'string' || typeof children === 'number' ? <Text style={styles.v}>{String(children)}</Text> : children}</View>
    </View>
  );
}

// Pop-up for one student account: their info, send a reset link, suspend or reactivate.
// Confirmations and messages are shown inside this pop-up (not as separate dialogs).
export default function AccountModal({ account, onClose, onChanged }) {
  const wide = useWide();
  const { height: winH } = useWindowDimensions();
  const [mode, setMode] = useState('view'); // view | suspend | reactivate
  const [reason, setReason] = useState('');
  const [dur, setDur] = useState('7d');
  const [custom, setCustom] = useState('');
  const [msg, setMsg] = useState(DEFAULT_TEMP_MSG);
  const [msgEdited, setMsgEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [sent, setSent] = useState(false);

  // a fresh pop-up each time a different student is opened
  useEffect(() => {
    setMode('view'); setReason(''); setDur('7d'); setCustom(''); setMsg(DEFAULT_TEMP_MSG);
    setMsgEdited(false); setBusy(false); setErr(''); setInfo(''); setSent(false);
  }, [account?.studentNo]);

  if (!account) return <Modal visible={false} transparent />;

  const permanent = dur === 'perm';
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const farDate = new Date();
  farDate.setFullYear(farDate.getFullYear() + 2);

  let until = null;
  if (!permanent) {
    if (dur === 'custom') {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(custom);
      if (m) until = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    } else {
      until = new Date(Date.now() + DURATIONS.find((d) => d.key === dur).days * 86400000);
    }
  }

  const pickDur = (k) => {
    setDur(k);
    if (!msgEdited) setMsg(k === 'perm' ? DEFAULT_PERM_MSG : DEFAULT_TEMP_MSG);
  };

  const preview = studentNotice({ suspendedUntil: until, suspendPermanent: permanent, suspendReason: reason.trim(), suspendMessage: msg.trim() });

  const doSuspend = async () => {
    if (!reason.trim()) return setErr('Write the reason for the suspension.');
    if (!permanent && (!until || (dur === 'custom' && until < tomorrow))) return setErr('Choose the date the account turns back on (tomorrow or later).');
    setBusy(true);
    setErr('');
    try {
      await suspendAccount(account, { reason: reason.trim(), message: msg.trim(), until, permanent });
      onChanged();
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const doReactivate = async () => {
    setBusy(true);
    setErr('');
    try {
      await reactivateAccount(account);
      onChanged();
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const doReset = async () => {
    setErr('');
    setInfo('');
    if (!EMAIL_RE.test(account.email || '')) {
      setMode('view');
      return setErr('This account has no valid email address, so a reset link cannot be sent.');
    }
    setBusy(true);
    try {
      await sendReset(account.email);
      setSent(true);
      setInfo(`A reset link was requested for ${account.email}. If it does not arrive, ask the student to check the spam folder.`);
    } catch (e) {
      setErr(friendly(e));
    }
    setBusy(false);
    setMode('view');
  };

  const s = account.suspension;
  const suspended = account.status === 'Suspended';

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={[styles.backdrop, wide && { justifyContent: 'center' }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.kav, wide && { maxWidth: 560 }]}>
          <View style={[styles.sheet, { maxHeight: winH * 0.92 }, wide && { borderRadius: 22 }]}>
            <View style={common.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{account.name}</Text>
                <Text style={common.mu}>{account.studentNo}</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={C.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
              {mode === 'view' ? (
                <>
                  <View style={styles.box}>
                    <Row k="Program">{account.program ? `${programName(account.program)}` : '—'}</Row>
                    <Row k="Year level">{account.yearLevel || '—'}</Row>
                    <Row k="Email">{account.email || 'Not registered yet'}</Row>
                    <Row k="Contact">{account.contact || '—'}</Row>
                    <Row k="Account"><View style={{ flexDirection: 'row' }}><Pill s={account.status} /></View></Row>
                  </View>

                  {suspended ? (
                    <View style={[styles.box, styles.warnBox]}>
                      <Text style={styles.warnHead}>Suspension details</Text>
                      <Row k="Reason">{s?.reason || '—'}</Row>
                      <Row k="Until">{s?.permanent ? 'Permanent (the student must visit the Registrar)' : s?.until ? fmtLong(s.until) : '—'}</Row>
                      {s?.at ? <Row k="Suspended on">{fmtLong(s.at)}</Row> : null}
                      <Row k="Message">{s?.message || '—'}</Row>
                    </View>
                  ) : null}

                  {!account.uid ? (
                    <View style={common.note}>
                      <Text style={common.noteTx}>This student has not created an account yet, so there is nothing to reset or suspend.</Text>
                    </View>
                  ) : (
                    <>
                      {info ? <Text style={styles.ok}>{info}</Text> : null}
                      {err ? <Text style={common.err}>{err}</Text> : null}
                      {suspended ? (
                        <Text style={[common.mu, { marginTop: 12 }]}>This account is suspended. Reactivate it first if the student needs a new password.</Text>
                      ) : (
                        <Btn
                          title={sent ? 'Reset link sent' : 'Send reset link…'} kind="ghost" disabled={sent} style={sent && { opacity: 0.5 }}
                          onPress={() => { setErr(''); setInfo(''); setMode('reset'); }}
                        />
                      )}
                      {suspended ? (
                        <Btn title="Reactivate account" onPress={() => { setErr(''); setInfo(''); setMode('reactivate'); }} />
                      ) : (
                        <Btn title="Suspend account…" onPress={() => { setErr(''); setInfo(''); setMode('suspend'); }} style={{ backgroundColor: C.bad }} />
                      )}
                    </>
                  )}
                </>
              ) : null}

              {mode === 'reset' ? (
                <>
                  <Text style={styles.sec}>Send a reset link?</Text>
                  <Text style={common.mu}>An email with a link to choose a new password will be sent to {account.email}.</Text>
                  {err ? <Text style={common.err}>{err}</Text> : null}
                  <Btn title={busy ? 'Sending…' : 'Yes, send the link'} onPress={doReset} disabled={busy} style={busy && { opacity: 0.45 }} />
                  <TouchableOpacity onPress={busy ? undefined : () => { setErr(''); setMode('view'); }}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                </>
              ) : null}

              {mode === 'reactivate' ? (
                <>
                  <Text style={styles.sec}>Reactivate this account?</Text>
                  <Text style={common.mu}>{account.name} will be able to sign in again, and the suspension details will be cleared.</Text>
                  {err ? <Text style={common.err}>{err}</Text> : null}
                  <Btn title={busy ? 'Reactivating…' : 'Yes, reactivate'} onPress={doReactivate} disabled={busy} style={busy && { opacity: 0.45 }} />
                  <TouchableOpacity onPress={busy ? undefined : () => { setErr(''); setMode('view'); }}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                </>
              ) : null}

              {mode === 'suspend' ? (
                <>
                  <Text style={styles.sec}>Reason</Text>
                  <View style={styles.chips}>
                    {SUSPEND_REASONS.map((t) => (
                      <TouchableOpacity key={t} style={[styles.chip, reason === t && styles.chipOn]} onPress={() => setReason(t)}>
                        <Text style={[styles.chipTx, reason === t && { color: '#fff' }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={[styles.input, { minHeight: 46 }]} maxLength={MAX_REASON} value={reason} onChangeText={setReason}
                    placeholder="Tap a reason above or write your own" placeholderTextColor="#9AA89F"
                  />

                  <Text style={styles.sec}>How long?</Text>
                  <View style={styles.chips}>
                    {DURATIONS.map((d) => (
                      <TouchableOpacity key={d.key} style={[styles.chip, dur === d.key && styles.chipOn]} onPress={() => pickDur(d.key)}>
                        <Text style={[styles.chipTx, dur === d.key && { color: '#fff' }]}>{d.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {dur === 'custom' ? (
                    <DateField
                      label="The account turns back on" placeholder="Choose a date" value={custom} onChange={setCustom}
                      minimumDate={tomorrow} maximumDate={farDate} initialDate={tomorrow}
                    />
                  ) : null}
                  {!permanent && until ? <Text style={[common.mu, { marginTop: 6 }]}>Turns back on automatically around {fmtLong(until)}.</Text> : null}
                  {permanent ? <Text style={[common.mu, { marginTop: 6 }]}>Stays suspended until you reactivate it here.</Text> : null}

                  <Text style={styles.sec}>Message to the student</Text>
                  <TextInput
                    style={styles.input} multiline maxLength={MAX_MESSAGE} value={msg}
                    onChangeText={(t) => { setMsg(t); setMsgEdited(true); }} placeholderTextColor="#9AA89F"
                  />
                  <Text style={[common.mu, { textAlign: 'right', marginTop: 4 }]}>{msg.length}/{MAX_MESSAGE}</Text>

                  <Text style={styles.sec2}>What the student will see when they sign in</Text>
                  <View style={styles.preview}><Text style={styles.previewTx}>{preview}</Text></View>

                  {err ? <Text style={common.err}>{err}</Text> : null}
                  <Btn title={busy ? 'Suspending…' : 'Suspend account'} onPress={doSuspend} disabled={busy} style={[{ backgroundColor: C.bad }, busy && { opacity: 0.45 }]} />
                  <TouchableOpacity onPress={busy ? undefined : () => { setErr(''); setMode('view'); }}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                </>
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
  box: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 14, padding: 14, marginTop: 14 },
  warnBox: { borderColor: '#F0C9C4', backgroundColor: '#FFF8F7' },
  warnHead: { fontSize: 13, fontWeight: '800', color: C.bad, marginBottom: 4 },
  row: { flexDirection: 'row', paddingVertical: 5, gap: 8 },
  k: { width: 96, color: C.mu, fontSize: 13 },
  v: { fontWeight: '600', color: C.ink, fontSize: 13 },
  ok: { color: C.g7, fontSize: 12, fontWeight: '700', marginTop: 12 },
  sec: { fontSize: 14, fontWeight: '800', color: C.ink, marginTop: 18, marginBottom: 8 },
  sec2: { fontSize: 12, fontWeight: '800', color: C.mu, marginTop: 14, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { borderWidth: 1, borderColor: C.ln, backgroundColor: C.sf, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 12 },
  chipOn: { backgroundColor: C.g9, borderColor: C.g9 },
  chipTx: { fontSize: 12, fontWeight: '700', color: C.g7 },
  input: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 12, padding: 12, minHeight: 84, textAlignVertical: 'top', fontSize: 14, color: C.ink },
  preview: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12 },
  previewTx: { color: C.bad, fontSize: 13, lineHeight: 19 },
  cancel: { color: C.mu, fontWeight: '700', textAlign: 'center', marginTop: 14, marginBottom: 4 },
});
