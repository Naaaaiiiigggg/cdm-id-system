import { ActivityIndicator, RefreshControl, ScrollView, Text } from 'react-native';
import Card from './Card';
import Btn from './Btn';
import { useWide } from '../utils/wide';
import { C, common } from '../theme';

// A scrolling screen that handles loading, errors and pull-to-refresh.
// Pass the object returned by useLoad() as `load`.
export default function Page({ title, load, children }) {
  const wide = useWide();
  const first = load.loading && load.data === null;
  return (
    <ScrollView
      contentContainerStyle={[common.pad, wide && { padding: 28, paddingBottom: 40 }]}
      refreshControl={<RefreshControl refreshing={load.loading && !first} onRefresh={load.reload} />}
    >
      {title ? <Text style={[common.h2, wide && { fontSize: 24 }]}>{title}</Text> : null}
      {first ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={C.g7} />
      ) : load.error ? (
        <Card>
          <Text style={{ color: C.bad }}>{load.error}</Text>
          <Btn title="Try again" kind="ghost" onPress={load.reload} />
        </Card>
      ) : (
        children
      )}
    </ScrollView>
  );
}
