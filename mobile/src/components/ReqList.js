import { Text, View } from 'react-native';
import Card from './Card';
import Pill from './Pill';
import { common } from '../theme';

// A card listing requests with the student name, request number and status.
export default function ReqList({ list, students }) {
  if (list.length === 0) return <Card><Text style={common.mu}>Nothing here.</Text></Card>;
  return (
    <Card>
      {list.map((r, i) => (
        <View key={r.id} style={[common.listRow, i === list.length - 1 && { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={common.bold}>{students[r.studentNo]?.name || r.studentNo}</Text>
            <Text style={common.mu}>{r.requestNo} · {r.type}</Text>
          </View>
          <Pill s={r.status} />
        </View>
      ))}
    </Card>
  );
}
