import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Page from '../../components/Page';
import Card from '../../components/Card';
import Btn from '../../components/Btn';
import IdCard from '../../components/IdCard';
import IdCardBack from '../../components/IdCardBack';
import SignaturePad from '../../components/SignaturePad';
import Pill from '../../components/Pill';
import useLoad from '../../utils/useLoad';
import { activeRequest, getMediaAndRequests, saveMySignature, submitRequest } from '../../services/requests';
import { friendly } from '../../services/errors';
import { C, common } from '../../theme';

const TYPES = ['New ID', 'Replacement'];
const REASONS = {
  'New ID': ['First-year enrollee / new student', 'Transferee', 'Never been issued an ID'],
  Replacement: ['Lost', 'Stolen', 'Damaged', 'Change of name or program'],
};

function ReadOnly({ label, value, verified }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13, marginBottom: 5 }}>
        <Text style={styles.lbl}>{label}</Text>
        {verified ? <Text style={styles.ver}>Verified</Text> : null}
      </View>
      <View style={styles.ro}><Text style={styles.roTx}>{value}</Text></View>
    </View>
  );
}

export default function StudentRequest({ me, go }) {
  const load = useLoad(() => getMediaAndRequests(me), [me.uid]);
  const [step, setStep] = useState('form'); // form | sign | review | done
  const [drawn, setDrawn] = useState(null);   // what is on the signature pad right now
  const [scroll, setScroll] = useState(true); // off while the finger is drawing
  const [savedSig, setSavedSig] = useState(null);
  const [side, setSide] = useState('front'); // which side of the ID is shown in the review
  const [type, setType] = useState('New ID');
  const [reason, setReason] = useState(REASONS['New ID'][0]);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [requestNo, setRequestNo] = useState('');

  const pickType = (t) => { setType(t); setReason(REASONS[t][0]); };
  const media = load.data?.media || {};
  const signature = savedSig || load.data?.signature || null;
  const active = load.data ? activeRequest(load.data.requests) : null;

  const review = () => {
    if (!ok) return setErr('Please confirm that your details are correct.');
    setErr('');
    setStep(signature ? 'review' : 'sign');
  };

  const saveSignature = () => {
    if (!drawn) return setErr('Please sign inside the box first.');
    Alert.alert(
      'Save your signature?',
      'It will be printed on your ID. After this, only the Registrar can change it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            setBusy(true);
            setErr('');
            try {
              setSavedSig(await saveMySignature(me.studentNo, drawn));
              setStep('review');
            } catch (e) {
              setErr(friendly(e));
            }
            setBusy(false);
          },
        },
      ],
    );
  };

  const submit = async () => {
    setBusy(true);
    setErr('');
    try {
      setRequestNo(await submitRequest({ uid: me.uid, studentNo: me.studentNo, type, reason }));
      setStep('done');
    } catch (e) {
      setErr(friendly(e));
    }
    setBusy(false);
  };

  if (step === 'done') {
    return (
      <ScrollView contentContainerStyle={common.pad}>
        <Text style={common.h2}>Request submitted</Text>
        <Card>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Feather name="check-circle" size={44} color="#1F7A4D" />
            <Text style={[common.bold, { marginTop: 10 }]}>{requestNo}</Text>
            <Text style={[common.mu, { marginTop: 4, textAlign: 'center' }]}>
              {type} · {reason}. You will get an alert whenever the Registrar updates it.
            </Text>
          </View>
        </Card>
        <Btn title="View my request" onPress={() => go('home')} />
      </ScrollView>
    );
  }

  if (step === 'sign') {
    return (
      <ScrollView contentContainerStyle={common.pad} scrollEnabled={scroll} keyboardShouldPersistTaps="handled">
        <View style={common.hd}>
          <TouchableOpacity style={common.bk} onPress={() => { setErr(''); setStep('form'); }}><Text style={common.bkTx}>‹</Text></TouchableOpacity>
          <Text style={common.h2}>Your signature</Text>
        </View>
        <Text style={common.mu}>Sign inside the box with your finger. This is the signature printed on your ID.</Text>
        <View style={{ marginTop: 14 }}>
          <SignaturePad onChange={setDrawn} onDrawing={(d) => setScroll(!d)} />
        </View>
        <Text style={common.err}>{err}</Text>
        <Btn title={busy ? 'Saving…' : 'Save signature'} onPress={busy ? () => {} : saveSignature} />
      </ScrollView>
    );
  }

  if (step === 'review') {
    return (
      <ScrollView contentContainerStyle={common.pad}>
        <View style={common.hd}>
          <TouchableOpacity style={common.bk} onPress={() => setStep('form')}><Text style={common.bkTx}>‹</Text></TouchableOpacity>
          <Text style={common.h2}>Review & submit</Text>
        </View>
        <View style={styles.summary}>
          <Text style={{ color: C.ink, fontSize: 14 }}>{type} · {reason}</Text>
        </View>
        <Text style={[common.mu, { textAlign: 'center', marginTop: 10 }]}>Your photo is supplied by the Registrar. Your signature is the one you drew.</Text>
        <View style={[styles.seg, { marginTop: 12 }]}>
          {['front', 'back'].map((sd) => (
            <TouchableOpacity key={sd} style={[styles.segBtn, side === sd && styles.segOn]} onPress={() => setSide(sd)}>
              <Text style={[styles.segTx, side === sd && { color: C.ink }]}>{sd === 'front' ? 'Front' : 'Back'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {side === 'front'
          ? <IdCard name={me.name} studentNo={me.studentNo} program={me.program} photo={media.photo} signature={signature} />
          : <IdCardBack info={media} />}
        {!media.photo ? (
          <View style={common.note}>
            <Text style={common.noteTx}>The Registrar has not uploaded your photo yet. You can still submit, but the ID cannot be printed until it is added.</Text>
          </View>
        ) : null}
        <Text style={common.err}>{err}</Text>
        <Btn title={busy ? 'Submitting…' : 'Submit request'} onPress={busy ? () => {} : submit} />
      </ScrollView>
    );
  }

  return (
    <Page title="Request an ID" load={load}>
      {active ? (
        <Card>
          <View style={common.rowBetween}>
            <View>
              <Text style={common.bold}>{active.requestNo}</Text>
              <Text style={common.mu}>{active.type}</Text>
            </View>
            <Pill s={active.status} />
          </View>
          <Text style={[common.mu, { marginTop: 10 }]}>You already have an active request. You can send a new one after it is claimed.</Text>
          <Btn title="View status" kind="ghost" onPress={() => go('home')} />
        </Card>
      ) : (
        <>
          <View style={styles.seg}>
            {TYPES.map((t) => (
              <TouchableOpacity key={t} style={[styles.segBtn, type === t && styles.segOn]} onPress={() => pickType(t)}>
                <Text style={[styles.segTx, type === t && { color: C.ink }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={common.note}><Text style={common.noteTx}>✓ Details matched with Registrar records (read-only).</Text></View>
          <ReadOnly label="Student number" value={me.studentNo} verified />
          <ReadOnly label="Name" value={me.name} />
          <ReadOnly label="Program and year" value={`${me.program} · ${me.yearLevel}`} />

          <Text style={[styles.lbl, { marginTop: 13, marginBottom: 5 }]}>Reason</Text>
          <View style={styles.chips}>
            {REASONS[type].map((r) => (
              <TouchableOpacity key={r} style={[styles.chip, reason === r && styles.chipOn]} onPress={() => setReason(r)}>
                <Text style={[styles.chipTx, reason === r && { color: '#fff' }]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.check} onPress={() => setOk(!ok)} activeOpacity={0.8}>
            <Feather name={ok ? 'check-square' : 'square'} size={22} color={ok ? C.g9 : C.mu} />
            <Text style={styles.checkTx}>I confirm my details are correct. A replacement deactivates my previous ID.</Text>
          </TouchableOpacity>
          <Text style={common.err}>{err}</Text>
          <Btn title="Review request" onPress={review} />
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', backgroundColor: C.g1, borderRadius: 14, padding: 4, marginTop: 12 },
  segBtn: { flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: 'center' },
  segOn: { backgroundColor: '#fff' },
  segTx: { fontWeight: '700', color: C.mu, fontSize: 14 },
  lbl: { fontSize: 12, fontWeight: '700', color: C.g7 },
  ver: { fontSize: 11, fontWeight: '700', color: '#1F7A4D' },
  ro: { backgroundColor: C.g1, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 13 },
  roTx: { fontSize: 14, color: C.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: C.ln, backgroundColor: C.sf, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 13 },
  chipOn: { backgroundColor: C.g9, borderColor: C.g9 },
  chipTx: { fontSize: 13, color: C.ink, fontWeight: '600' },
  check: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 18 },
  checkTx: { flex: 1, fontSize: 13, color: C.ink },
  summary: { backgroundColor: C.g1, borderRadius: 12, padding: 12 },
});
