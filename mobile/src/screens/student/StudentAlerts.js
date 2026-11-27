import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Page from '../../components/Page';
import Card from '../../components/Card';
import useLoad from '../../utils/useLoad';
import { getMyAlerts, markAlertsRead } from '../../services/requests';
import { formatDate } from '../../utils/format';
import { common } from '../../theme';

export default function StudentAlerts({ me }) {
  const load = useLoad(() => getMyAlerts(me.uid), [me.uid]);
  const list = load.data || [];

  // Opening the screen marks everything as read. The list on screen keeps the copy it loaded,
  // so the alerts that were new still show their dot until the student leaves.
  useEffect(() => {
    if (load.data) markAlertsRead(load.data).catch(() => {});
  }, [load.data]);

  return (
    <Page title="Alerts" load={load} narrow>
      {list.length === 0 && <Card><Text style={common.mu}>No alerts yet.</Text></Card>}
      {list.map((a) => (
        <Card key={a.id}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {!a.readAt && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#D32F2F' }} />}
            <Text style={[common.bold, { flex: 1 }]}>{a.message}</Text>
          </View>
          <Text style={common.mu}>{formatDate(a.createdAt)}</Text>
        </Card>
      ))}
    </Page>
  );
}
