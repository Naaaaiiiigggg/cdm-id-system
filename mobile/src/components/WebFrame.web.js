import { View } from 'react-native';

// Browser version. Normally keeps the app in a phone-width column in the middle of the page.
// With wide={true} (the admin on a wide window) it lets the app use the whole window instead.
// The structure is the same in both cases, so resizing the window does not rebuild the screens.
export const COLUMN_W = 480;

export default function WebFrame({ children, wide }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: wide ? '#F4F7F5' : '#DCE5E0' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: wide ? '100%' : COLUMN_W,
          overflow: 'hidden',
          boxShadow: wide ? 'none' : '0 0 40px rgba(14, 59, 42, 0.18)',
        }}
      >
        {children}
      </View>
    </View>
  );
}
