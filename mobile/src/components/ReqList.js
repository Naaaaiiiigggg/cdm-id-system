import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Card from './Card';
import Pill from './Pill';
import { useWide } from '../utils/wide';
import { formatDate } from '../utils/format';
import { C, common } from '../theme';

// A card listing requests with the student name, request number, type and status.
// Pass onPress(request) to make every row tappable (it also highlights on hover in a browser).
// On a wide admin window it turns into a table with columns.
export default function ReqList({ list, students, onPress }) {
  const wide = useWide();
  if (list.length === 0) return <Card><Text style={common.mu}>Nothing here.</Text></Card>;
  return (
    <Card style={{ paddingVertical: 4, paddingHorizontal: 0 }}>
      {wide ? (
        <View style={[common.listRow, styles.head]}>
          <Text style={[styles.hd, { flex: 3 }]}>STUDENT</Text>
          <Text style={[styles.hd, { flex: 1.2 }]}>TYPE</Text>
          <Text style={[styles.hd, { flex: 1.2 }]}>SUBMITTED</Text>
          <Text style={[styles.hd, { flex: 1.4 }]}>STATUS</Text>
          {onPress ? <View style={{ width: 18 }} /> : null}
        </View>
      ) : null}
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
          {wide ? (
            <>
              <View style={{ flex: 3, gap: 3 }}>
                <Text style={common.bold}>{students[r.studentNo]?.name || r.studentNo}</Text>
                <Text style={common.mu}>{r.studentNo} · {r.requestNo}</Text>
              </View>
              <View style={{ flex: 1.2, flexDirection: 'row' }}><Pill s={r.type} /></View>
              <Text style={[common.mu, { flex: 1.2 }]}>{formatDate(r.createdAt)}</Text>
              <View style={{ flex: 1.4, flexDirection: 'row' }}><Pill s={r.status} /></View>
              {onPress ? <Feather name="chevron-right" size={18} color={C.mu} /> : null}
            </>
          ) : (
            <>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={common.bold}>{students[r.studentNo]?.name || r.studentNo}</Text>
                <Text style={common.mu}>{r.requestNo} · {formatDate(r.createdAt)}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}><Pill s={r.type} /></View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <Pill s={r.status} />
                {onPress ? <Feather name="chevron-right" size={18} color={C.mu} /> : null}
              </View>
            </>
          )}
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 14, paddingVertical: 9, backgroundColor: C.g1 },
  hd: { fontSize: 11, fontWeight: '800', color: C.mu, letterSpacing: 0.8 },
});
