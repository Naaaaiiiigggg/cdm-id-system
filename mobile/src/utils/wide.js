import { createContext, useContext } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

// "Wide" = a browser window at least this wide (a laptop, desktop or tablet on its side). It needs room for the 236px side menu
// plus the student's two columns, so a tablet held upright (600-899px) keeps the bottom tab bar and a wider column instead.
export const WIDE_MIN = 900;

// true inside the signed-in app when the window is wide (the side menu layout)
export const WideContext = createContext(false);
export const useWide = () => useContext(WideContext);

// true in a wide browser window, whoever is looking (used by the sign-in screens)
export function useWideWindow() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= WIDE_MIN;
}

// Used once, in App.js.
//   wide     -> someone is signed in (student or Registrar) and the window is wide
//   authWide -> nobody is signed in yet and the window is wide (login, register, forgot password)
export function useWideMode(session) {
  const ok = useWideWindow();
  return { wide: ok && !!session, authWide: ok && !session };
}
