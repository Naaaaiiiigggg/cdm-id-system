import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { C } from '../theme';

// Each tab: [key, Feather icon name, label]
export const STUDENT_TABS = [['home', 'home', 'Home'], ['req', 'file-text', 'Request'], ['notif', 'bell', 'Alerts'], ['prof', 'user', 'Profile']];
export const ADMIN_TABS = [['dash', 'grid', 'Dashboard'], ['list', 'list', 'Requests'], ['accts', 'users', 'Accounts'], ['aprof', 'user', 'Profile']];

// Bottom bar on phones and narrow windows. With side={true} (wide browser window) it is a side menu.
// With compact={true} too (a phone on its side) it is the same side menu with tighter spacing and a slightly
// narrower width, so it fits the short screen (and scrolls if the screen is really small).
// Small red counter on a tab (for example unread alerts). inline = inside the side menu row.
const Badge = ({ n, inline }) => (n > 0 ? (
  <View style={[styles.badge, inline && styles.badgeInline]}>
    <Text style={styles.badgeTx}>{n > 9 ? '9+' : n}</Text>
  </View>
) : null);

export default function TabBar({ tabs, tab, setTab, side, compact, subtitle = 'Registrar', badges = {} }) {
  if (side) {
    const menu = (
      <>
        <View style={[styles.brand, compact && styles.brandC]}>
          <Text style={styles.brandSm}>COLEGIO DE MONTALBAN</Text>
          <Text style={[styles.brandH, compact && { fontSize: 20 }]}>ID System</Text>
          <Text style={styles.brandSub}>{subtitle}</Text>
        </View>
        {tabs.map(([key, icon, label]) => {
          const on = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={({ hovered }) => [styles.item, compact && styles.itemC, on && styles.itemOn, !on && hovered && styles.itemHover]}
            >
              <Feather name={icon} size={compact ? 18 : 19} color={on ? C.g9 : '#CFE0D6'} />
              <Text style={[styles.itemTx, compact && { fontSize: 13.5 }, on && { color: C.g9 }]}>{label}</Text>
              <Badge n={badges[key]} inline />
            </Pressable>
          );
        })}
      </>
    );
    if (compact) {
      return (
        <ScrollView style={styles.sideC} contentContainerStyle={styles.sideCIn} showsVerticalScrollIndicator={false}>
          {menu}
        </ScrollView>
      );
    }
    return <View style={styles.side}>{menu}</View>;
  }

  return (
    <View style={styles.bar}>
      {tabs.map(([key, icon, label]) => (
        <TouchableOpacity key={key} style={styles.tab} onPress={() => setTab(key)}>
          <View>
            <Feather name={icon} size={22} color={tab === key ? C.g9 : C.mu} />
            <Badge n={badges[key]} />
          </View>
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
  // compact: the same menu, a little narrower, with less space above and between the items
  sideC: { width: 212, flexGrow: 0, backgroundColor: C.g9 },
  sideCIn: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 10, gap: 2 },
  brand: { paddingHorizontal: 8, paddingBottom: 22, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
  brandC: { paddingBottom: 12, marginBottom: 6 },
  brandSm: { color: C.gold, fontSize: 10, letterSpacing: 1.6, fontWeight: '700' },
  brandH: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  brandSub: { color: '#CFE0D6', fontSize: 12, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10 },
  itemC: { paddingVertical: 8, gap: 10 },
  itemOn: { backgroundColor: C.gold },
  itemHover: { backgroundColor: 'rgba(255,255,255,0.08)' },
  itemTx: { color: '#CFE0D6', fontSize: 14, fontWeight: '700' },

  badge: { position: 'absolute', top: -5, right: -10, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#D32F2F', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeInline: { position: 'relative', top: 0, right: 0, marginLeft: 'auto' },
  badgeTx: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
