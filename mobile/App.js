import { Platform } from 'react-native';
import WebFrame from './src/components/WebFrame';
import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { C } from './src/theme';
import { auth, db } from './src/services/firebase';
import { buildSession, cancelRegistration, finishRegistration, isRegistering, signOutUser } from './src/services/auth';
import { studentNotice } from './src/utils/suspension';
import { WideContext, useWideAdmin } from './src/utils/wide';
import TabBar, { ADMIN_TABS, STUDENT_TABS } from './src/components/TabBar';
import DialogHost from './src/components/DialogHost';

import Splash from './src/screens/auth/Splash';
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';
import ForgotPassword from './src/screens/auth/ForgotPassword';

import StudentHome from './src/screens/student/StudentHome';
import StudentRequest from './src/screens/student/StudentRequest';
import StudentAlerts from './src/screens/student/StudentAlerts';
import StudentProfile from './src/screens/student/StudentProfile';

import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminRequests from './src/screens/admin/AdminRequests';
import AdminPrint from './src/screens/admin/AdminPrint';
import AdminAccounts from './src/screens/admin/AdminAccounts';
import AdminProfile from './src/screens/admin/AdminProfile';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);     // null or { uid, role, name, ... }
  const [screen, setScreen] = useState('splash');   // splash | login | register | forgot
  const [tab, setTab] = useState('home');
  const [notice, setNotice] = useState('');         // shown on the sign-in screen (for example: you were suspended)

  const open = useCallback((s) => {
    setSession(s);
    if (s) { setTab(s.role === 'admin' ? 'dash' : 'home'); setNotice(''); }
  }, []);
  const wide = useWideAdmin(session);

  // Firebase tells us whenever someone signs in or out (and restores the last session).
  useEffect(() => {
    const stop = onAuthStateChanged(auth, async (user) => {
      if (isRegistering()) { setBooting(false); return; }
      if (!user) { setSession(null); setBooting(false); return; }
      try {
        open(await buildSession(user));
      } catch (e) {
        await signOutUser();
        setSession(null);
      }
      setBooting(false);
    });
    return stop;
  }, [open]);

  // While someone is signed in, watch their account. If the Registrar suspends it,
  // sign them out right away (without this they would stay in until they reload the page).
  useEffect(() => {
    if (!session?.uid) return undefined;
    const stop = onSnapshot(
      doc(db, 'users', session.uid),
      (snap) => {
        const p = snap.data();
        if (p && p.status !== 'Active') {
          setNotice(studentNotice(p));
          setSession(null);
          setScreen('login');
          signOutUser();
        }
      },
      () => {},
    );
    return stop;
  }, [session?.uid]);

  // Called when a new student taps Continue on the "Is this you?" screen.
  const afterRegister = async () => {
    finishRegistration();
    if (auth.currentUser) open(await buildSession(auth.currentUser));
  };

  const logout = async () => {
    await signOutUser();
    setScreen('login');
  };

  if (booting) {
    return (
      <WebFrame>
        <View style={[styles.root, { backgroundColor: C.g9, justifyContent: 'center' }]}>
          <StatusBar style="light" />
          <ActivityIndicator color={C.gold} size="large" />
        </View>
      </WebFrame>
    );
  }

  let body;
  let tabs = null;

  if (!session) {
    if (screen === 'splash') body = <Splash onNext={() => setScreen('login')} />;
    else if (screen === 'register') body = <Register onDone={afterRegister} onBack={async () => { await cancelRegistration(); setScreen('login'); }} />;
    else if (screen === 'forgot') body = <ForgotPassword onBack={() => setScreen('login')} />;
    else body = <Login notice={notice} onRegister={() => setScreen('register')} onForgot={() => setScreen('forgot')} />;
  } else if (session.role === 'admin') {
    tabs = ADMIN_TABS;
    body = {
      dash: <AdminDashboard />,
      list: <AdminRequests />,
      print: <AdminPrint />,
      accts: <AdminAccounts />,
      aprof: <AdminProfile me={session} onLogout={logout} />,
    }[tab];
  } else {
    tabs = STUDENT_TABS;
    body = {
      home: <StudentHome me={session} go={setTab} />,
      req: <StudentRequest me={session} go={setTab} />,
      notif: <StudentAlerts me={session} />,
      prof: <StudentProfile me={session} onLogout={logout} />,
    }[tab];
  }

  const onSplash = screen === 'splash' && !session;
  return (
    <WebFrame wide={wide}>
      <WideContext.Provider value={wide}>
        <View style={[styles.root, onSplash && { backgroundColor: C.g9 }, wide && { flexDirection: 'row' }]}>
          <StatusBar style={onSplash ? 'light' : 'dark'} />
          {tabs && wide && <TabBar side tabs={tabs} tab={tab} setTab={setTab} />}
          {wide ? (
            <View style={styles.main}><View style={styles.content}>{body}</View></View>
          ) : (
            <View style={{ flex: 1 }}>{body}</View>
          )}
          {tabs && !wide && <TabBar tabs={tabs} tab={tab} setTab={setTab} />}
          <DialogHost />
        </View>
      </WideContext.Provider>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'web' ? 0 : (RNStatusBar.currentHeight || 44) },
  main: { flex: 1, alignItems: 'center' },
  content: { flex: 1, width: '100%', maxWidth: 1100 },
});
