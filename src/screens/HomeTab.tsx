import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { TabId } from '../components/Nav';
import { ModuleCard } from '../components/ModuleCard';
import { usePlays, useProfile } from '../lib/prefs';
import { tap } from '../lib/sound';
import { CATEGORIES, CATEGORY_ORDER, MODULES, MODULE_MAP, type CategoryId, type ModuleDef } from '../modules/registry';
import { C, F, ledge } from '../theme';
import { Art, Chunky, Float, Grad, Plaque } from '../ui';

export type Go = (tab: TabId, opts?: { cat?: CategoryId | 'all'; query?: string }) => void;

/** Next Thursday 20:00 local, or "live" during Thursday 20:00–22:00. */
function classNight(now: number): { live: boolean; label: string } {
  const d = new Date(now);
  const start = new Date(d);
  start.setHours(20, 0, 0, 0);
  start.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7));
  if (start.getTime() + 2 * 3600_000 < now) start.setDate(start.getDate() + 7);
  const diff = start.getTime() - now;
  if (diff <= 0) return { live: true, label: 'LIVE NOW' };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  return { live: false, label: days ? `Starts in ${days}d ${hours}h` : `Starts in ${hours}h ${mins}m` };
}

function ClassNight({ go }: { go: Go }) {
  const [now] = useState(() => Date.now());
  const night = classNight(now);
  return (
    <View style={{ marginTop: 6 }}>
      <Plaque pad={18} style={{ paddingRight: 120 }}>
        <View style={styles.nightTag}>
          <View style={[styles.liveDot, night.live && { backgroundColor: C.live }]} />
          <Text style={styles.nightTagText}>{night.live ? 'LIVE NOW' : 'THURSDAY · 8 PM'}</Text>
        </View>
        <Text style={styles.nightTitle}>Class Night</Text>
        <Text style={styles.nightSub}>Trivia battle, Imposter, Hot Seat, then the podium.</Text>
        <Text style={styles.nightWhen}>{night.label}</Text>
      </Plaque>
      <Float amp={7} duration={3200} sway={3} style={styles.nightArt}>
        <Art name="bracket" size={120} />
      </Float>
      <Chunky title={night.live ? 'Join Class Night' : 'Warm up now'} art="party" onPress={() => go('party')} style={{ marginTop: 14 }} />
    </View>
  );
}

const X_FRACTIONS = [0.3, 0.7, 0.32, 0.68, 0.3, 0.7];
const STEP = 230;

function Island({ id, index, cx, cy, stars, here, onPress }: { id: CategoryId; index: number; cx: number; cy: number; stars: number; here: boolean; onPress: () => void }) {
  const [profile] = useProfile();
  const c = CATEGORIES[id];
  const n = MODULES.filter((m) => m.cat === id).length;
  return (
    <View style={[styles.island, { left: cx - 95, top: cy - 110 }]}>
      <Pressable
        onPress={() => {
          tap();
          onPress();
        }}
        style={({ pressed }) => [{ alignItems: 'center' }, pressed && { transform: [{ scale: 0.96 }] }]}
        accessibilityLabel={`${c.short} island, ${n} games`}
      >
        <Float amp={6} duration={2800 + index * 240} delay={index * 300} style={{ alignItems: 'center' }}>
          <View style={styles.land}>
            <Grad colors={['#9BE07A', C.grass, C.grass2]} angle="down" />
            <View style={styles.dirt} />
          </View>
          <View style={styles.landmark}>
            <Art name={c.art} size={104} />
          </View>
          <View style={styles.num}>
            <Text style={styles.numText}>{index + 1}</Text>
          </View>
        </Float>
        <Plaque pad={8} style={styles.islandLabel}>
          <Text style={styles.islandName} numberOfLines={1}>
            {c.short}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
            {[0, 1, 2].map((k) => (
              <Text key={k} style={[styles.star, k < stars ? { color: C.gold } : { color: '#CFCBBF' }]}>
                ★
              </Text>
            ))}
            <Text style={styles.islandMeta}>{n} games</Text>
          </View>
        </Plaque>
      </Pressable>
      {here ? (
        <Float amp={8} duration={1400} style={styles.you}>
          <View style={styles.youBubble}>
            <Text style={styles.youText}>You!</Text>
          </View>
          <View style={styles.youFace}>
            <Art name={profile.avatar} size={44} />
          </View>
        </Float>
      ) : null}
    </View>
  );
}

function ClassMap({ width, go }: { width: number; go: Go }) {
  const [plays] = usePlays();
  const height = CATEGORY_ORDER.length * STEP + 30;
  const pts = CATEGORY_ORDER.map((_, i) => ({ x: (X_FRACTIONS[i] ?? 0.5) * width, y: 130 + i * STEP }));
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1] ?? p;
    const my = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  }, '');

  const lastCat = useMemo(() => {
    const top = Object.entries(plays).sort((a, b) => b[1] - a[1])[0]?.[0];
    return (top && MODULE_MAP[top]?.cat) || CATEGORY_ORDER[0];
  }, [plays]);

  return (
    <View style={{ height, marginTop: 10 }}>
      {/* river */}
      <View style={[styles.river, { top: STEP * 2.4, width: width + 80 }]}>
        <Grad colors={['#7FD8EC', C.water]} angle="down" />
      </View>
      <View style={[styles.tree, { left: 8, top: STEP * 1.2 }]} />
      <View style={[styles.tree, { right: 4, top: STEP * 3.3, width: 56, height: 56 }]} />
      <View style={[styles.tree, { left: 18, top: STEP * 4.6, width: 40, height: 40 }]} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={d} stroke="#E9E4D6" strokeWidth={22} fill="none" strokeLinecap="round" />
        <Path d={d} stroke="#F6B80B" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray="2 20" />
      </Svg>
      {CATEGORY_ORDER.map((id, i) => {
        const inCat = MODULES.filter((m) => m.cat === id);
        const played = inCat.filter((m) => (plays[m.id] ?? 0) > 0).length;
        const stars = played === 0 ? 0 : played >= inCat.length ? 3 : played >= inCat.length / 2 ? 2 : 1;
        const p = pts[i] ?? { x: 0, y: 0 };
        return <Island key={id} id={id} index={i} cx={p.x} cy={p.y} stars={stars} here={id === lastCat} onPress={() => go('games', { cat: id })} />;
      })}
    </View>
  );
}

export function HomeTab({ width, go }: { width: number; go: Go }) {
  const [plays] = usePlays();
  const picks = useMemo(() => {
    const ranked = Object.entries(plays)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => MODULE_MAP[id])
      .filter((m): m is ModuleDef => !!m);
    const defaults = ['confessions', 'imposter', 'flappy', 'songs'].map((id) => MODULE_MAP[id]).filter((m): m is ModuleDef => !!m);
    const out: ModuleDef[] = [];
    for (const m of [...ranked, ...defaults]) if (!out.includes(m) && out.length < 4) out.push(m);
    return out;
  }, [plays]);

  return (
    <View style={{ gap: 14 }}>
      <ClassNight go={go} />
      <ClassMap width={width} go={go} />
      <Plaque pad={14}>
        <Text style={styles.picksTitle}>Today’s picks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 6, paddingRight: 6 }}>
          {picks.map((m) => (
            <ModuleCard key={m.id} m={m} width={150} />
          ))}
        </ScrollView>
      </Plaque>
    </View>
  );
}

const styles = StyleSheet.create({
  nightTag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#FFE9CF', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange },
  nightTagText: { color: '#B85C12', fontFamily: F.bold, fontSize: 12, letterSpacing: 0.6 },
  nightTitle: { color: C.stoneText, fontFamily: F.slab, fontSize: 34, lineHeight: 40, marginTop: 4 },
  nightSub: { color: '#6E6B60', fontFamily: F.medium, fontSize: 14, lineHeight: 19 },
  nightWhen: { color: '#B85C12', fontFamily: F.bold, fontSize: 15, marginTop: 6 },
  nightArt: { position: 'absolute', right: 2, top: -22 },
  island: { position: 'absolute', width: 190, alignItems: 'center' },
  land: { width: 170, height: 78, borderRadius: 999, overflow: 'hidden', marginTop: 70, boxShadow: `inset 0px -8px 0px ${C.grass2}, 0px 16px 18px rgba(20,40,10,0.35)` },
  dirt: { position: 'absolute', left: 20, right: 20, bottom: -26, height: 40, borderRadius: 999, backgroundColor: '#8A5530' },
  landmark: { position: 'absolute', top: 4 },
  num: { position: 'absolute', left: 6, top: 70, width: 38, height: 38, borderRadius: 13, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', boxShadow: `${ledge(C.orange, 4)}, 0px 4px 8px rgba(30,15,5,0.3)` },
  numText: { color: '#FFF3DF', fontFamily: F.slab, fontSize: 20 },
  islandLabel: { marginTop: 10, minWidth: 150, alignItems: 'center', borderRadius: 18 },
  islandName: { color: C.stoneText, fontFamily: F.slab, fontSize: 17 },
  islandMeta: { color: '#8E8A7E', fontFamily: F.semi, fontSize: 12, marginLeft: 4 },
  star: { fontSize: 15, fontFamily: F.bold },
  you: { position: 'absolute', right: -6, top: 36, alignItems: 'center' },
  youBubble: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 3, boxShadow: '0px 3px 6px rgba(0,0,0,0.2)' },
  youText: { color: '#3D3A35', fontFamily: F.bold, fontSize: 13 },
  youFace: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E9F6FF', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 6px 10px rgba(0,0,0,0.3)' },
  river: { position: 'absolute', left: -40, height: 64, borderRadius: 40, overflow: 'hidden', transform: [{ rotate: '-8deg' }], opacity: 0.95 },
  tree: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: '#3F8A2F', boxShadow: 'inset -6px -8px 0px #2F6E22, 0px 8px 8px rgba(0,0,0,0.25)' },
  picksTitle: { color: C.stoneText, fontFamily: F.slab, fontSize: 22, marginBottom: 4 },
});
