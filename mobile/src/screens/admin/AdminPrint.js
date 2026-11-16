import { useState } from 'react';
import Page from '../../components/Page';
import ReqList from '../../components/ReqList';
import ManageRequestModal from '../../components/ManageRequestModal';
import useLoad from '../../utils/useLoad';
import { getAdminData } from '../../services/requests';

export default function AdminPrint() {
  const load = useLoad(getAdminData, []);
  const [sel, setSel] = useState(null);
  const list = (load.data?.requests || []).filter((r) => r.status === 'For Printing');
  return (
    <Page title="Print list" load={load}>
      <ReqList list={list} students={load.data?.students || {}} onPress={setSel} />
      <ManageRequestModal
        request={sel ? (load.data?.requests || []).find((r) => r.id === sel.id) || sel : null}
        student={sel ? (load.data?.students || {})[sel.studentNo] : {}}
        onClose={() => setSel(null)}
        onSaved={() => { setSel(null); load.reload(); }}
      />
    </Page>
  );
}
