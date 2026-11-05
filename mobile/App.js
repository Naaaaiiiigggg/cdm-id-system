import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

import { C } from './src/theme';
import { auth } from './src/services/firebase';
import { buildSession, cancelRegistration, finishRegistration, isRegistering, signOutUser } from './src/services/auth';
import TabBar, { ADMIN_TABS, STUDENT_TABS } from './src/components/TabBar';

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

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);     // null or { uid, role, name, ... }
  const [screen, setScreen] = useState('splash');   // splash | login | register | forgot
  const [tab, setTab] = useState('home');

  const open = useCallback((s) => {
    setSession(s);
    if (s) setTab(s.role === 'admin' ? 'dash' : 'home');
  }, []);

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
      <View style={[styles.root, { backgroundColor: C.g9, justifyContent: 'center' }]}>
        <StatusBar style="light" />
        <ActivityIndicator color={C.gold} size="large" />
      </View>
    );
  }

  let body;
  let tabs = null;

  if (!session) {
    if (screen === 'splash') body = <Splash onNext={() => setScreen('login')} />;
    else if (screen === 'register') body = <Register onDone={afterRegister} onBack={async () => { await cancelRegistration(); setScreen('login'); }} />;
    else if (screen === 'forgot') body = <ForgotPassword onBack={() => setScreen('login')} />;
    else body = <Login onRegister={() => setScreen('register')} onForgot={() => setScreen('forgot')} />;
  } else if (session.role === 'admin') {
    tabs = ADMIN_TABS;
    body = {
      dash: <AdminDashboard />,
      list: <AdminRequests />,
      print: <AdminPrint />,
      accts: <AdminAccounts />,
    }[tab];
  } else {
    tabs = STUDENT_TABS;
    body = {
      home: <StudentHome me={session} go={setTab} />,
      req: <StudentRequest />,
      notif: <StudentAlerts me={session} />,
      prof: <StudentProfile me={session} onLogout={logout} />,
    }[tab];
  }

  const onSplash = screen === 'splash' && !session;
  return (
    <View style={[styles.root, onSplash && { backgroundColor: C.g9 }]}>
      <StatusBar style={onSplash ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>{body}</View>
      {tabs && <TabBar tabs={tabs} tab={tab} setTab={setTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: RNStatusBar.currentHeight || 44 },
});
