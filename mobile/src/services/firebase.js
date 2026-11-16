// Firebase connection. Every screen and service imports db / auth from here.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { Platform } from 'react-native';
import { initializeAuth, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This config only identifies your project. It is not a secret.
// Access is protected by the Firestore security rules, not by hiding these values.
const firebaseConfig = {
  apiKey: 'AIzaSyBFJQN3CJrOT1isXD693af5_bYbSWAa8tw',
  authDomain: 'cdm-id-system.firebaseapp.com',
  projectId: 'cdm-id-system',
  storageBucket: 'cdm-id-system.firebasestorage.app',
  messagingSenderId: '888161861190',
  appId: '1:888161861190:web:9c33b95ccd7813a81e5447',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Keeps the user signed in after the app or the browser tab is closed.
// - In a browser, Firebase keeps the login in the browser's own storage by default.
// - On a phone, we hand it AsyncStorage (that option only exists in the phone build of Firebase).
// initializeAuth can only run once, so after a fast refresh we reuse the existing one.
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (e) {
    auth = getAuth(app);
  }
}

// Auto-detect lets Firestore fall back to long polling on phones/networks where the
// default connection is blocked (avoids "Could not reach Cloud Firestore backend").
let db;
try {
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
} catch (e) {
  db = getFirestore(app);
}

export { app, auth, db };
