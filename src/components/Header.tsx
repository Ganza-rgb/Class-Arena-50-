import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SEED_CONFESSIONS, SEED_CRUSHES, type Confession, type Crush } from '../data/seed';
import type { ArtKey } from '../lib/art';
import { useCoins, useProfile, useSeenAt } from '../lib/prefs';
import { usePersisted } from '../lib/store';
import { nowMs, timeAgo } from '../lib/utils';
import { useLeague } from '../modules/efootball';
import { useDrops } from '../modules/vibes';
import { C, F, ledge } from '../theme';
import { Art, Coins, Empty, Sheet, StoneBtn, Txt } from '../ui';

/** Mascot avatar on a stone disc. */
export function Avatar({ art, size = 52 }: { art: ArtKey; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.stone, alignItems: 'center', justifyContent: 'center', boxShadow: `${ledge(C.stone, 5)}, 0px 6px 12px rgba(30,15,5,0.28)` }}>
      <Art name={art} size={size * 0.86} />
    </View>
  );
}

type Activity = { id: string; ts: number; art: ArtKey; title: string; sub: string; module: string };

function useActivity(): Activity[] {
  const [crushes] = usePersisted<Crush[]>('crush:board', SEED_CRUSHES);
  const [confs] = usePersisted<Confession[]>('crush:confessions', SEED_CONFESSIONS);
  const [drops] = useDrops();
  const { matches } = useLeague();
  return useMemo(() => {
    const a: Activity[] = [
      ...crushes.slice(0, 4).map((c) => ({ id: `c${c.id}`, ts: c.ts, art: 'crush-board' as const, title: 'New secret crush dropped', sub: `To: ${c.to}`, module: 'crush-board' })),
      ...confs.slice(0, 4).map((c) => ({ id: `f${c.id}`, ts: c.ts, art: 'confessions' as const, title: `Confession #${c.num}`, sub: c.text, module: 'confessions' })),
      ...drops.slice(0, 4).map((d) => ({ id: `d${d.id}`, ts: d.ts, art: 'song-drop' as const, title: `${d.by} dropped a song`, sub: `${d.track.title} · ${d.track.artist}`, module: 'song-drop' })),
      ...matches.slice(-4).map((m) => ({ id: `m${m.id}`, ts: m.ts, art: 'league' as const, title: 'League result', sub: `${m.home} ${m.hs}–${m.as} ${m.away}`, module: 'league' })),
    ];
    return a.sort((x, y) => y.ts - x.ts).slice(0, 14);
  }, [crushes, confs, drops, matches]);
}

export function Header({ onAvatar, onSearch }: { onAvatar: () => void; onSearch: () => void }) {
  const router = useRouter();
  const [profile] = useProfile();
  const coins = useCoins();
  const [seenAt, setSeenAt] = useSeenAt();
  const [open, setOpen] = useState(false);
  const activity = useActivity();
  const unseen = activity.filter((a) => a.ts > seenAt).length;
  const close = () => {
    setOpen(false);
    setSeenAt(nowMs());
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={onAvatar} accessibilityLabel="Profile and settings">
        <Avatar art={profile.avatar} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.hi} numberOfLines={1}>
          Hey, {profile.name.split(' ')[0]}!
        </Text>
        <Text style={styles.sub}>Your class is out exploring</Text>
      </View>
      <StoneBtn icon={Search} onPress={onSearch} size={44} label="Search games" />
      <StoneBtn art="bell" onPress={() => setOpen(true)} size={44} label={`Notifications, ${unseen} new`} badge={unseen} />
      <View style={{ position: 'absolute', right: 0, top: 64 }}>
        <Coins value={coins} />
      </View>

      <Sheet visible={open} onClose={close} title="What’s new">
        {activity.length === 0 ? <Empty text="Nothing new yet." /> : null}
        {activity.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => {
              close();
              router.push({ pathname: '/module/[id]', params: { id: a.module } });
            }}
            style={({ pressed }) => [styles.item, a.ts > seenAt && { borderColor: C.borderStrong }, pressed && { opacity: 0.8 }]}
          >
            <Art name={a.art} size={40} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="h3" numberOfLines={1}>
                {a.title}
              </Txt>
              <Txt v="small" color={C.textDim} numberOfLines={1}>
                {a.sub}
              </Txt>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Txt v="small" color={C.muted}>
                {timeAgo(a.ts)}
              </Txt>
              {a.ts > seenAt ? <View style={styles.dot} /> : null}
            </View>
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, paddingBottom: 54 },
  hi: { color: '#1F3B4A', fontFamily: F.slab, fontSize: 24, letterSpacing: -0.4 },
  sub: { color: '#3D6A7E', fontFamily: F.semi, fontSize: 14 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18, backgroundColor: C.glass, borderWidth: 1, borderColor: C.border },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.orange },
});
