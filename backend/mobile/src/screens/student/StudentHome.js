import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Page from '../../components/Page';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Btn from '../../components/Btn';
import KV from '../../components/KV';
import IdCard from '../../components/IdCard';
import IdCardBack from '../../components/IdCardBack';
import { CARD_H, CARD_W } from '../../components/cardSize';
import useLoad from '../../utils/useLoad';
import { getMediaAndRequests } from '../../services/requests';
import { formatDate } from '../../utils/format';
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
const SCALE = 0.62; // size of the ID preview on this screen

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function StudentHome({ me, go }) {
  const load = useLoad(() => getMediaAndRequests(me), [me.uid]);
  const [showSteps, setShowSteps] = useState(false);
  const [side, setSide] = useState('front');

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
        <View style={styles.avatar}>
          {media.photo ? <Image source={{ uri: media.photo }} style={styles.avatarImg} /> : <Feather name="user" size={30} color={C.g7} />}
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
                            <Text style={[styles.tlTx, (done || now) && { color: C.ink }, now && { fontWeight: '800' }]}>{name}</Text>
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

      {/* ---------- ID preview ---------- */}
      <View style={[common.rowBetween, { marginTop: 22 }]}>
        <Text style={common.h3}>My ID</Text>
        <Text style={common.mu}>Tap the card to flip it</Text>
      </View>
      <TouchableOpacity activeOpacity={0.92} style={styles.previewBox} onPress={() => setSide(side === 'front' ? 'back' : 'front')}>
        <View style={{ width: CARD_W * SCALE, height: CARD_H * SCALE }}>
          <View style={{ position: 'absolute', width: CARD_W, height: CARD_H, left: (CARD_W * SCALE - CARD_W) / 2, top: (CARD_H * SCALE - CARD_H) / 2, transform: [{ scale: SCALE }] }}>
            {side === 'front'
              ? <IdCard style={{ marginTop: 0 }} name={me.name} studentNo={me.studentNo} program={me.program} photo={media.photo} signature={signature} />
              : <IdCardBack style={{ marginTop: 0 }} info={media} />}
          </View>
        </View>
      </TouchableOpacity>
      <Text style={[common.mu, { textAlign: 'center', marginTop: 8 }]}>
        {media.photo ? 'Preview only. The printed ID may look slightly different.' : 'Waiting for the Registrar to upload your photo.'}
      </Text>
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
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: C.g1, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.gold, overflow: 'hidden' },
  avatarImg: { width: 70, height: 70 },
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
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.g1, alignItems: 'center', justifyContent: 'center' },
  previewBox: { marginTop: 10, backgroundColor: C.g1, borderRadius: 18, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: C.ln },
});
