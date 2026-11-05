import { ScrollView, Text, View } from 'react-native';
import Card from '../../components/Card';
import KV from '../../components/KV';
import Btn from '../../components/Btn';
import { programName, instituteName } from '../../data/programs';
import { common } from '../../theme';

export default function StudentProfile({ me, onLogout }) {
  return (
    <ScrollView contentContainerStyle={common.pad}>
      <Text style={common.h2}>Profile</Text>
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
    </ScrollView>
  );
}
