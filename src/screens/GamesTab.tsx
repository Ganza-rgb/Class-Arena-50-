import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ModuleGrid } from '../components/ModuleCard';
import type { ArtKey } from '../lib/art';
import { tap } from '../lib/sound';
import { CATEGORIES, CATEGORY_ORDER, MODULES, type CategoryId, type ModuleDef } from '../modules/registry';
import { C, F, ledge } from '../theme';
import { Art, Empty } from '../ui';
import { SearchBar, SectionHead, TabTitle } from './common';

function FilterPill({ label, art, on, onPress }: { label: string; art: ArtKey; on: boolean; onPress: () => void }) {
  const bg = on ? C.orange : C.stone;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.pill, { backgroundColor: bg, boxShadow: `${ledge(bg, 4)}, 0px 5px 8px rgba(20,10,4,0.25)` }, pressed && { transform: [{ translateY: 2 }] }]}
    >
      <Art name={art} size={24} />
      <Text style={[styles.pillText, { color: on ? '#fff' : '#5C5A52' }]}>{label}</Text>
    </Pressable>
  );
}

export function GamesTab({
  width,
  query,
  setQuery,
  cat,
  setCat,
}: {
  width: number;
  query: string;
  setQuery: (q: string) => void;
  cat: CategoryId | 'all';
  setCat: (c: CategoryId | 'all') => void;
}) {
  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const list = MODULES.filter((m) => (cat === 'all' || m.cat === cat) && (!q || `${m.title} ${m.blurb} ${m.tag}`.toLowerCase().includes(q)));
    return CATEGORY_ORDER.map((c) => ({ cat: c, items: list.filter((m) => m.cat === c) })).filter((g): g is { cat: CategoryId; items: ModuleDef[] } => g.items.length > 0);
  }, [cat, q]);

  return (
    <View style={{ gap: 16 }}>
      <TabTitle title={cat === 'all' ? 'All Games' : CATEGORIES[cat].short} sub={cat === 'all' ? `${MODULES.length} games across 6 islands` : CATEGORIES[cat].tagline} art={cat === 'all' ? 'games' : CATEGORIES[cat].art} />
      <SearchBar value={query} onChange={setQuery} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 6, paddingHorizontal: 2 }}>
        <FilterPill label="All" art="star" on={cat === 'all'} onPress={() => setCat('all')} />
        {CATEGORY_ORDER.map((c) => (
          <FilterPill key={c} label={CATEGORIES[c].short} art={CATEGORIES[c].art} on={cat === c} onPress={() => setCat(c)} />
        ))}
      </ScrollView>
      {groups.length === 0 ? <Empty text={`Nothing matches “${query}”. Try “football”, “anon” or “2-player”.`} /> : null}
      {groups.map((g) => (
        <View key={g.cat} style={{ gap: 12 }}>
          <SectionHead title={CATEGORIES[g.cat].label} art={CATEGORIES[g.cat].art} count={g.items.length} />
          <ModuleGrid modules={g.items} width={width} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  pillText: { fontFamily: F.bold, fontSize: 14 },
});
