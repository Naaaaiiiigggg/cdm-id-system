import { ScrollView, Text, View } from 'react-native';
import Card from '../../components/Card';
import KV from '../../components/KV';
import Btn from '../../components/Btn';
import Logo from '../../components/Logo';
import { confirmDialog } from '../../utils/dialog';
import { common } from '../../theme';
import { useWide } from '../../utils/wide';

export default function AdminProfile({ me, onLogout }) {
  const wide = useWide();
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
    <ScrollView contentContainerStyle={[common.pad, wide && { padding: 28, paddingTop: 48, paddingBottom: 40 }]}>
      <View style={wide ? { maxWidth: 480, width: '100%', alignSelf: 'center', alignItems: 'center' } : null}>
        {wide ? <Logo size={72} /> : null}
        <Text style={[common.h2, wide && { fontSize: 24, textAlign: 'center' }]}>Profile</Text>
      </View>
      <View style={wide ? { maxWidth: 480, width: '100%', alignSelf: 'center' } : null}>
        <Card>
          <KV k="Name" v={me.name || 'Registrar Staff'} />
          <KV k="Staff ID" v={me.staffId || '—'} />
          <KV k="Role" v="Administrator" />
          <KV k="Email" v={me.email} />
        </Card>
        <Btn title="Sign out" kind="ghost" onPress={confirmLogout} />
      </View>
    </ScrollView>
  );
}
