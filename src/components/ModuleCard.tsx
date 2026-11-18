import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePlays } from '../lib/prefs';
import { tap } from '../lib/sound';
import { MODULES, artOf, type ModuleDef } from '../modules/registry';
import { C, F, TILE_TONES, ledge, shade } from '../theme';
import { Art, Float } from '../ui';

/** Stable accent per module (used for module screen banners and tag pills). */
export const toneOf = (id: string): string => {
  const i = Math.max(0, MODULES.findIndex((m) => m.id === id));
  return TILE_TONES[(i * 3) % TILE_TONES.length] ?? C.orange;
};

/** Stone game tile: 3D art on a coloured pad, slab title, tag pill. */
export function ModuleCard({ m, width }: { m: ModuleDef; width: number }) {
  const router = useRouter();
  const [plays] = usePlays();
  const tone = toneOf(m.id);
  const n = plays[m.id] ?? 0;
  const i = MODULES.indexOf(m);
  return (
    <Pressable
      onPress={() => {
        tap();
        router.push({ pathname: '/module/[id]', params: { id: m.id } });
      }}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={m.title}
    >
      <View style={[styles.pad, { backgroundColor: shade(tone, 0.55), boxShadow: `inset 0px -5px 0px ${shade(tone, 0.25)}` }]}>
        <Float amp={4} duration={2600 + (i % 5) * 300} delay={(i % 7) * 180}>
          <Art name={artOf(m.id)} size={Math.min(84, width * 0.55)} />
        </Float>
        <View style={[styles.tag, { backgroundColor: tone }]}>
          <Text style={styles.tagText}>{m.tag}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {m.title}
      </Text>
      <Text style={styles.sub} numberOfLines={1}>
        {n > 0 ? `Played ${n}× · +${n * 15} coins` : m.blurb}
      </Text>
    </Pressable>
  );
}

export function ModuleGrid({ modules, width }: { modules: ModuleDef[]; width: number }) {
  const gap = 12;
  const half = Math.floor((width - gap) / 2);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {modules.map((m) => (
        <ModuleCard key={m.id} m={m} width={half} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.stone, borderRadius: 22, padding: 10, paddingBottom: 14, boxShadow: `${ledge(C.stone, 6)}, 0px 10px 16px rgba(20,10,4,0.3)` },
  pressed: { transform: [{ translateY: 3 }], boxShadow: ledge(C.stone, 3) },
  pad: { height: 110, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', top: 7, right: 7, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { color: '#fff', fontFamily: F.bold, fontSize: 9.5, letterSpacing: 0.6 },
  title: { color: '#5C5A52', fontFamily: F.slabBold, fontSize: 16, lineHeight: 20, marginTop: 9, minHeight: 40 },
  sub: { color: '#8E8A7E', fontFamily: F.medium, fontSize: 12 },
});
