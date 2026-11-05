import { StyleSheet, Text, View } from 'react-native';
import Page from '../../components/Page';
import Card from '../../components/Card';
import ReqList from '../../components/ReqList';
import useLoad from '../../utils/useLoad';
import { getAdminData } from '../../services/requests';
import { C, common } from '../../theme';

export default function AdminDashboard() {
  const load = useLoad(getAdminData, []);
  const reqs = load.data?.requests || [];
  const count = (s) => reqs.filter((r) => r.status === s).length;
  const attention = reqs.filter((r) => r.status === 'Submitted' || r.status === 'Under Review');

  return (
    <Page title="Dashboard" load={load}>
      <View style={styles.grid}>
        {['Submitted', 'Under Review', 'For Printing', 'Ready for Pickup'].map((s) => (
          <Card key={s} style={styles.kpi}>
            <Text style={styles.num}>{count(s)}</Text>
            <Text style={common.mu}>{s}</Text>
          </Card>
        ))}
      </View>
      <Text style={[common.h3, { marginTop: 18 }]}>Needs attention</Text>
      <ReqList list={attention} students={load.data?.students || {}} />
    </Page>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  kpi: { width: '48%', marginTop: 8 },
  num: { fontSize: 26, fontWeight: '800', color: C.g7 },
});
