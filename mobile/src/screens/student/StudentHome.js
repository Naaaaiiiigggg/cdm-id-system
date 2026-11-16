import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Page from '../../components/Page';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Btn from '../../components/Btn';
import KV from '../../components/KV';
import IdCard from '../../components/IdCard';
import IdCardBack from '../../components/IdCardBack';
import useLoad from '../../utils/useLoad';
import { getMediaAndRequests } from '../../services/requests';
import { formatDate, shortDate, timeRange, weekdayDate } from '../../utils/format';
import { C, PILL, STATUSES, common } from '../../theme';

const ICON = {
  Submitted: 'send', 'Under Review': 'search', Approved: 'check-circle', 'For Printing': 'printer',
  'Ready for Pickup': 'package', Claimed: 'award', Rejected: 'x-circle',
};
const MESSAGE = {
  Submitted: 'We received your request. The Registrar will review it soon.',
  'Under Review': 'The Registrar is checking your details.',
  Approved: 'Approved! Your ID is next in line for printing.',
  'For Printing': 'Your ID is being printed.',
  'Ready for Pickup': "Your ID is ready. Please claim it at the Registrar's Office.",
  Claimed: 'You have claimed your ID. Enjoy!',
};

// When a step was reached (Submitted uses the day the request was made).
const stageDate = (r, name) => shortDate(r.stageDates?.[name] || (name === 'Submitted' ? r.createdAt : null));

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function StudentHome({ me, go }) {
  const load = useLoad(() => getMediaAndRequests(me), [me.uid]);
  const [showSteps, setShowSteps] = useState(false);
  const [side, setSide] = useState('front');
  const [preview, setPreview] = useState(false); // the ID preview pop-up

  const media = load.data?.media || {};
  const signature = load.data?.signature || null;
  const r = load.data?.requests?.[0] || null;
  const idx = r ? STATUSES.indexOf(r.status) : -1;
  const colors = r ? PILL[r.status] || PILL.Submitted : PILL.Submitted;

  return (
    <Page load={load}>
      {/* ---------- hero ---------- */}
      <View style={styles.hero}>
        <View style={styles.circleA} />
        <View style={styles.circleB} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroSm}>{greeting().toUpperCase()}</Text>
          <Text style={styles.heroH} numberOfLines={2}>{me.name}</Text>
          <Text style={styles.heroSub}>{me.program} · {me.yearLevel}</Text>
          <View style={styles.chip}>
            <Feather name="credit-card" size={12} color={C.gold} />
            <Text style={styles.chipTx}>{me.studentNo}</Text>
          </View>
        </View>
      </View>

      {/* ---------- request status ---------- */}
      <Text style={[common.h3, { marginTop: 20 }]}>My ID request</Text>
      {r ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={[styles.stHead, { backgroundColor: colors[0] }]}>
            <View style={styles.stIcon}><Feather name={ICON[r.status] || 'send'} size={20} color={colors[1]} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stTitle, { color: colors[1] }]}>{r.status}</Text>
              <Text style={styles.stMsg}>
                {r.status === 'Rejected'
                  ? `Your request was rejected.${r.remarks ? ` ${r.remarks}` : ' Please see the Registrar.'}`
                  : MESSAGE[r.status]}
              </Text>
            </View>
          </View>

          <View style={{ padding: 14 }}>
            {r.adminNote ? (
              <View style={styles.noteBox}>
                <Feather name="message-square" size={16} color="#8A6A12" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteHead}>Note from the Registrar</Text>
                  <Text style={styles.noteBody}>{r.adminNote}</Text>
                </View>
              </View>
            ) : null}
            {r.status === 'Ready for Pickup' && r.pickupDate ? (
              <View style={styles.pickup}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="calendar" size={16} color={C.g9} />
                  <Text style={styles.pickupHead}>Pick up your ID</Text>
                </View>
                <Text style={styles.pickupDate}>{weekdayDate(r.pickupDate)}</Text>
                {timeRange(r.pickupFrom, r.pickupTo) ? <Text style={styles.pickupLine}>{timeRange(r.pickupFrom, r.pickupTo)}</Text> : null}
                <Text style={styles.pickupLine}>Registrar's Office</Text>
                {r.pickupBring ? <Text style={styles.pickupBring}>Bring: {r.pickupBring}</Text> : null}
              </View>
            ) : null}
            {idx >= 0 ? (
              <>
                <View style={styles.bars}>
                  {STATUSES.map((name, i) => (
                    <View key={name} style={[styles.bar, i < idx && { backgroundColor: C.g9 }, i === idx && { backgroundColor: C.gold }]} />
                  ))}
                </View>
                <Text style={styles.stepTx}>Step {idx + 1} of {STATUSES.length}</Text>
              </>
            ) : null}

            <View style={{ marginTop: 6 }}>
              <KV k="Request no." v={r.requestNo} />
              <KV k="Type" v={r.type} />
              {r.reason ? <KV k="Reason" v={r.reason} /> : null}
              <KV k="Submitted" v={formatDate(r.createdAt)} />
            </View>

            <TouchableOpacity style={styles.previewBtn} onPress={() => { setSide('front'); setPreview(true); }} activeOpacity={0.85}>
              <Feather name="eye" size={16} color="#fff" />
              <Text style={styles.previewTx}>Preview ID</Text>
            </TouchableOpacity>

            {idx >= 0 ? (
              <>
                <TouchableOpacity style={styles.toggle} onPress={() => setShowSteps(!showSteps)}>
                  <Text style={styles.toggleTx}>{showSteps ? 'Hide steps' : 'View all steps'}</Text>
                  <Feather name={showSteps ? 'chevron-up' : 'chevron-down'} size={16} color={C.g7} />
                </TouchableOpacity>
                {showSteps && (
                  <View style={{ marginTop: 8 }}>
                    {STATUSES.map((name, i) => {
                      const done = i < idx, now = i === idx;
                      return (
                        <View key={name}>
                          <View style={styles.tlRow}>
                            <View style={[styles.dot, done && styles.dotDone, now && styles.dotNow]}>
                              {done ? <Feather name="check" size={13} color="#fff" /> : <Text style={{ color: now ? C.g9 : C.mu, fontSize: 11, fontWeight: '800' }}>{i + 1}</Text>}
                            </View>
                            <Text style={[styles.tlTx, (done || now) && { color: C.ink }, now && { fontWeight: '800' }]}>
                              {name}
                              {(done || now) && stageDate(r, name) ? <Text style={styles.tlDate}>{` · ${stageDate(r, name)}`}</Text> : null}
                            </Text>
                          </View>
                          {i < STATUSES.length - 1 && <View style={[styles.line, done && { backgroundColor: C.g9 }]} />}
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            ) : null}
          </View>
        </Card>
      ) : (
        <Card>
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <View style={styles.emptyIcon}><Feather name="file-plus" size={26} color={C.g7} /></View>
            <Text style={[common.bold, { marginTop: 12 }]}>No ID request yet</Text>
            <Text style={[common.mu, { textAlign: 'center', marginTop: 4 }]}>Request a new ID or a replacement. It only takes a minute.</Text>
          </View>
          <Btn title="Request an ID" onPress={() => go('req')} />
        </Card>
      )}

      {/* ---------- ID preview pop-up ---------- */}
      <Modal visible={preview} transparent animationType="fade" onRequestClose={() => setPreview(false)}>
        <View style={styles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPreview(false)} />
          <View style={styles.sheet}>
            <View style={common.rowBetween}>
              <Text style={styles.sheetTitle}>Your ID</Text>
              <TouchableOpacity onPress={() => setPreview(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={C.ink} />
              </TouchableOpacity>
            </View>
            <View style={styles.seg}>
              {['front', 'back'].map((sd) => (
                <TouchableOpacity key={sd} style={[styles.segBtn, side === sd && styles.segOn]} onPress={() => setSide(sd)}>
                  <Text style={[styles.segTx, side === sd && { color: C.ink }]}>{sd === 'front' ? 'Front' : 'Back'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {side === 'front'
              ? <IdCard name={me.name} studentNo={me.studentNo} program={me.program} photo={media.photo} signature={signature} />
              : <IdCardBack info={media} />}
            <Text style={[common.mu, { textAlign: 'center', marginTop: 10 }]}>
              {media.photo ? 'Preview only. The printed ID may look slightly different.' : 'Waiting for the Registrar to upload your photo.'}
            </Text>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.g9, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
  circleA: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', right: -40, top: -50 },
  circleB: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(242,194,48,0.10)', right: 40, bottom: -50 },
  heroSm: { color: C.gold, letterSpacing: 2, fontSize: 10, fontWeight: '700' },
  heroH: { color: '#fff', fontSize: 21, fontWeight: '800', marginVertical: 5 },
  heroSub: { color: '#CFE0D6', fontSize: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginTop: 10 },
  chipTx: { color: '#fff', fontSize: 11, fontWeight: '700' },
  noteBox: { flexDirection: 'row', gap: 10, backgroundColor: '#FBF3DA', borderRadius: 12, padding: 12, marginBottom: 14 },
  noteHead: { fontSize: 12, fontWeight: '800', color: '#8A6A12' },
  noteBody: { fontSize: 13, color: '#5a4410', marginTop: 2 },
  stHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  stIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  stTitle: { fontSize: 17, fontWeight: '800' },
  stMsg: { fontSize: 12, color: C.ink, marginTop: 2 },
  bars: { flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.ln },
  stepTx: { fontSize: 11, color: C.mu, marginTop: 6, fontWeight: '600' },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.ln },
  toggleTx: { color: C.g7, fontWeight: '700', fontSize: 13 },
  tlRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.ln, backgroundColor: C.sf, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: C.g9, borderColor: C.g9 },
  dotNow: { borderColor: C.gold },
  line: { width: 2, height: 14, marginLeft: 11, backgroundColor: C.ln },
  tlTx: { color: '#9AA89F', fontSize: 14 },
  tlDate: { color: C.mu, fontSize: 12, fontWeight: '600' },
  pickup: { backgroundColor: '#FFF6D6', borderWidth: 1, borderColor: C.gold, borderRadius: 12, padding: 12, marginBottom: 14 },
  pickupHead: { fontSize: 12, fontWeight: '800', color: C.g9, letterSpacing: 0.5 },
  pickupDate: { fontSize: 16, fontWeight: '800', color: C.ink, marginTop: 8 },
  pickupLine: { fontSize: 13, color: C.ink, marginTop: 2 },
  pickupBring: { fontSize: 13, color: '#5a4410', fontWeight: '700', marginTop: 8 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.g1, alignItems: 'center', justifyContent: 'center' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.g9, borderRadius: 12, paddingVertical: 12, marginTop: 12 },
  previewTx: { color: '#fff', fontWeight: '700', fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  sheet: { backgroundColor: C.bg, borderRadius: 20, padding: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.ink },
  seg: { flexDirection: 'row', backgroundColor: C.g1, borderRadius: 12, padding: 4, marginTop: 12 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segOn: { backgroundColor: '#fff' },
  segTx: { fontWeight: '700', color: C.mu, fontSize: 13 },
});
