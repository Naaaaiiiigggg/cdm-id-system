import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Page from '../../components/Page';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import useLoad from '../../utils/useLoad';
import { listAccounts, setAccountStatus } from '../../services/students';
import { sendReset } from '../../services/auth';
import { friendly } from '../../services/errors';
import { C, common } from '../../theme';

export default function AdminAccounts() {
  const load = useLoad(listAccounts, []);
  const list = load.data || [];

  const toggle = (a) => {
    const next = a.status === 'Active' ? 'Suspended' : 'Active';
    Alert.alert(`${next === 'Suspended' ? 'Suspend' : 'Reactivate'} account`, `${a.name} (${a.studentNo})`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try { await setAccountStatus(a.uid, next); load.reload(); } catch (e) { Alert.alert('Error', friendly(e)); }
        },
      },
    ]);
  };

  const reset = async (a) => {
    try {
      await sendReset(a.email);
      Alert.alert('Sent', `A reset link was sent to ${a.email}.`);
    } catch (e) {
      Alert.alert('Error', friendly(e));
    }
  };

  return (
    <Page title="Accounts" load={load}>
      {list.length === 0 && <Card><Text style={common.mu}>No students on the Registrar list yet.</Text></Card>}
      {list.map((a) => (
        <Card key={a.studentNo}>
          <View style={common.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={common.bold}>{a.name}</Text>
              <Text style={common.mu}>{a.studentNo} · {a.program}{a.email ? ` · ${a.email}` : ''}</Text>
            </View>
            <Pill s={a.status} />
          </View>
          {a.uid ? (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.act} onPress={() => reset(a)}><Text style={styles.actTx}>Send reset link</Text></TouchableOpacity>
              <TouchableOpacity style={styles.act} onPress={() => toggle(a)}>
                <Text style={[styles.actTx, a.status === 'Active' && { color: C.bad }]}>{a.status === 'Active' ? 'Suspend' : 'Reactivate'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Card>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  act: { flex: 1, borderWidth: 1, borderColor: C.ln, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  actTx: { fontSize: 12, fontWeight: '700', color: C.g7 },
});
