import { View } from 'react-native';

// Browser version: keeps the app in a phone-width column in the middle of the page.
// On a phone browser (narrow screen) the column is the full width, so nothing changes.
// Step 5 (wider admin layout) will build on this file.
export const COLUMN_W = 480;

export default function WebFrame({ children }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#DCE5E0' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: COLUMN_W,
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(14, 59, 42, 0.18)',
        }}
      >
        {children}
      </View>
    </View>
  );
}
