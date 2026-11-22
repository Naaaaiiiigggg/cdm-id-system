import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';

// Browser only. Two jobs:
//  1. Show a small "install this app" banner (Android Chrome: an Install button; iPhone: how to Add to Home Screen).
//  2. When the app is already installed, stop pinch-zoom and the pull-to-refresh bounce so it feels like an app.

const KEY = 'cdm-install-hint-dismissed';
const HIDE_DAYS = 7;

const isStandalone = () =>
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function recentlyDismissed() {
  try {
    const t = Number(localStorage.getItem(KEY));
    return !!t && Date.now() - t < HIDE_DAYS * 86400000;
  } catch (e) {
    return false;
  }
}

// ---- installed app: no zoom, no bounce (the normal website keeps zoom for accessibility) ----
if (typeof window !== 'undefined' && isStandalone()) {
  const style = document.createElement('style');
  style.textContent = 'html, body { touch-action: pan-x pan-y; overscroll-behavior: none; }';
  document.head.appendChild(style);
  const vp = document.querySelector('meta[name="viewport"]');
  if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

// ---- Android / Chrome: catch the install prompt as early as possible (it can fire before React renders) ----
let deferred = null;
const listeners = new Set();
const notify = () => listeners.forEach((f) => f());
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; notify(); });
  window.addEventListener('appinstalled', () => { deferred = null; notify(); });
}

export default function InstallHint() {
  const [, tick] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const f = () => tick((n) => n + 1);
    listeners.add(f);
    return () => listeners.delete(f);
  }, []);

  if (hidden || isStandalone() || recentlyDismissed()) return null;

  const ios = isIOS();
  if (!ios && !deferred) return null; // the browser has not offered an install (yet)

  const dismiss = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* ignore */ }
    setHidden(true);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch (e) { /* ignore */ }
    deferred = null;
    setHidden(true);
  };

  return (
    <View style={{ margin: 12, marginBottom: 0, padding: 12, borderRadius: 14, backgroundColor: C.g9, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={ios ? 'upload' : 'download'} size={17} color={C.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Install the CdM ID app</Text>
        <Text style={{ color: '#CFE0D6', fontSize: 12, marginTop: 2 }}>
          {ios ? 'Tap the Share button, then "Add to Home Screen".' : 'Add it to your home screen for quicker access.'}
        </Text>
      </View>
      {ios ? null : (
        <TouchableOpacity onPress={install} style={{ backgroundColor: C.gold, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 }}>
          <Text style={{ color: C.g9, fontWeight: '800', fontSize: 12 }}>Install</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
        <Feather name="x" size={18} color="#CFE0D6" />
      </TouchableOpacity>
    </View>
  );
}
