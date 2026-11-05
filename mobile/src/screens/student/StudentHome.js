import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Page from '../../components/Page';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Btn from '../../components/Btn';
import useLoad from '../../utils/useLoad';
import { getMyRequests } from '../../services/requests';
import { formatDate } from '../../utils/format';
import { C, STATUSES, common } from '../../theme';

export default function StudentHome({ me, go }) {
  const load = useLoad(() => getMyRequests(me.uid), [me.uid]);
  const r = load.data ? load.data[0] : null;
  const idx = r ? STATUSES.indexOf(r.status) : -1;

  return (
    <Page load={load}>
      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroSm}>WELCOME</Text>
          <Text style={styles.heroH}>{me.name}</Text>
          <Text style={{ color: '#CFE0D6', fontSize: 12 }}>{me.program} · {me.yearLevel}</Text>
        </View>
        <View style={styles.avatar}><Feather name="user" size={30} color={C.g7} /></View>
      </View>

      <Text style={[common.h3, { marginTop: 18 }]}>My ID request</Text>
      {r ? (
        <Card>
          <View style={common.rowBetween}>
            <View>
              <Text style={common.bold}>{r.requestNo}</Text>
              <Text style={common.mu}>{r.type} · {formatDate(r.createdAt)}</Text>
            </View>
            <Pill s={r.status} />
          </View>
          <View style={{ marginTop: 14 }}>
            {r.status === 'Rejected' ? (
              <Text style={{ color: C.bad }}>Your request was rejected.{r.remarks ? ` ${r.remarks}` : ' Please see the Registrar.'}</Text>
            ) : (
              STATUSES.map((name, i) => {
                const done = i < idx, now = i === idx;
                return (
                  <View key={name} style={styles.tlRow}>
                    <View style={[styles.dot, done && styles.dotDone, now && styles.dotNow]}>
                      <Text style={{ color: done ? '#fff' : C.mu, fontSize: 11, fontWeight: '800' }}>{done ? '✓' : i + 1}</Text>
                    </View>
                    <Text style={[styles.tlTx, (done || now) && { color: C.ink }, now && { fontWeight: '800' }]}>{name}</Text>
                  </View>
                );
              })
            )}
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={common.mu}>You have no ID request yet.</Text>
          <Btn title="Request an ID" onPress={() => go('req')} />
        </Card>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.g9, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroSm: { color: C.gold, letterSpacing: 2, fontSize: 10, fontWeight: '700' },
  heroH: { color: '#fff', fontSize: 20, fontWeight: '800', marginVertical: 6 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: C.g1, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  tlRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.ln, backgroundColor: C.sf, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: C.g9, borderColor: C.g9 },
  dotNow: { borderColor: C.gold },
  tlTx: { color: '#9AA89F', fontSize: 14 },
});
