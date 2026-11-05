import Page from '../../components/Page';
import ReqList from '../../components/ReqList';
import useLoad from '../../utils/useLoad';
import { getAdminData } from '../../services/requests';

export default function AdminPrint() {
  const load = useLoad(getAdminData, []);
  const list = (load.data?.requests || []).filter((r) => r.status === 'For Printing');
  return (
    <Page title="Print list" load={load}>
      <ReqList list={list} students={load.data?.students || {}} />
    </Page>
  );
}
