import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SEED_SHAME, type Shame } from '../data/seed';
import type { ArtKey } from '../lib/art';
import { AVATARS, usePlays } from '../lib/prefs';
import { tap } from '../lib/sound';
import { usePersisted } from '../lib/store';
import { hashStr } from '../lib/utils';
import { computeTable, useLeague } from '../modules/efootball';
import { MODULE_MAP, artOf } from '../modules/registry';
import { C, F, ledge, shade } from '../theme';
import { Art, Float, Plaque } from '../ui';
import { SectionHead, TabTitle } from './common';

/** Every classmate gets a stable mascot. */
export const mascotOf = (name: string): ArtKey => AVATARS[hashStr(name) % AVATARS.length] ?? 'av-1';

function Podium() {
  const { players, matches } = useLeague();
  const table = computeTable(players, matches);
  const top = [table[1], table[0], table[2]];
  const heights = [104, 138, 84];
  const medals: ArtKey[] = ['medal2', 'medal1', 'medal3'];
  const tones = [C.cobalt, C.gold, C.orange];
  return (
    <Plaque pad={14} style={{ paddingBottom: 0, overflow: 'hidden' }}>
      <View style={styles.podium}>
        {top.map((s, i) =>
          s ? (
            <View key={s.name} style={{ flex: 1, alignItems: 'center' }}>
              <Float amp={5} duration={2200 + i * 300} delay={i * 200} style={{ alignItems: 'center' }}>
                {i === 1 ? <Art name="crown" size={44} style={{ marginBottom: -12, zIndex: 2 }} /> : null}
                <Art name={mascotOf(s.name)} size={i === 1 ? 84 : 70} />
              </Float>
              <Text style={styles.podName} numberOfLines={1}>
                {s.name}
              </Text>
              <Text style={styles.podPts}>{s.pts} pts</Text>
              <View style={[styles.step, { height: heights[i], backgroundColor: tones[i], boxShadow: `inset 0px -8px 0px ${shade(tones[i] ?? C.gold, -0.22)}, inset 0px 3px 0px ${shade(tones[i] ?? C.gold, 0.35)}` }]}>
                <Art name={medals[i] ?? 'medal3'} size={48} />
              </View>
            </View>
          ) : (
            <View key={i} style={{ flex: 1 }} />
          ),
        )}
      </View>
    </Plaque>
  );
}

function LeagueRest() {
  const { players, matches } = useLeague();
  const rest = computeTable(players, matches).slice(3);
  return (
    <View style={{ gap: 10 }}>
      {rest.map((s, i) => (
        <View key={s.name} style={styles.rankRow}>
          <Text style={styles.rankNum}>{i + 4}</Text>
          <Art name={mascotOf(s.name)} size={40} />
          <Text style={styles.rankName} numberOfLines={1}>
            {s.name}
          </Text>
          <Text style={styles.rankMeta}>
            {s.w}W {s.d}D {s.l}L
          </Text>
          <Text style={styles.rankPts}>{s.pts}</Text>
        </View>
      ))}
    </View>
  );
}

function Best({ id, label, value }: { id: string; label: string; value: string }) {
  const router = useRouter();
  const m = MODULE_MAP[id];
  return (
    <Pressable
      onPress={() => {
        tap();
        router.push({ pathname: '/module/[id]', params: { id } });
      }}
      style={({ pressed }) => [styles.best, pressed && { transform: [{ translateY: 2 }] }]}
    >
      <Art name={artOf(id)} size={46} />
      <Text style={styles.bestValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.bestLabel} numberOfLines={1}>
        {m?.title ?? label}
      </Text>
      <Text style={styles.bestSub}>{label}</Text>
    </Pressable>
  );
}

function PersonalBests() {
  const [f1] = usePersisted('arc:f1', { best: 0, recent: [] as number[] });
  const [flappy] = usePersisted('arc:flappy', 0);
  const [crossbar] = usePersisted('arc:crossbar', 0);
  const [simon] = usePersisted('arc:simon', 0);
  const [stroop] = usePersisted('arc:stroop', 0);
  const [math] = usePersisted('arc:math', 0);
  const [hilo] = usePersisted('arc:hilo', 0);
  const [fees] = usePersisted('tr:fees', 0);
  const [charades] = usePersisted('party:charades-best', 0);
  const [career] = usePersisted('tr:career:stats', { best: 0, played: 0 });
  const [comm] = usePersisted('tr:commentary:stats', { best: 0, played: 0 });
  const [bluff] = usePersisted('party:bluff:stats', { best: 0, played: 0 });
  const [pens] = usePersisted('ef:pens', { w: 0, l: 0, habits: [1, 1, 1] as number[] });
  const [rps] = usePersisted('arc:rps', { w: 0, l: 0 });
  const [taps] = usePersisted('arc:tapbattle', { record: 0, blue: 0, coral: 0 });
  const dash = (n: number, suffix = '') => (n ? `${n}${suffix}` : '—');
  const items: { id: string; label: string; value: string }[] = [
    { id: 'f1-lights', label: 'Fastest start', value: f1.best ? `${f1.best} ms` : '—' },
    { id: 'flappy', label: 'Best run', value: dash(flappy, ' goals') },
    { id: 'tap-battle', label: 'Tap record', value: dash(taps.record, ' taps') },
    { id: 'crossbar', label: 'Best score', value: dash(crossbar, ' pts') },
    { id: 'simon', label: 'Highest level', value: dash(simon) },
    { id: 'stroop', label: 'Best score', value: dash(stroop) },
    { id: 'math', label: 'Best sprint', value: dash(math) },
    { id: 'hilo', label: 'Best streak', value: dash(hilo) },
    { id: 'fees', label: 'Best streak', value: dash(fees) },
    { id: 'charades', label: 'Best round', value: dash(charades) },
    { id: 'career', label: 'Best quiz', value: career.played ? `${career.best}/8` : '—' },
    { id: 'commentary', label: 'Best quiz', value: comm.played ? `${comm.best}/8` : '—' },
    { id: 'bluff', label: 'Best quiz', value: bluff.played ? `${bluff.best}/8` : '—' },
    { id: 'pens', label: 'Shootouts W–L', value: pens.w + pens.l ? `${pens.w}–${pens.l}` : '—' },
    { id: 'rps', label: 'Series W–L', value: rps.w + rps.l ? `${rps.w}–${rps.l}` : '—' },
  ];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {items.map((it) => (
        <Best key={it.id} {...it} />
      ))}
    </View>
  );
}

function FameList({ title, art, rows, unit, people }: { title: string; art: ArtKey; rows: [string, number][]; unit: string; people?: boolean }) {
  return (
    <Plaque pad={14} style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Art name={art} size={38} />
        <Text style={styles.fameTitle}>{title}</Text>
      </View>
      {rows.length === 0 ? <Text style={styles.fameEmpty}>No entries yet. Go make history.</Text> : null}
      {rows.slice(0, 5).map(([n, v], i) => (
        <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.fameNum}>{i + 1}</Text>
          {people ? <Art name={mascotOf(n)} size={28} /> : null}
          <Text style={styles.fameName} numberOfLines={1}>
            {n}
          </Text>
          <Text style={styles.fameVal}>
            {v} {unit}
          </Text>
        </View>
      ))}
    </Plaque>
  );
}

function HallOfFame() {
  const [titles] = usePersisted<Record<string, number>>('ef:bracket-titles', {});
  const [roasted] = usePersisted<Record<string, number>>('party:who-titles', {});
  const [shame] = usePersisted<Shame[]>('ef:shame', SEED_SHAME);
  const [bomb] = usePersisted<Record<string, number>>('party:bomb', {});
  const [plays] = usePlays();
  const sort = (r: Record<string, number>) => Object.entries(r).sort((a, b) => b[1] - a[1]);
  const played = sort(plays).map(([id, n]) => [MODULE_MAP[id]?.title ?? id, n] as [string, number]);
  return (
    <View style={{ gap: 12 }}>
      <FameList title="Tournament champions" art="bracket" rows={sort(titles)} unit="titles" people />
      <FameList title="Most roasted" art="who-in-class" rows={sort(roasted)} unit="votes" people />
      <FameList title="Wooden spoon wall" art="wooden-spoon" rows={shame.slice().sort((a, b) => b.tomatoes - a.tomatoes).map((s) => [s.name, s.tomatoes] as [string, number])} unit="tomatoes" people />
      <FameList title="Blown up by the bomb" art="bomb" rows={sort(bomb)} unit="times" people />
      <FameList title="Most played games" art="games" rows={played} unit="plays" />
    </View>
  );
}

export function RankingTab() {
  return (
    <View style={{ gap: 16 }}>
      <TabTitle title="Leaderboard" sub="Kings, legends & the wooden spoon" art="ranking" />
      <SectionHead title="eFootball King of the Class" art="crown" />
      <Podium />
      <LeagueRest />
      <SectionHead title="Your personal bests" art="star" />
      <PersonalBests />
      <SectionHead title="Hall of fame" art="medal1" />
      <HallOfFame />
    </View>
  );
}

const styles = StyleSheet.create({
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  podName: { color: '#4A473F', fontFamily: F.slab, fontSize: 17, marginTop: 2 },
  podPts: { color: '#8E8A7E', fontFamily: F.bold, fontSize: 13, marginBottom: 6 },
  step: { alignSelf: 'stretch', borderTopLeftRadius: 18, borderTopRightRadius: 18, alignItems: 'center', paddingTop: 10 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, backgroundColor: C.stone, boxShadow: `${ledge(C.stone, 5)}, 0px 6px 10px rgba(20,10,4,0.25)` },
  rankNum: { color: '#A39E90', fontFamily: F.slab, fontSize: 17, width: 22 },
  rankName: { flex: 1, color: '#4A473F', fontFamily: F.bold, fontSize: 17 },
  rankMeta: { color: '#8E8A7E', fontFamily: F.semi, fontSize: 12.5 },
  rankPts: { color: C.orange, fontFamily: F.slab, fontSize: 20, minWidth: 28, textAlign: 'right' },
  best: { width: '31%', flexGrow: 1, padding: 10, borderRadius: 18, backgroundColor: C.stone, gap: 1, boxShadow: `${ledge(C.stone, 5)}, 0px 6px 10px rgba(20,10,4,0.25)` },
  bestValue: { color: '#4A473F', fontFamily: F.slab, fontSize: 17, marginTop: 4 },
  bestLabel: { color: '#6E6B60', fontFamily: F.bold, fontSize: 11.5 },
  bestSub: { color: '#A39E90', fontFamily: F.semi, fontSize: 10.5 },
  fameTitle: { color: '#4A473F', fontFamily: F.slab, fontSize: 18 },
  fameEmpty: { color: '#8E8A7E', fontFamily: F.semi, fontSize: 13.5 },
  fameNum: { color: '#A39E90', fontFamily: F.slab, fontSize: 15, width: 18 },
  fameName: { flex: 1, color: '#4A473F', fontFamily: F.bold, fontSize: 15.5 },
  fameVal: { color: C.orange, fontFamily: F.bold, fontSize: 13.5 },
});
