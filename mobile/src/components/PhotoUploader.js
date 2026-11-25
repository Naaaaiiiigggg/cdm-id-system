import { Text, TouchableOpacity, View } from 'react-native';
import { C, common } from '../theme';

// Phone app version: photo upload only exists in the browser (see PhotoUploader.web.js).
export default function PhotoUploader({ onCancel }) {
  return (
    <View>
      <Text style={common.mu}>Photo upload is available in the web version of the app.</Text>
      <TouchableOpacity onPress={onCancel}><Text style={{ color: C.mu, fontWeight: '700', textAlign: 'center', marginTop: 14 }}>Back</Text></TouchableOpacity>
    </View>
  );
}
