import { createContext, useContext, useEffect, useReducer } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

// "Wide" = a browser window at least this wide (a laptop, desktop or tablet on its side). It needs room for the 236px side menu
// plus the student's two columns, so a tablet held upright (600-899px) keeps the bottom tab bar and a wider column instead.
export const WIDE_MIN = 900;

// A phone is a screen whose SHORTEST side is under this (phones are about 320-430, tablets start at about 600).
// We look at the real screen, not the window, so the on-screen keyboard can never make a portrait phone look "sideways".
const PHONE_MAX = 600;

const screenInfo = () => (typeof window !== 'undefined' ? window.screen : null);

// True when a phone is held on its side. The screen is then only ~360-430px tall but ~800-930px wide.
export function isPhoneLandscape(width, height) {
  const s = screenInfo();
  const shortest = s && s.width && s.height ? Math.min(s.width, s.height) : Math.min(width, height);
  if (shortest >= PHONE_MAX) return false;
  const type = s && s.orientation && s.orientation.type;
  return type ? type.startsWith('landscape') : width > height;
}

// "Short" = a phone on its side. The app then uses the wide layout in a compact form:
// a narrow icon rail instead of the side menu, a slim header, smaller spacing and a smaller ID preview.
export function useShort() {
  const { width, height } = useWindowDimensions();
  const [, refresh] = useReducer((n) => n + 1, 0);

  // The screen's orientation can change a moment after the window size does, so listen for it too.
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const o = screenInfo() && window.screen.orientation;
    if (!o || !o.addEventListener) return undefined;
    o.addEventListener('change', refresh);
    return () => o.removeEventListener('change', refresh);
  }, []);

  return Platform.OS === 'web' && isPhoneLandscape(width, height);
}

// true inside the signed-in app when the window is wide (the side menu layout)
export const WideContext = createContext(false);
export const useWide = () => useContext(WideContext);

// true in a wide browser window, whoever is looking (used by the sign-in screens).
// A phone on its side counts as wide too, because it is much wider than it is tall.
export function useWideWindow() {
  const { width } = useWindowDimensions();
  const short = useShort();
  return Platform.OS === 'web' && (width >= WIDE_MIN || short);
}

// Used once, in App.js.
//   wide     -> someone is signed in (student or Registrar) and the window is wide
//   authWide -> nobody is signed in yet and the window is wide (login, register, forgot password)
export function useWideMode(session) {
  const ok = useWideWindow();
  return { wide: ok && !!session, authWide: ok && !session };
}
