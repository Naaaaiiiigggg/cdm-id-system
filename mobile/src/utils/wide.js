import { createContext, useContext } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

// "Wide" = the Registrar (admin) is using a browser window at least this wide.
// Then the app shows a side menu and uses the extra room. Students and phones never get it.
export const WIDE_MIN = 900;

export const WideContext = createContext(false);
export const useWide = () => useContext(WideContext);

// Used once, in App.js. true only on the web, for an admin, on a wide window.
export function useWideAdmin(session) {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && session?.role === 'admin' && width >= WIDE_MIN;
}
