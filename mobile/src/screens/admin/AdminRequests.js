import Page from '../../components/Page';
import ReqList from '../../components/ReqList';
import useLoad from '../../utils/useLoad';
import { getAdminData } from '../../services/requests';

export default function AdminRequests() {
  const load = useLoad(getAdminData, []);
  return (
    <Page title="Requests" load={load}>
      <ReqList list={load.data?.requests || []} students={load.data?.students || {}} />
    </Page>
  );
}
