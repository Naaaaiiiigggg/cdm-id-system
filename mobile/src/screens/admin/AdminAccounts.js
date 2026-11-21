import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Page from '../../components/Page';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import AccountModal from '../../components/AccountModal';
import useLoad from '../../utils/useLoad';
import { listAccounts } from '../../services/students';
import { useWide } from '../../utils/wide';
import { fmtLong } from '../../utils/suspension';
import { C, common } from '../../theme';

const FILTERS = ['All', 'Active', 'Suspended', 'Not registered'];

// "Permanent" / "Until December 1, 2026" under a suspended student's status
const suspendedNote = (a) => {
  const s = a.suspension;
  if (!s) return '';
  return s.permanent ? 'Permanent' : s.until ? `Until ${fmtLong(s.until)}` : '';
};

export default function AdminAccounts() {
  const wide = useWide();
  const load = useLoad(listAccounts, []);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [sel, setSel] = useState(null);

  const all = load.data || [];
  const count = (f) => (f === 'All' ? all.length : all.filter((a) => a.status === f).length);
  const needle = q.trim().toLowerCase();
  const list = all.filter((a) => {
    if (filter !== 'All' && a.status !== filter) return false;
    if (!needle) return true;
    return [a.name, a.studentNo, a.email, a.program].some((v) => (v || '').toLowerCase().includes(needle));
  });
  // keep the pop-up showing the freshest copy of the selected student
  const current = sel ? all.find((a) => a.studentNo === sel.studentNo) || sel : null;

  return (
    <Page title="Accounts" load={load}>
      <TextInput
        style={[styles.search, wide && { maxWidth: 520 }]} placeholder="Search name, student no. or email"
        placeholderTextColor="#9AA89F" value={q} onChangeText={setQ}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipOn]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipTx, filter === f && { color: '#fff' }]}>{f} ({count(f)})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[common.mu, { marginTop: 12 }]}>{list.length} student{list.length === 1 ? '' : 's'} · tap one to see their account</Text>

      {list.length === 0 ? (
        <Card><Text style={common.mu}>{all.length === 0 ? 'No students on the Registrar list yet.' : 'No students match.'}</Text></Card>
      ) : (
        <Card style={{ paddingVertical: 4, paddingHorizontal: 0 }}>
          {wide ? (
            <View style={[common.listRow, styles.head]}>
              <Text style={[styles.hd, { flex: 3 }]}>NAME</Text>
              <Text style={[styles.hd, { flex: 1.3 }]}>STUDENT NO.</Text>
              <Text style={[styles.hd, { flex: 1.5 }]}>PROGRAM</Text>
              <Text style={[styles.hd, { flex: 2 }]}>STATUS</Text>
              <View style={{ width: 18 }} />
            </View>
          ) : null}
          {list.map((a, i) => (
            <Pressable
              key={a.studentNo}
              onPress={() => setSel(a)}
              style={({ pressed, hovered }) => [
                common.listRow,
                { paddingHorizontal: 14 },
                i === list.length - 1 && { borderBottomWidth: 0 },
                (pressed || hovered) && { backgroundColor: C.g1 },
              ]}
            >
              {wide ? (
                <>
                  <View style={{ flex: 3 }}>
                    <Text style={common.bold}>{a.name}</Text>
                    {a.email ? <Text style={common.mu}>{a.email}</Text> : null}
                  </View>
                  <Text style={[common.mu, { flex: 1.3 }]}>{a.studentNo}</Text>
                  <Text style={[common.mu, { flex: 1.5 }]}>{a.program}{a.yearLevel ? ` · ${a.yearLevel}` : ''}</Text>
                  <View style={{ flex: 2, gap: 3 }}>
                    <Pill s={a.status} />
                    {suspendedNote(a) ? <Text style={common.mu}>{suspendedNote(a)}</Text> : null}
                  </View>
                </>
              ) : (
                <>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={common.bold}>{a.name}</Text>
                    <Text style={common.mu}>{a.studentNo} · {a.program}</Text>
                    {suspendedNote(a) ? <Text style={common.mu}>{suspendedNote(a)}</Text> : null}
                  </View>
                  <Pill s={a.status} />
                </>
              )}
              <Feather name="chevron-right" size={18} color={C.mu} />
            </Pressable>
          ))}
        </Card>
      )}

      <AccountModal
        account={current}
        onClose={() => setSel(null)}
        onChanged={() => { setSel(null); load.reload(); }}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  search: { backgroundColor: C.sf, borderWidth: 1, borderColor: C.ln, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13, fontSize: 14, color: C.ink, marginTop: 12 },
  chip: { borderWidth: 1, borderColor: C.ln, backgroundColor: C.sf, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 13 },
  chipOn: { backgroundColor: C.g9, borderColor: C.g9 },
  chipTx: { fontSize: 12, fontWeight: '700', color: C.ink },
  head: { paddingHorizontal: 14, paddingVertical: 9, backgroundColor: C.g1 },
  hd: { fontSize: 11, fontWeight: '800', color: C.mu, letterSpacing: 0.8 },
});
