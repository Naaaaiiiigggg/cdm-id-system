import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Page from '../../components/Page';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import useLoad from '../../utils/useLoad';
import { listAccounts, setAccountStatus } from '../../services/students';
import { sendReset } from '../../services/auth';
import { friendly } from '../../services/errors';
import { confirmDialog, notify } from '../../utils/dialog';
import { C, common } from '../../theme';
import { useWide } from '../../utils/wide';

export default function AdminAccounts() {
  const wide = useWide();
  const load = useLoad(listAccounts, []);
  const list = load.data || [];

  const toggle = async (a) => {
    const next = a.status === 'Active' ? 'Suspended' : 'Active';
    const ok = await confirmDialog({
      title: `${next === 'Suspended' ? 'Suspend' : 'Reactivate'} account`,
      message: `${a.name} (${a.studentNo})`,
      confirmText: 'Confirm',
      destructive: next === 'Suspended',
    });
    if (!ok) return;
    try {
      await setAccountStatus(a.uid, next);
      load.reload();
    } catch (e) {
      notify('Error', friendly(e));
    }
  };

  const reset = async (a) => {
    try {
      await sendReset(a.email);
      notify('Sent', `A reset link was sent to ${a.email}.`);
    } catch (e) {
      notify('Error', friendly(e));
    }
  };

  return (
    <Page title="Accounts" load={load}>
      {list.length === 0 && <Card><Text style={common.mu}>No students on the Registrar list yet.</Text></Card>}
      <View style={wide ? styles.grid : null}>
      {list.map((a) => (
       <Card key={a.studentNo} style={wide ? styles.half : null}>
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
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  act: { flex: 1, borderWidth: 1, borderColor: C.ln, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  actTx: { fontSize: 12, fontWeight: '700', color: C.g7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12 },
  half: { width: '49%' },
});
