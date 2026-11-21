import { ScrollView, Text, View } from 'react-native';
import Card from '../../components/Card';
import KV from '../../components/KV';
import Btn from '../../components/Btn';
import Logo from '../../components/Logo';
import { programName, instituteName } from '../../data/programs';
import { useWide } from '../../utils/wide';
import { common } from '../../theme';

export default function StudentProfile({ me, onLogout }) {
  const wide = useWide();
  return (
    <ScrollView contentContainerStyle={[common.pad, wide && { padding: 28, paddingTop: 48, paddingBottom: 40 }]}>
      <View style={wide ? { maxWidth: 480, width: '100%', alignSelf: 'center', alignItems: 'center' } : null}>
        {wide ? <Logo size={72} /> : null}
        <Text style={[common.h2, wide && { fontSize: 24, textAlign: 'center' }]}>Profile</Text>
      </View>
      <View style={wide ? { maxWidth: 480, width: '100%', alignSelf: 'center' } : null}>
        <Card>
          <KV k="Name" v={me.name} />
          <KV k="Student no." v={me.studentNo} />
          <KV k="Program" v={programName(me.program)} />
          <KV k="Institute" v={instituteName(me.program)} />
          <KV k="Year level" v={me.yearLevel} />
          <KV k="Email" v={me.email} />
        </Card>
        <View style={common.note}>
          <Text style={common.noteTx}>Wrong name or details? Please proceed to Registrar for updating.</Text>
        </View>
        <Btn title="Sign out" kind="ghost" onPress={onLogout} />
      </View>
    </ScrollView>
  );
}
