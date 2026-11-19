import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';

// Each tab: [key, Feather icon name, label]
export const STUDENT_TABS = [['home', 'home', 'Home'], ['req', 'file-text', 'Request'], ['notif', 'bell', 'Alerts'], ['prof', 'user', 'Profile']];
export const ADMIN_TABS = [['dash', 'grid', 'Dashboard'], ['list', 'list', 'Requests'], ['print', 'printer', 'Print'], ['accts', 'users', 'Accounts'], ['aprof', 'user', 'Profile']];

// Bottom bar on phones and narrow windows. With side={true} (admin, wide browser window) it is a side menu.
export default function TabBar({ tabs, tab, setTab, side, subtitle = 'Registrar' }) {
  if (side) {
    return (
      <View style={styles.side}>
        <View style={styles.brand}>
          <Text style={styles.brandSm}>COLEGIO DE MONTALBAN</Text>
          <Text style={styles.brandH}>ID System</Text>
          <Text style={styles.brandSub}>{subtitle}</Text>
        </View>
        {tabs.map(([key, icon, label]) => {
          const on = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={({ hovered }) => [styles.item, on && styles.itemOn, !on && hovered && styles.itemHover]}
            >
              <Feather name={icon} size={19} color={on ? C.g9 : '#CFE0D6'} />
              <Text style={[styles.itemTx, on && { color: C.g9 }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

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

  side: { width: 236, backgroundColor: C.g9, paddingHorizontal: 14, paddingTop: 26, gap: 4 },
  brand: { paddingHorizontal: 8, paddingBottom: 22, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
  brandSm: { color: C.gold, fontSize: 10, letterSpacing: 1.6, fontWeight: '700' },
  brandH: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  brandSub: { color: '#CFE0D6', fontSize: 12, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10 },
  itemOn: { backgroundColor: C.gold },
  itemHover: { backgroundColor: 'rgba(255,255,255,0.08)' },
  itemTx: { color: '#CFE0D6', fontSize: 14, fontWeight: '700' },
});
