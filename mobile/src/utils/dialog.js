// Confirm / message pop-ups that work on the phone AND in a browser.
// - On a phone they use the normal Alert.
// - In a browser (where Alert does nothing) they use <DialogHost /> from App.js.
//
//   if (await confirmDialog({ title: 'Sign out', message: 'Are you sure?', confirmText: 'Sign out', destructive: true })) { ... }
//   await notify('Sent', 'A reset link was sent.');
import { Alert, Platform } from 'react-native';

let host = null; // set by <DialogHost />
export const registerDialogHost = (fn) => {
  host = fn;
  return () => { if (host === fn) host = null; };
};

const useNative = () => Platform.OS !== 'web' || !host;

export function confirmDialog({ title, message = '', confirmText = 'OK', cancelText = 'Cancel', destructive = false }) {
  return new Promise((resolve) => {
    if (useNative()) {
      Alert.alert(title, message, [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ], { cancelable: true, onDismiss: () => resolve(false) });
      return;
    }
    host({ title, message, confirmText, cancelText, destructive, resolve });
  });
}

export function notify(title, message = '') {
  return new Promise((resolve) => {
    if (useNative()) {
      Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }], { cancelable: true, onDismiss: () => resolve() });
      return;
    }
    host({ title, message, confirmText: 'OK', cancelText: null, resolve: () => resolve() });
  });
}
