import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Page from '../../components/Page';
import Card from '../../components/Card';
import ReqList from '../../components/ReqList';
import ManageRequestModal from '../../components/ManageRequestModal';
import useLoad from '../../utils/useLoad';
import { useWide } from '../../utils/wide';
import { getAdminData } from '../../services/requests';
import { C, PILL, common } from '../../theme';

// The four counters: [status, icon]
const KPI = [['Submitted', 'send'], ['Under Review', 'search'], ['For Printing', 'printer'], ['Ready for Pickup', 'package']];

export default function AdminDashboard() {
  const load = useLoad(getAdminData, []);
  const wide = useWide();
  const [sel, setSel] = useState(null);
  const reqs = load.data?.requests || [];
  const count = (s) => reqs.filter((r) => r.status === s).length;
  const attention = reqs.filter((r) => r.status === 'Submitted' || r.status === 'Under Review');

  return (
    <Page title="Dashboard" load={load}>
      {/* Phone: two counters per row. Wide window or a phone on its side: all four in one row, same size. */}
      <View style={[styles.grid, wide && { flexWrap: 'nowrap' }]}>
        {KPI.map(([s, icon]) => (
          <Card key={s} style={[styles.kpi, wide && { flexBasis: 0, minWidth: 0 }]}>
            <View style={styles.kpiRow}>
              <View style={[styles.kpiIcon, { backgroundColor: PILL[s][0] }]}>
                <Feather name={icon} size={17} color={PILL[s][1]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.num}>{count(s)}</Text>
                <Text style={[common.mu, { fontSize: 12 }]} numberOfLines={2}>{s}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
      <Text style={[common.h3, { marginTop: 18 }]}>Needs attention</Text>
      <ReqList list={attention} students={load.data?.students || {}} onPress={setSel} />
      <ManageRequestModal
        request={sel ? reqs.find((r) => r.id === sel.id) || sel : null}
        student={sel ? (load.data?.students || {})[sel.studentNo] : {}}
        onClose={() => setSel(null)}
        onSaved={() => { setSel(null); load.reload(); }}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  kpi: { flexGrow: 1, flexBasis: '45%', marginTop: 8 },
  kpiRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  kpiIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 28, fontWeight: '800', color: C.g9 },
});
