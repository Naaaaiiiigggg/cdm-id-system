import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Page from '../../components/Page';
import ReqList from '../../components/ReqList';
import ManageRequestModal from '../../components/ManageRequestModal';
import useLoad from '../../utils/useLoad';
import { getAdminData } from '../../services/requests';
import { C, STATUSES, common } from '../../theme';

const TYPES = ['All types', 'New ID', 'Replacement'];
const STATUS_FILTERS = ['All', ...STATUSES, 'Rejected'];

export default function AdminRequests() {
  const load = useLoad(getAdminData, []);
  const [type, setType] = useState('All types');
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);

  const students = load.data?.students || {};
  const needle = q.trim().toLowerCase();
  const list = (load.data?.requests || []).filter((r) => {
    if (type !== 'All types' && r.type !== type) return false;
    if (status !== 'All' && r.status !== status) return false;
    if (!needle) return true;
    return [students[r.studentNo]?.name, r.studentNo, r.requestNo].some((v) => (v || '').toLowerCase().includes(needle));
  });
  // keep the pop-up showing the freshest copy of the selected request
  const current = sel ? (load.data?.requests || []).find((r) => r.id === sel.id) || sel : null;

  return (
    <Page title="Requests" load={load}>
      <TextInput style={styles.search} placeholder="Search name, student no. or request no." placeholderTextColor="#9AA89F" value={q} onChangeText={setQ} />

      <View style={styles.seg}>
        {TYPES.map((t) => (
          <TouchableOpacity key={t} style={[styles.segBtn, type === t && styles.segOn]} onPress={() => setType(t)}>
            <Text style={[styles.segTx, type === t && { color: C.ink }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8 }}>
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipOn]} onPress={() => setStatus(s)}>
            <Text style={[styles.chipTx, status === s && { color: '#fff' }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[common.mu, { marginTop: 12 }]}>{list.length} request{list.length === 1 ? '' : 's'} · tap one to manage it</Text>
      <ReqList list={list} students={students} onPress={setSel} />

      <ManageRequestModal
        request={current}
        student={current ? students[current.studentNo] : {}}
        onClose={() => setSel(null)}
        onSaved={() => { setSel(null); load.reload(); }}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  search: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13, fontSize: 14, color: C.ink, marginTop: 12 },
  seg: { flexDirection: 'row', backgroundColor: C.g1, borderRadius: 12, padding: 4, marginTop: 12 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segOn: { backgroundColor: '#fff' },
  segTx: { fontWeight: '700', color: C.mu, fontSize: 13 },
  chip: { borderWidth: 1, borderColor: C.ln, backgroundColor: C.sf, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 13 },
  chipOn: { backgroundColor: C.g9, borderColor: C.g9 },
  chipTx: { fontSize: 12, fontWeight: '700', color: C.ink },
});
