import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ArtKey } from '../lib/art';
import { tap } from '../lib/sound';
import { C, F, ledge } from '../theme';
import { Art } from '../ui';

export type TabId = 'home' | 'games' | 'ranking' | 'party' | 'settings';

export const TABS: { id: TabId; label: string; art: ArtKey }[] = [
  { id: 'home', label: 'Map', art: 'home' },
  { id: 'games', label: 'Games', art: 'games' },
  { id: 'ranking', label: 'Ranks', art: 'ranking' },
  { id: 'party', label: 'Party', art: 'party' },
  { id: 'settings', label: 'Settings', art: 'settings' },
];

export const NAV_H = 82;

/** Wooden tab bar with stone buttons; the active tab rises and turns orange. */
export function BottomNav({ tab, onChange, bottom }: { tab: TabId; onChange: (t: TabId) => void; bottom: number }) {
  return (
    <View style={[styles.bar, { bottom: Math.max(10, bottom) }]}>
      {TABS.map((t) => {
        const on = t.id === tab;
        const bg = on ? C.orange : C.stone;
        return (
          <Pressable
            key={t.id}
            onPress={() => {
              tap();
              onChange(t.id);
            }}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
          >
            {({ pressed }) => (
              <>
                <View
                  style={[
                    styles.btn,
                    { backgroundColor: bg, boxShadow: `${ledge(bg, on ? 6 : 4)}, 0px ${on ? 8 : 4}px 10px rgba(20,10,4,0.35)` },
                    on && { transform: [{ translateY: -10 }, { scale: 1.08 }] },
                    pressed && { transform: [{ translateY: on ? -7 : 2 }, { scale: on ? 1.08 : 1 }] },
                  ]}
                >
                  <Art name={t.art} size={on ? 36 : 32} />
                </View>
                <Text style={[styles.label, { color: on ? '#FFE0B0' : '#E9D2B0' }]}>{t.label}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: NAV_H,
    flexDirection: 'row',
    borderRadius: 28,
    backgroundColor: '#7A4626',
    boxShadow: 'inset 0px -6px 0px #5A3018, inset 0px 2px 0px rgba(255,220,170,0.25), 0px 12px 24px rgba(20,10,4,0.45)',
    maxWidth: 560,
    alignSelf: 'center',
    paddingTop: 6,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  btn: { width: 50, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: F.bold, fontSize: 12 },
});
