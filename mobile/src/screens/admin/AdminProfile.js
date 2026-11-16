import { ScrollView, Text } from 'react-native';
import Card from '../../components/Card';
import KV from '../../components/KV';
import Btn from '../../components/Btn';
import { confirmDialog } from '../../utils/dialog';
import { common } from '../../theme';

export default function AdminProfile({ me, onLogout }) {
  const confirmLogout = async () => {
    const ok = await confirmDialog({
      title: 'Sign out',
      message: 'Do you want to sign out of the admin account?',
      confirmText: 'Sign out',
      destructive: true,
    });
    if (ok) onLogout();
  };

  return (
    <ScrollView contentContainerStyle={common.pad}>
      <Text style={common.h2}>Profile</Text>
      <Card>
        <KV k="Name" v={me.name || 'Registrar Staff'} />
        <KV k="Staff ID" v={me.staffId || '—'} />
        <KV k="Role" v="Administrator" />
        <KV k="Email" v={me.email} />
      </Card>
      <Btn title="Sign out" kind="ghost" onPress={confirmLogout} />
    </ScrollView>
  );
}
