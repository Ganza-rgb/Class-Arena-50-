import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ImagePlus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  Trash,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View, type ViewInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useNames } from '../engines/hooks';
import {
  CHART_COUNTRIES,
  GIF_SUBS,
  GIPHY_KEY,
  MEME_SUBS,
  chartTracks,
  errorText,
  fetchMemes,
  giphy,
  memeTemplates,
  searchTracks,
  type Gif,
  type Meme,
  type Template,
  type Track,
} from '../lib/media';
import { playSound, tap } from '../lib/sound';
import { usePersisted } from '../lib/store';
import { timeAgo, uid } from '../lib/utils';
import { C, F, R } from '../theme';
import { Art, Btn, Card, Chip, Col, Empty, Field, IconBtn, Row, Section, Segmented, Sheet, Tag, Txt, shareText } from '../ui';
import type { ModuleProps } from './types';

// ================================================================ shared helpers

/** Runs async loads, ignoring stale responses. Starts loading `first` on mount. */
function useLoader<T>(first: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const req = useRef(0);
  const firstRef = useRef(first);

  const settle = useCallback((id: number, p: Promise<T>) => {
    p.then((d) => {
      if (id !== req.current) return;
      setData(d);
      setLoading(false);
    }).catch((e: unknown) => {
      if (id !== req.current) return;
      setError(errorText(e));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    req.current += 1;
    settle(req.current, firstRef.current());
  }, [settle]);

  const run = useCallback(
    (fn: () => Promise<T>) => {
      req.current += 1;
      setLoading(true);
      setError(null);
      settle(req.current, fn());
    },
    [settle],
  );
  return { data, setData, error, loading, run };
}

function Loading({ color }: { color: string }) {
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <ActivityIndicator color={color} size="large" />
    </View>
  );
}

function ErrorCard({ text, onRetry, color }: { text: string; onRetry: () => void; color: string }) {
  return (
    <Card style={{ alignItems: 'center', gap: 10 }}>
      <Txt v="body" color={C.textDim} center>
        {text}
      </Txt>
      <Btn small title="Retry" icon={RefreshCw} color={color} onPress={onRetry} />
    </Card>
  );
}

const openLink = (url: string) => {
  if (url) Linking.openURL(url).catch(() => undefined);
};

// ================================================================ 30-second preview player

function usePreview() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [cur, setCur] = useState<string | null>(null);

  const toggle = (t: Track) => {
    if (!t.preview) return;
    tap();
    if (cur === t.id) {
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.25)) {
          player.seekTo(0).catch(() => undefined);
        }
        player.play();
      }
      return;
    }
    player.replace({ uri: t.preview });
    player.play();
    setCur(t.id);
  };
  const progress = cur && status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  return { toggle, cur, playing: status.playing, buffering: status.isBuffering, progress };
}

type Preview = ReturnType<typeof usePreview>;

function TrackRow({
  t,
  pv,
  color,
  saved,
  onSave,
  onDrop,
  rank,
}: {
  t: Track;
  pv: Preview;
  color: string;
  saved: boolean;
  onSave: () => void;
  onDrop?: () => void;
  rank?: number;
}) {
  const active = pv.cur === t.id;
  const playing = active && pv.playing;
  return (
    <View style={{ borderRadius: R.lg, backgroundColor: active ? C.card2 : C.card, borderWidth: 1, borderColor: active ? color : C.border, overflow: 'hidden' }}>
      <Row gap={12} style={{ padding: 10 }}>
        <Pressable onPress={() => pv.toggle(t)} disabled={!t.preview} accessibilityLabel={playing ? 'Pause preview' : 'Play preview'}>
          <Image source={t.art} style={{ width: 58, height: 58, borderRadius: R.md, backgroundColor: C.border }} contentFit="cover" transition={150} />
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.preview ? color : C.slate, alignItems: 'center', justifyContent: 'center' }}>
              {active && pv.buffering ? (
                <ActivityIndicator size="small" color={C.text} />
              ) : playing ? (
                <Pause size={15} color={C.text} fill={C.text} />
              ) : (
                <Play size={15} color={C.text} fill={C.text} style={{ marginLeft: 2 }} />
              )}
            </View>
          </View>
        </Pressable>
        <Col gap={2} style={{ flex: 1 }}>
          <Row gap={6}>
            {rank ? (
              <Txt v="label" color={color}>
                #{rank}
              </Txt>
            ) : null}
            <Txt v="h3" numberOfLines={1} style={{ flex: 1 }}>
              {t.title}
            </Txt>
          </Row>
          <Txt v="small" color={C.textDim} numberOfLines={1}>
            {t.artist}
          </Txt>
          <Txt v="small" color={C.muted} numberOfLines={1}>
            {t.genre}
            {t.explicit ? ' · 🅴' : ''}
            {!t.preview ? ' · no preview' : ''}
          </Txt>
        </Col>
        <Col gap={6}>
          <Row gap={6}>
            {onDrop ? <IconBtn icon={Send} size={32} onPress={onDrop} label="Drop to class" /> : null}
            <IconBtn icon={saved ? BookmarkCheck : Bookmark} size={32} color={saved ? color : C.text} onPress={onSave} label="Save to crate" />
          </Row>
          <Row gap={6}>
            <IconBtn icon={Share2} size={32} onPress={() => shareText(`🎧 ${t.title} — ${t.artist}\n${t.link}`)} label="Share" />
            <IconBtn icon={ExternalLink} size={32} onPress={() => openLink(t.link)} label="Open full song" />
          </Row>
        </Col>
      </Row>
      {active ? <View style={{ height: 3, width: `${pv.progress * 100}%`, backgroundColor: color }} /> : null}
    </View>
  );
}

// ================================================================ Song drop board storage

type Drop = { id: string; track: Track; by: string; note: string; fire: number; trash: number; mine: 'fire' | 'trash' | null; ts: number };

const H = 3600_000;
const SEED_DROPS: Drop[] = [
  {
    id: 'd1',
    by: 'Diane',
    note: 'Library playlist essential. Don’t argue.',
    fire: 24,
    trash: 2,
    mine: null,
    ts: Date.now() - 3 * H,
    track: { id: '1699082734', title: 'Water', artist: 'Tyla', art: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/c9/5b/1ec95bbc-a56f-cbef-070c-ddec9f4fdd3c/196871296205.jpg/300x300bb.jpg', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9a/62/e6/9a62e688-9080-feed-2411-cc793c4545cf/mzaf_4449175929344535361.plus.aac.p.m4a', link: 'https://music.apple.com/us/album/water/1699082722?i=1699082734&uo=4', explicit: false, genre: 'Pop' },
  },
  {
    id: 'd2',
    by: 'Kevin',
    note: 'Pre-match hype song for the eFootball final 🔥',
    fire: 19,
    trash: 1,
    mine: null,
    ts: Date.now() - 7 * H,
    track: { id: '1623677811', title: 'Last Last', artist: 'Burna Boy', art: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ca/eb/31/caeb3173-eaf0-0cd5-65ea-585adfe312ba/075679745156.jpg/300x300bb.jpg', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/42/c0/0f/42c00f8b-fff6-2529-70c3-861c21143c0a/mzaf_2842108628707526245.plus.aac.p.m4a', link: 'https://music.apple.com/us/album/last-last/1623677591?i=1623677811&uo=4', explicit: false, genre: 'Afro-fusion' },
  },
  {
    id: 'd3',
    by: 'Eric',
    note: 'Still a classic. Plays every time someone scores a screamer.',
    fire: 15,
    trash: 4,
    mine: null,
    ts: Date.now() - 20 * H,
    track: { id: '1614063459', title: 'Calm Down', artist: 'Rema', art: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/b2/b4/7c/b2b47cf9-d8e2-53f6-5c62-c974d665c95b/22UMGIM08994.rgb.jpg/300x300bb.jpg', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3c/7e/3b/3c7e3b1d-c005-91cb-51d1-2d86effd9990/mzaf_6788794088599474630.plus.aac.p.m4a', link: 'https://music.apple.com/us/album/calm-down/1614063395?i=1614063459&uo=4', explicit: false, genre: 'Afrobeats' },
  },
  {
    id: 'd4',
    by: 'Sandra',
    note: 'For everyone who survived the CAT.',
    fire: 11,
    trash: 0,
    mine: null,
    ts: Date.now() - 28 * H,
    track: { id: '1688642838', title: 'Lonely At The Top', artist: 'Asake', art: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cc/23/83/cc2383d9-eecc-f974-5f5b-d445c583acdb/197342233958_cover.jpg/300x300bb.jpg', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/af/79/fd/af79fdf3-e757-5acd-c0de-b5c6edfaa77a/mzaf_15402833629808241649.plus.aac.p.m4a', link: 'https://music.apple.com/us/album/lonely-at-the-top/1688641478?i=1688642838&uo=4', explicit: false, genre: 'African' },
  },
];

export function useDrops() {
  return usePersisted<Drop[]>('vibes:drops', SEED_DROPS);
}
function useCrate() {
  return usePersisted<Track[]>('vibes:crate', []);
}

/** Sheet for dropping a track to the class board with a note. */
function DropSheet({ track, onClose, color }: { track: Track | null; onClose: () => void; color: string }) {
  const names = useNames();
  const [, setDrops] = useDrops();
  const [by, setBy] = useState('Anonymous');
  const [note, setNote] = useState('');
  return (
    <Sheet visible={track !== null} onClose={onClose} title="Drop to the class">
      {track ? (
        <Row gap={12}>
          <Image source={track.art} style={{ width: 54, height: 54, borderRadius: R.md }} />
          <Col gap={2} style={{ flex: 1 }}>
            <Txt v="h3" numberOfLines={1}>
              {track.title}
            </Txt>
            <Txt v="small" color={C.textDim}>
              {track.artist}
            </Txt>
          </Col>
        </Row>
      ) : null}
      <Section title="Dropped by">
        <Row wrap gap={6}>
          {['Anonymous', ...names].map((n) => (
            <Chip key={n} small label={n} active={by === n} color={color} onPress={() => setBy(n)} />
          ))}
        </Row>
      </Section>
      <Field label="Why this song?" value={note} onChangeText={setNote} placeholder="Play this before the exam…" maxLength={120} />
      <Btn
        title="Drop it" art="songs"
        color={color}
        onPress={() => {
          if (!track) return;
          setDrops((d) => [{ id: uid(), track, by, note: note.trim(), fire: 0, trash: 0, mine: null, ts: Date.now() }, ...d]);
          setNote('');
          onClose();
          playSound('airhorn');
        }}
      />
    </Sheet>
  );
}

// ================================================================ Song / Beat explorer engine

type Preset = { label: string; q: string };

function TrackBrowser({ color, presets, charts: wantCharts, storageKey }: { color: string; presets: Preset[]; charts: boolean; storageKey: string }) {
  // Apple's chart feed blocks browser (CORS) requests; phones are unaffected.
  const charts = wantCharts && Platform.OS !== 'web';
  const pv = usePreview();
  const [crate, setCrate] = useCrate();
  const [clean, setClean] = usePersisted('vibes:clean', true);
  const [mode, setMode] = useState<'browse' | 'crate'>('browse');
  const [country, setCountry] = usePersisted(`${storageKey}:country`, 'ng');
  const [preset, setPreset] = useState<string>(charts ? 'chart' : (presets[0]?.q ?? ''));
  const [query, setQuery] = useState('');
  const [dropping, setDropping] = useState<Track | null>(null);
  const firstQ = presets[0]?.q ?? 'afrobeats';
  const list = useLoader<Track[]>(() => (charts ? chartTracks(country, clean) : searchTracks(firstQ, { clean })));

  const loadChart = (c: string, cl = clean) => {
    setPreset('chart');
    setCountry(c);
    list.run(() => chartTracks(c, cl));
  };
  const loadSearch = (q: string, cl = clean) => {
    if (!q.trim()) return;
    setPreset(q);
    list.run(() => searchTracks(q, { clean: cl }));
  };
  const reload = (cl = clean) => (preset === 'chart' ? loadChart(country, cl) : loadSearch(preset || firstQ, cl));
  const saved = (t: Track) => crate.some((x) => x.id === t.id);
  const toggleSave = (t: Track) => setCrate((c) => (c.some((x) => x.id === t.id) ? c.filter((x) => x.id !== t.id) : [t, ...c]));

  const tracks = mode === 'crate' ? crate : (list.data ?? []);
  return (
    <Col>
      <Segmented options={[{ value: 'browse', label: wantCharts ? 'Explore' : 'Beats' }, { value: 'crate', label: `My crate (${crate.length})` }]} value={mode} onChange={setMode} color={color} />
      {mode === 'browse' ? (
        <>
          <Row>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.pill, paddingHorizontal: 14, height: 44 }}>
              <Search size={17} color={C.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => loadSearch(query)}
                returnKeyType="search"
                placeholder={charts ? 'Search any song or artist' : 'Search beats, e.g. “amapiano log drum”'}
                placeholderTextColor={C.muted}
                style={{ flex: 1, color: C.text, fontFamily: F.regular, fontSize: 15, height: '100%' }}
              />
            </View>
            <IconBtn icon={Search} bg={color} size={44} onPress={() => loadSearch(query)} label="Search" />
          </Row>
          {charts ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CHART_COUNTRIES.map((c) => (
                <Chip key={c.code} small label={`Top · ${c.label}`} active={preset === 'chart' && country === c.code} color={color} onPress={() => loadChart(c.code)} />
              ))}
            </ScrollView>
          ) : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {presets.map((p) => (
              <Chip key={p.q} small label={p.label} active={preset === p.q} color={color} onPress={() => loadSearch(p.q)} />
            ))}
          </ScrollView>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="small" color={C.muted}>
              30-second previews · tap the cover to play
            </Txt>
            <Chip
              small
              label={clean ? '✓ Clean only' : 'Explicit allowed'}
              active={clean}
              color={color}
              onPress={() => {
                setClean(!clean);
                reload(!clean);
              }}
            />
          </Row>
          {list.loading ? <Loading color={color} /> : null}
          {list.error && !list.loading ? <ErrorCard text={list.error} onRetry={() => reload()} color={color} /> : null}
          {!list.loading && !list.error && tracks.length === 0 ? <Empty text="No tracks found. Try another search." /> : null}
        </>
      ) : crate.length === 0 ? (
        <Empty text="Bookmark tracks to build your crate." />
      ) : null}
      {!(mode === 'browse' && (list.loading || list.error))
        ? tracks.map((t, i) => (
            <TrackRow
              key={`${t.id}-${i}`}
              t={t}
              pv={pv}
              color={color}
              saved={saved(t)}
              onSave={() => toggleSave(t)}
              onDrop={() => setDropping(t)}
              rank={mode === 'browse' && preset === 'chart' ? i + 1 : undefined}
            />
          ))
        : null}
      <Txt v="small" color={C.muted} center>
        Previews and charts from Apple Music. Open a track to hear the full song.
      </Txt>
      <DropSheet track={dropping} onClose={() => setDropping(null)} color={color} />
    </Col>
  );
}

const SONG_PRESETS: Preset[] = [
  { label: 'Afrobeats', q: 'afrobeats' },
  { label: 'Amapiano', q: 'amapiano' },
  { label: 'Bongo Flava', q: 'bongo flava' },
  { label: 'Afro House', q: 'afro house' },
  { label: 'Hip-Hop', q: 'hip hop' },
  { label: 'R&B', q: 'r&b' },
  { label: 'Gospel', q: 'african gospel' },
  { label: 'Dancehall', q: 'dancehall' },
  { label: 'Football anthems', q: 'football anthem' },
];

const BEAT_PRESETS: Preset[] = [
  { label: 'Afrobeat instrumentals', q: 'afrobeat instrumental' },
  { label: 'Amapiano', q: 'amapiano instrumental' },
  { label: 'Drill', q: 'drill type beat' },
  { label: 'Trap', q: 'trap beat instrumental' },
  { label: 'Lo-fi study', q: 'lofi beats' },
  { label: 'Boom bap', q: 'boom bap instrumental' },
  { label: 'R&B', q: 'r&b instrumental' },
  { label: 'Gym / hype', q: 'workout hype instrumental' },
];

export function SongExplorer({ color }: ModuleProps) {
  return <TrackBrowser color={color} presets={SONG_PRESETS} charts storageKey="vibes:songs" />;
}

export function BeatExplorer({ color }: ModuleProps) {
  return <TrackBrowser color={color} presets={BEAT_PRESETS} charts={false} storageKey="vibes:beats" />;
}

// ================================================================ Song Drop board

export function SongDrop({ color }: ModuleProps) {
  const pv = usePreview();
  const [drops, setDrops] = useDrops();
  const [crate, setCrate] = useCrate();
  const [finding, setFinding] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dropping, setDropping] = useState<Track | null>(null);

  const sorted = drops.slice().sort((a, b) => b.fire - b.trash - (a.fire - a.trash) || b.ts - a.ts);
  const sotd = sorted[0];

  const vote = (id: string, v: 'fire' | 'trash') => {
    setDrops((p) =>
      p.map((d) => {
        if (d.id !== id) return d;
        const n = { ...d };
        if (d.mine) n[d.mine] -= 1;
        if (d.mine === v) {
          n.mine = null;
          return n;
        }
        n.mine = v;
        n[v] += 1;
        return n;
      }),
    );
    tap();
  };
  const find = () => {
    if (!q.trim()) return;
    setSearching(true);
    setErr(null);
    searchTracks(q, { clean: true, limit: 15 })
      .then((r) => setResults(r))
      .catch((e: unknown) => setErr(errorText(e)))
      .finally(() => setSearching(false));
  };

  return (
    <Col>
      {sotd ? (
        <View style={{ borderRadius: R.xl, overflow: 'hidden', backgroundColor: color }}>
          <Row gap={14} style={{ padding: 16 }}>
            <Pressable onPress={() => pv.toggle(sotd.track)}>
              <Image source={sotd.track.art} style={{ width: 92, height: 92, borderRadius: R.lg }} />
              <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
                  {pv.cur === sotd.track.id && pv.playing ? <Pause size={18} color={C.text} fill={C.text} /> : <Play size={18} color={C.text} fill={C.text} style={{ marginLeft: 2 }} />}
                </View>
              </View>
            </Pressable>
            <Col gap={3} style={{ flex: 1 }}>
              <Row gap={6}>
                <Art name="ranking" size={18} />
                <Txt v="label">Song of the day</Txt>
              </Row>
              <Txt v="h1" numberOfLines={2}>
                {sotd.track.title}
              </Txt>
              <Txt v="body">{sotd.track.artist}</Txt>
              <Row gap={4}>
                <Art name="fire" size={16} />
                <Txt v="small">
                  {sotd.fire} · dropped by {sotd.by}
                </Txt>
              </Row>
            </Col>
          </Row>
        </View>
      ) : null}
      <Btn title="Drop a song" icon={Plus} color={color} onPress={() => setFinding(true)} />
      {sorted.length === 0 ? <Empty text="No drops yet. Be the class DJ." /> : null}
      {sorted.map((d) => {
        const active = pv.cur === d.track.id;
        return (
          <Card key={d.id} pad={12} style={{ gap: 10, borderColor: active ? color : C.border }}>
            <Row gap={12}>
              <Pressable onPress={() => pv.toggle(d.track)} disabled={!d.track.preview}>
                <Image source={d.track.art} style={{ width: 54, height: 54, borderRadius: R.md, backgroundColor: C.border }} />
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                    {active && pv.playing ? <Pause size={13} color={C.text} fill={C.text} /> : <Play size={13} color={C.text} fill={C.text} style={{ marginLeft: 1 }} />}
                  </View>
                </View>
              </Pressable>
              <Col gap={2} style={{ flex: 1 }}>
                <Txt v="h3" numberOfLines={1}>
                  {d.track.title}
                </Txt>
                <Txt v="small" color={C.textDim} numberOfLines={1}>
                  {d.track.artist}
                </Txt>
                <Txt v="small" color={C.muted}>
                  {d.by} · {timeAgo(d.ts)}
                </Txt>
              </Col>
              <IconBtn icon={ExternalLink} size={32} onPress={() => openLink(d.track.link)} label="Open full song" />
            </Row>
            {d.note ? (
              <Txt v="body" color={C.textDim}>
                “{d.note}”
              </Txt>
            ) : null}
            {active ? <View style={{ height: 3, borderRadius: 2, width: `${pv.progress * 100}%`, backgroundColor: color }} /> : null}
            <Row>
              <Btn small art="fire" title={`${d.fire}`} color={C.coral} variant={d.mine === 'fire' ? 'solid' : 'outline'} onPress={() => vote(d.id, 'fire')} />
              <Btn small art="trash" title={`${d.trash}`} color={C.slate} variant={d.mine === 'trash' ? 'solid' : 'outline'} onPress={() => vote(d.id, 'trash')} />
              <View style={{ flex: 1 }} />
              <IconBtn
                icon={crate.some((x) => x.id === d.track.id) ? BookmarkCheck : Bookmark}
                size={32}
                onPress={() => setCrate((c) => (c.some((x) => x.id === d.track.id) ? c.filter((x) => x.id !== d.track.id) : [d.track, ...c]))}
                label="Save to crate"
              />
              <IconBtn icon={Share2} size={32} onPress={() => shareText(`🎧 ${d.by} dropped: ${d.track.title} — ${d.track.artist}\n${d.track.link}`)} label="Share" />
              <IconBtn icon={Trash} size={32} color={C.muted} onPress={() => setDrops((p) => p.filter((x) => x.id !== d.id))} label="Remove drop" />
            </Row>
          </Card>
        );
      })}
      <Sheet visible={finding} onClose={() => setFinding(false)} title="Find a song">
        <Row>
          <View style={{ flex: 1 }}>
            <Field value={q} onChangeText={setQ} placeholder="Song or artist" onSubmitEditing={find} returnKeyType="search" />
          </View>
          <IconBtn icon={Search} bg={color} size={46} onPress={find} label="Search" />
        </Row>
        {searching ? <Loading color={color} /> : null}
        {err ? <ErrorCard text={err} onRetry={find} color={color} /> : null}
        {crate.length && !results.length && !searching ? (
          <Txt v="label" color={C.muted}>
            From your crate
          </Txt>
        ) : null}
        {(results.length ? results : crate).map((t) => (
          <Pressable
            key={t.id}
            onPress={() => {
              setFinding(false);
              setDropping(t);
            }}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: R.md, backgroundColor: pressed ? C.card2 : C.card })}
          >
            <Image source={t.art} style={{ width: 44, height: 44, borderRadius: R.sm }} />
            <Col gap={1} style={{ flex: 1 }}>
              <Txt v="h3" numberOfLines={1}>
                {t.title}
              </Txt>
              <Txt v="small" color={C.textDim} numberOfLines={1}>
                {t.artist}
              </Txt>
            </Col>
            <Send size={18} color={color} />
          </Pressable>
        ))}
      </Sheet>
      <DropSheet track={dropping} onClose={() => setDropping(null)} color={color} />
    </Col>
  );
}

// ================================================================ Meme & GIF feeds

function FeedImage({ uri, onRatio, ratio }: { uri: string; ratio: number; onRatio: (r: number) => void }) {
  return (
    <Image
      source={uri}
      style={{ width: '100%', aspectRatio: ratio, backgroundColor: C.card2 }}
      contentFit="contain"
      transition={200}
      onLoad={(e) => {
        const { width, height } = e.source;
        if (width && height) onRatio(Math.max(0.55, Math.min(1.9, width / height)));
      }}
    />
  );
}

function MemeCard({ m, saved, onSave, color }: { m: Meme; saved: boolean; onSave: () => void; color: string }) {
  const [ratio, setRatio] = useState(1);
  return (
    <View style={{ borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
      <FeedImage uri={m.url} ratio={ratio} onRatio={setRatio} />
      <View style={{ padding: 12, gap: 8 }}>
        <Txt v="h3">{m.title}</Txt>
        <Row>
          <Tag label={`r/${m.sub}`} color={C.card2} />
          <Txt v="small" color={C.muted}>
            ▲ {m.ups.toLocaleString()}
          </Txt>
          <View style={{ flex: 1 }} />
          <IconBtn icon={saved ? BookmarkCheck : Bookmark} size={32} color={saved ? color : C.text} onPress={onSave} label="Save" />
          <IconBtn icon={Share2} size={32} onPress={() => shareText(`😂 ${m.title}\n${m.url}`)} label="Share" />
          <IconBtn icon={ExternalLink} size={32} onPress={() => openLink(m.link)} label="Open post" />
        </Row>
      </View>
    </View>
  );
}

export function MemeExplorer({ color }: ModuleProps) {
  const [sub, setSub] = useState(MEME_SUBS[0] ?? 'memes');
  const [mode, setMode] = useState<'feed' | 'saved'>('feed');
  const [saved, setSaved] = usePersisted<Meme[]>('vibes:memes-saved', []);
  const [more, setMore] = useState(false);
  const feed = useLoader<Meme[]>(() => fetchMemes(MEME_SUBS[0] ?? 'memes'));

  const pickSub = (s: string) => {
    setSub(s);
    feed.run(() => fetchMemes(s));
  };
  const loadMore = () => {
    setMore(true);
    fetchMemes(sub)
      .then((n) => feed.setData((cur) => {
        const seen = new Set((cur ?? []).map((m) => m.id));
        return [...(cur ?? []), ...n.filter((m) => !seen.has(m.id))];
      }))
      .catch(() => undefined)
      .finally(() => setMore(false));
  };
  const isSaved = (m: Meme) => saved.some((x) => x.id === m.id);
  const toggle = (m: Meme) => setSaved((s) => (s.some((x) => x.id === m.id) ? s.filter((x) => x.id !== m.id) : [m, ...s]));
  const items = mode === 'saved' ? saved : (feed.data ?? []);

  return (
    <Col>
      <Segmented options={[{ value: 'feed', label: 'Explore' }, { value: 'saved', label: `Saved (${saved.length})` }]} value={mode} onChange={setMode} color={color} />
      {mode === 'feed' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {MEME_SUBS.map((s) => (
              <Chip key={s} small label={`r/${s}`} active={sub === s} color={color} onPress={() => pickSub(s)} />
            ))}
          </ScrollView>
          {feed.loading ? <Loading color={color} /> : null}
          {feed.error && !feed.loading ? <ErrorCard text={feed.error} onRetry={() => pickSub(sub)} color={color} /> : null}
        </>
      ) : saved.length === 0 ? (
        <Empty text="Bookmark memes to keep them here." />
      ) : null}
      {!(mode === 'feed' && (feed.loading || feed.error)) ? items.map((m) => <MemeCard key={m.id} m={m} saved={isSaved(m)} onSave={() => toggle(m)} color={color} />) : null}
      {mode === 'feed' && !feed.loading && !feed.error ? (
        <Btn title={more ? 'Loading…' : 'Load more memes'} icon={RefreshCw} color={color} variant="outline" onPress={loadMore} disabled={more} />
      ) : null}
      <Txt v="small" color={C.muted} center>
        Pulled live from Reddit. NSFW and spoiler posts are filtered out.
      </Txt>
    </Col>
  );
}

// ---------------------------------------------------------------- GIF finder

type GifItem = { id: string; url: string; preview: string; title: string; ratio: number; link: string };

function GifTile({ g, saved, onSave }: { g: GifItem; saved: boolean; onSave: () => void }) {
  const [ratio, setRatio] = useState(g.ratio);
  return (
    <Pressable onPress={() => shareText(g.url)} onLongPress={onSave} style={{ borderRadius: R.md, overflow: 'hidden', backgroundColor: C.card2 }}>
      <FeedImage uri={g.preview} ratio={ratio} onRatio={setRatio} />
      {saved ? (
        <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: C.ink, borderRadius: 12, padding: 4 }}>
          <BookmarkCheck size={14} color={C.amber} />
        </View>
      ) : null}
    </Pressable>
  );
}

const fromGiphy = (g: Gif): GifItem => ({ id: g.id, url: g.url, preview: g.preview, title: g.title, ratio: g.ratio, link: g.link });
const fromMeme = (m: Meme): GifItem => ({ id: m.id, url: m.url, preview: m.url, title: m.title, ratio: 1, link: m.link });

export function GifFinder({ color }: ModuleProps) {
  const hasKey = GIPHY_KEY.length > 0;
  const [q, setQ] = useState('');
  const [src, setSrc] = useState(hasKey ? 'trending' : (GIF_SUBS[0] ?? 'reactiongifs'));
  const [mode, setMode] = useState<'find' | 'saved'>('find');
  const [saved, setSaved] = usePersisted<GifItem[]>('vibes:gifs-saved', []);
  const feed = useLoader<GifItem[]>(() => (hasKey ? giphy('').then((r) => r.map(fromGiphy)) : fetchMemes(GIF_SUBS[0] ?? 'reactiongifs', 30).then((r) => r.filter((m) => m.isGif).map(fromMeme))));

  const loadSub = (s: string) => {
    setSrc(s);
    feed.run(() => fetchMemes(s, 30).then((r) => r.filter((m) => m.isGif).map(fromMeme)));
  };
  const search = (term: string) => {
    setSrc(term || 'trending');
    feed.run(() => giphy(term).then((r) => r.map(fromGiphy)));
  };
  const toggle = (g: GifItem) => {
    setSaved((s) => (s.some((x) => x.id === g.id) ? s.filter((x) => x.id !== g.id) : [g, ...s]));
    tap('success');
  };
  const items = mode === 'saved' ? saved : (feed.data ?? []);
  const left: GifItem[] = [];
  const right: GifItem[] = [];
  let lh = 0;
  let rh = 0;
  for (const g of items) {
    if (lh <= rh) {
      left.push(g);
      lh += 1 / g.ratio;
    } else {
      right.push(g);
      rh += 1 / g.ratio;
    }
  }
  const col = (arr: GifItem[]) => (
    <View style={{ flex: 1, gap: 8 }}>
      {arr.map((g) => (
        <GifTile key={g.id} g={g} saved={saved.some((x) => x.id === g.id)} onSave={() => toggle(g)} />
      ))}
    </View>
  );

  return (
    <Col>
      <Segmented options={[{ value: 'find', label: 'Find GIFs' }, { value: 'saved', label: `Saved (${saved.length})` }]} value={mode} onChange={setMode} color={color} />
      {mode === 'find' ? (
        <>
          {hasKey ? (
            <>
              <Row>
                <View style={{ flex: 1 }}>
                  <Field value={q} onChangeText={setQ} placeholder="Search GIFs: “goal celebration”, “no way”…" onSubmitEditing={() => search(q)} returnKeyType="search" />
                </View>
                <IconBtn icon={Search} bg={color} size={46} onPress={() => search(q)} label="Search" />
              </Row>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {['trending', 'goal', 'shocked', 'exam', 'crying laughing', 'celebration', 'facepalm', 'side eye'].map((t) => (
                  <Chip key={t} small label={t} active={src === t} color={color} onPress={() => { setQ(t === 'trending' ? '' : t); search(t === 'trending' ? '' : t); }} />
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {GIF_SUBS.map((s) => (
                  <Chip key={s} small label={`r/${s}`} active={src === s} color={color} onPress={() => loadSub(s)} />
                ))}
              </ScrollView>
              <Txt v="small" color={C.muted}>
                Browsing reaction-GIF feeds. Add a free GIPHY key to unlock search (see README).
              </Txt>
            </>
          )}
          <Txt v="small" color={C.muted}>
            Tap a GIF to share it · long-press to save.
          </Txt>
          {feed.loading ? <Loading color={color} /> : null}
          {feed.error && !feed.loading ? <ErrorCard text={feed.error} onRetry={() => (hasKey ? search(q) : loadSub(src))} color={color} /> : null}
        </>
      ) : saved.length === 0 ? (
        <Empty text="Long-press any GIF to save it here." />
      ) : null}
      {!(mode === 'find' && (feed.loading || feed.error)) ? (
        <Row gap={8} style={{ alignItems: 'flex-start' }}>
          {col(left)}
          {col(right)}
        </Row>
      ) : null}
      {mode === 'find' && !hasKey && !feed.loading ? <Btn title="Load fresh GIFs" icon={RefreshCw} variant="outline" color={color} onPress={() => loadSub(src)} /> : null}
      {hasKey ? (
        <Txt v="small" color={C.muted} center>
          Powered by GIPHY
        </Txt>
      ) : null}
    </Col>
  );
}

// ================================================================ Meme Maker

type Canvas = { uri: string; ratio: number; name: string };
type SavedMeme = { id: string; canvas: Canvas; top: string; bottom: string; ts: number };

function MemeText({ text, size, pos }: { text: string; size: number; pos: 'top' | 'bottom' }) {
  if (!text) return null;
  return (
    <Text
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        [pos]: 8,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: F.display,
        fontSize: size,
        lineHeight: size * 1.08,
        textTransform: 'uppercase',
        textShadowColor: '#000000',
        textShadowRadius: 4,
        textShadowOffset: { width: 0, height: 0 },
      }}
    >
      {text}
    </Text>
  );
}

export function MemeMaker({ color }: ModuleProps) {
  const templates = useLoader<Template[]>(memeTemplates);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [top, setTop] = useState('');
  const [bottom, setBottom] = useState('');
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = usePersisted<SavedMeme[]>('vibes:meme-maker', []);
  const shotRef = useRef<ViewInstance>(null);
  const fontSize = size === 'S' ? 22 : size === 'M' ? 30 : 40;

  const list = (templates.data ?? []).filter((t) => !filter.trim() || t.name.toLowerCase().includes(filter.trim().toLowerCase())).slice(0, 60);
  const current = canvas ?? (templates.data?.[0] ? { uri: templates.data[0].url, ratio: templates.data[0].width / templates.data[0].height, name: templates.data[0].name } : null);

  const pickPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      const a = res.canceled ? null : res.assets[0];
      if (a) setCanvas({ uri: a.uri, ratio: a.width && a.height ? a.width / a.height : 1, name: 'Your photo' });
    } catch {
      /* permission denied or cancelled */
    }
  };

  const share = async () => {
    if (!current) return;
    setBusy(true);
    setRecent((r) => [{ id: uid(), canvas: current, top, bottom, ts: Date.now() }, ...r].slice(0, 12));
    try {
      const uri = await captureRef(shotRef, { format: 'jpg', quality: 0.92, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Share meme' });
      else shareText(`${top}\n${bottom}`);
      playSound('rimshot');
    } catch {
      shareText(`${top} / ${bottom}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Col>
      {current ? (
        <View ref={shotRef} collapsable={false} style={{ width: '100%', aspectRatio: Math.max(0.6, Math.min(1.8, current.ratio)), backgroundColor: C.ink, borderRadius: R.md, overflow: 'hidden' }}>
          <Image source={current.uri} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          <MemeText text={top} size={fontSize} pos="top" />
          <MemeText text={bottom} size={fontSize} pos="bottom" />
        </View>
      ) : templates.loading ? (
        <Loading color={color} />
      ) : (
        <Empty text="Pick a template or use your own photo." />
      )}
      {templates.error ? <ErrorCard text={templates.error} onRetry={() => templates.run(memeTemplates)} color={color} /> : null}
      <Field label="Top text" value={top} onChangeText={setTop} placeholder="When the lecturer says" maxLength={80} />
      <Field label="Bottom text" value={bottom} onChangeText={setBottom} placeholder="“This won’t be in the exam”" maxLength={80} />
      <Segmented options={[{ value: 'S', label: 'Small text' }, { value: 'M', label: 'Medium' }, { value: 'L', label: 'Large' }]} value={size} onChange={setSize} color={color} />
      <Row>
        <Btn flex title={busy ? 'Preparing…' : 'Share meme'} icon={Share2} color={color} onPress={share} disabled={!current || busy} />
        <Btn flex variant="outline" title="Use my photo" icon={ImagePlus} color={color} onPress={pickPhoto} />
      </Row>
      <Section title={`Templates${templates.data ? ` (${templates.data.length})` : ''}`}>
        <Field value={filter} onChangeText={setFilter} placeholder="Search templates: drake, buttons, distracted…" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {list.map((t) => {
            const on = current?.uri === t.url;
            return (
              <Pressable key={t.id} onPress={() => setCanvas({ uri: t.url, ratio: t.width / t.height, name: t.name })} style={{ width: 92, gap: 4 }}>
                <Image source={t.url} style={{ width: 92, height: 92, borderRadius: R.md, borderWidth: 2, borderColor: on ? color : 'transparent', backgroundColor: C.card2 }} contentFit="cover" />
                <Txt v="small" color={on ? C.text : C.muted} numberOfLines={1}>
                  {t.name}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </Section>
      {recent.length ? (
        <Section title="Recent memes" right={<Btn small variant="ghost" title="Clear" color={C.muted} onPress={() => setRecent([])} />}>
          {recent.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => {
                setCanvas(m.canvas);
                setTop(m.top);
                setBottom(m.bottom);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Image source={m.canvas.uri} style={{ width: 44, height: 44, borderRadius: R.sm }} contentFit="cover" />
              <Col gap={0} style={{ flex: 1 }}>
                <Txt v="h3" numberOfLines={1}>
                  {m.top || m.bottom || m.canvas.name}
                </Txt>
                <Txt v="small" color={C.muted} numberOfLines={1}>
                  {m.canvas.name} · {timeAgo(m.ts)}
                </Txt>
              </Col>
            </Pressable>
          ))}
        </Section>
      ) : null}
      <Txt v="small" color={C.muted} center>
        Templates from Imgflip. Keep it funny, not cruel.
      </Txt>
    </Col>
  );
}
