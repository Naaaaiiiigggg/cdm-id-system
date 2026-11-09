import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Card from './Card';
import Pill from './Pill';
import { formatDate } from '../utils/format';
import { C, common } from '../theme';

// A card listing requests with the student name, request number, type and status.
// Pass onPress(request) to make every row tappable (it also highlights on hover in a browser).
export default function ReqList({ list, students, onPress }) {
  if (list.length === 0) return <Card><Text style={common.mu}>Nothing here.</Text></Card>;
  return (
    <Card style={{ paddingVertical: 4, paddingHorizontal: 0 }}>
      {list.map((r, i) => (
        <Pressable
          key={r.id}
          disabled={!onPress}
          onPress={() => onPress(r)}
          style={({ pressed, hovered }) => [
            common.listRow,
            { paddingHorizontal: 14 },
            i === list.length - 1 && { borderBottomWidth: 0 },
            (pressed || hovered) && onPress && { backgroundColor: C.g1 },
          ]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={common.bold}>{students[r.studentNo]?.name || r.studentNo}</Text>
            <Text style={common.mu}>{r.requestNo} · {formatDate(r.createdAt)}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}><Pill s={r.type} /></View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Pill s={r.status} />
            {onPress ? <Feather name="chevron-right" size={18} color={C.mu} /> : null}
          </View>
        </Pressable>
      ))}
    </Card>
  );
}
