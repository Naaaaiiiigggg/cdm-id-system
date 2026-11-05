import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';

// Each tab: [key, Feather icon name, label]
export const STUDENT_TABS = [['home', 'home', 'Home'], ['req', 'file-text', 'Request'], ['notif', 'bell', 'Alerts'], ['prof', 'user', 'Profile']];
export const ADMIN_TABS = [['dash', 'grid', 'Dashboard'], ['list', 'list', 'Requests'], ['print', 'printer', 'Print'], ['accts', 'users', 'Accounts'], ['aprof', 'user', 'Profile']];

export default function TabBar({ tabs, tab, setTab }) {
  return (
    <View style={styles.bar}>
      {tabs.map(([key, icon, label]) => (
        <TouchableOpacity key={key} style={styles.tab} onPress={() => setTab(key)}>
          <Feather name={icon} size={22} color={tab === key ? C.g9 : C.mu} />
          <Text style={[styles.tx, tab === key && { color: C.g9, fontWeight: '800' }]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: C.sf, borderTopWidth: 1, borderTopColor: C.ln, paddingBottom: 14, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tx: { fontSize: 11, color: C.mu, fontWeight: '600' },
});
