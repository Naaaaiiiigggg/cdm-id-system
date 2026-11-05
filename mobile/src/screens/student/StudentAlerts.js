import { Text } from 'react-native';
import Page from '../../components/Page';
import Card from '../../components/Card';
import useLoad from '../../utils/useLoad';
import { getMyAlerts } from '../../services/requests';
import { formatDate } from '../../utils/format';
import { common } from '../../theme';

export default function StudentAlerts({ me }) {
  const load = useLoad(() => getMyAlerts(me.uid), [me.uid]);
  const list = load.data || [];
  return (
    <Page title="Alerts" load={load}>
      {list.length === 0 && <Card><Text style={common.mu}>No alerts yet.</Text></Card>}
      {list.map((a) => (
        <Card key={a.id}><Text style={common.bold}>{a.message}</Text><Text style={common.mu}>{formatDate(a.createdAt)}</Text></Card>
      ))}
    </Page>
  );
}
