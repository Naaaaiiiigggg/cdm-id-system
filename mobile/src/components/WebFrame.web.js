import { View, useWindowDimensions } from 'react-native';

// Browser version. Normally keeps the app in a phone-width column in the middle of the page.
// With wide={true} (a wide window, or a phone on its side) it lets the app use the whole window instead.
// The structure is the same in both cases, so resizing the window does not rebuild the screens.
// Phones get a 480px column. A tablet held upright (600px up to the wide layout) gets a roomier column
// with the same bottom tab bar, so the content is not squeezed and not stretched either.
export const COLUMN_W = 480;
export const TABLET_COLUMN_W = 768;
export const TABLET_MIN = 600;

export default function WebFrame({ children, wide }) {
  const { width } = useWindowDimensions();
  const columnW = width >= TABLET_MIN ? TABLET_COLUMN_W : COLUMN_W;
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: wide ? '#F4F7F5' : '#DCE5E0' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: wide ? '100%' : columnW,
          overflow: 'hidden',
          boxShadow: wide ? 'none' : '0 0 40px rgba(14, 59, 42, 0.18)',
        }}
      >
        {children}
      </View>
    </View>
  );
}
