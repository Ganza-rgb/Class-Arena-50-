import { Plus, RotateCcw, Share2, Shuffle, Trash, Trophy, Undo2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { CLUBS, FORMATIONS, HANDICAPS, PES_EXCUSES } from '../data/content';
import {
  SEED_LEAGUE_MATCHES,
  SEED_LEAGUE_PLAYERS,
  SEED_RIVALRIES,
  SEED_SHAME,
  type LeagueMatch,
  type Rivalry,
  type Shame,
} from '../data/seed';
import { useNames, useRoster } from '../engines/hooks';
import { Wheel } from '../engines/Wheel';
import { usePersisted } from '../lib/store';
import { playSound, tap } from '../lib/sound';
import { chance, firstName, randInt, shuffle, timeAgo, uid } from '../lib/utils';
import { C, F, R } from '../theme';
import { Art, Bar, Btn, Card, Chip, Col, Divider, Empty, Field, IconBtn, Row, Section, Segmented, Sheet, Stat, Stepper, Tag, Txt, shareText } from '../ui';
import type { ModuleProps } from './types';

function useEfootballNames(): string[] {
  const [roster] = useRoster();
  const ef = roster.filter((c) => c.efootball).map((c) => firstName(c.name));
  return ef.length >= 2 ? ef : roster.map((c) => firstName(c.name));
}

// ---------------------------------------------------------------- Knockout Bracket
type BState = { players: string[]; sc: Record<string, [string, string]>; pens: Record<string, 0 | 1> };
const ROUNDS: { title: string; ids: string[] }[] = [
  { title: 'Quarterfinals', ids: ['qf0', 'qf1', 'qf2', 'qf3'] },
  { title: 'Semifinals', ids: ['sf0', 'sf1'] },
  { title: 'Final', ids: ['f'] },
];
const FEEDS: Record<string, [string, string]> = { sf0: ['qf0', 'qf1'], sf1: ['qf2', 'qf3'], f: ['sf0', 'sf1'] };

function sides(id: string, st: BState): [string | null, string | null] {
  if (id.startsWith('qf')) {
    const k = Number(id.slice(2));
    return [st.players[k * 2] ?? null, st.players[k * 2 + 1] ?? null];
  }
  const f = FEEDS[id];
  return f ? [winnerOf(f[0], st), winnerOf(f[1], st)] : [null, null];
}
function winnerOf(id: string, st: BState): string | null {
  const [a, b] = sides(id, st);
  const s = st.sc[id];
  if (!a || !b || !s) return null;
  const x = parseInt(s[0], 10);
  const y = parseInt(s[1], 10);
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  if (x > y) return a;
  if (y > x) return b;
  const p = st.pens[id];
  return p === undefined ? null : p === 0 ? a : b;
}

export function KnockoutBracket({ color }: ModuleProps) {
  const pool = useEfootballNames();
  const [st, setSt] = usePersisted<BState>('ef:bracket', () => ({ players: SEED_LEAGUE_PLAYERS.slice(0, 8), sc: {}, pens: {} }));
  const [titles, setTitles] = usePersisted<Record<string, number>>('ef:bracket-titles', {});
  const [setup, setSetup] = useState(false);
  const [pickList, setPickList] = useState<string[]>([]);
  const champ = winnerOf('f', st);

  const update = (next: BState) => {
    const before = winnerOf('f', st);
    const after = winnerOf('f', next);
    setSt(next);
    if (after && after !== before) {
      playSound('goal');
      setTitles((t) => ({ ...t, [after]: (t[after] ?? 0) + 1 }));
    }
  };
  const setScore = (id: string, side: 0 | 1, v: string) => {
    const cur = st.sc[id] ?? ['', ''];
    const nv: [string, string] = side === 0 ? [v.replace(/\D/g, ''), cur[1]] : [cur[0], v.replace(/\D/g, '')];
    const pens = { ...st.pens };
    delete pens[id];
    update({ ...st, sc: { ...st.sc, [id]: nv }, pens });
  };

  return (
    <Col>
      <Row>
        <Btn flex small title="Shuffle draw" icon={Shuffle} color={color} onPress={() => update({ players: shuffle(st.players), sc: {}, pens: {} })} />
        <Btn flex small variant="outline" title="Pick 8 players" color={color} onPress={() => { setPickList(st.players); setSetup(true); }} />
      </Row>
      {champ ? (
        <Card color={C.amber} style={{ alignItems: 'center', gap: 4 }}>
          <Trophy size={36} color={C.text} />
          <Txt v="label">Class Champion</Txt>
          <Txt v="display">{champ}</Txt>
        </Card>
      ) : null}
      {ROUNDS.map((r) => (
        <Section key={r.title} title={r.title}>
          {r.ids.map((id) => {
            const [a, b] = sides(id, st);
            const s = st.sc[id] ?? ['', ''];
            const w = winnerOf(id, st);
            const drawn = s[0] !== '' && s[0] === s[1];
            return (
              <Card key={id} pad={10} style={{ gap: 6 }}>
                {([a, b] as const).map((p, k) => (
                  <Row key={k} style={{ justifyContent: 'space-between' }}>
                    <Txt v="h3" color={!p ? C.muted : w === p ? color : C.text} style={{ flex: 1 }}>
                      {w === p && p ? '▶ ' : ''}
                      {p ?? 'TBD'}
                    </Txt>
                    <TextInput
                      editable={!!a && !!b}
                      value={s[k]}
                      onChangeText={(t) => setScore(id, k as 0 | 1, t)}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="-"
                      placeholderTextColor={C.muted}
                      style={{ width: 44, height: 36, textAlign: 'center', color: C.text, fontFamily: F.display, fontSize: 18, backgroundColor: C.card2, borderRadius: R.sm, borderWidth: 1, borderColor: C.border }}
                    />
                  </Row>
                ))}
                {drawn && a && b ? (
                  <Row>
                    <Txt v="small" color={C.muted}>
                      Penalties:
                    </Txt>
                    <Chip small label={a} active={st.pens[id] === 0} color={color} onPress={() => update({ ...st, pens: { ...st.pens, [id]: 0 } })} />
                    <Chip small label={b} active={st.pens[id] === 1} color={color} onPress={() => update({ ...st, pens: { ...st.pens, [id]: 1 } })} />
                  </Row>
                ) : null}
              </Card>
            );
          })}
        </Section>
      ))}
      {Object.keys(titles).length ? (
        <Section title="Trophy cabinet">
          <Row wrap gap={6}>
            {Object.entries(titles)
              .sort((x, y) => y[1] - x[1])
              .map(([n, c]) => (
                <Tag key={n} art="bracket" label={`${n} ×${c}`} color={C.card2} />
              ))}
          </Row>
        </Section>
      ) : null}
      <Sheet visible={setup} onClose={() => setSetup(false)} title={`Pick 8 players (${pickList.length}/8)`}>
        <Row wrap gap={6}>
          {pool.map((n) => (
            <Chip
              key={n}
              label={n}
              active={pickList.includes(n)}
              color={color}
              onPress={() => setPickList((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < 8 ? [...p, n] : p))}
            />
          ))}
        </Row>
        <Btn
          title="Start tournament"
          color={color}
          disabled={pickList.length !== 8}
          onPress={() => {
            update({ players: shuffle(pickList), sc: {}, pens: {} });
            setSetup(false);
          }}
        />
      </Sheet>
    </Col>
  );
}

// ---------------------------------------------------------------- League Table
type Standing = { name: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number };

export function computeTable(players: string[], matches: LeagueMatch[]): Standing[] {
  const t = new Map<string, Standing>(players.map((n) => [n, { name: n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }]));
  for (const m of matches) {
    const h = t.get(m.home);
    const a = t.get(m.away);
    if (!h || !a) continue;
    h.p++;
    a.p++;
    h.gf += m.hs;
    h.ga += m.as;
    a.gf += m.as;
    a.ga += m.hs;
    if (m.hs > m.as) {
      h.w++;
      h.pts += 3;
      a.l++;
    } else if (m.hs < m.as) {
      a.w++;
      a.pts += 3;
      h.l++;
    } else {
      h.d++;
      a.d++;
      h.pts++;
      a.pts++;
    }
  }
  return [...t.values()].sort((x, y) => y.pts - x.pts || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf || x.name.localeCompare(y.name));
}

export function useLeague() {
  const [players, setPlayers] = usePersisted<string[]>('ef:league-players', SEED_LEAGUE_PLAYERS);
  const [matches, setMatches] = usePersisted<LeagueMatch[]>('ef:league-matches', SEED_LEAGUE_MATCHES);
  return { players, setPlayers, matches, setMatches };
}

export function LeagueTable({ color }: ModuleProps) {
  const { players, setPlayers, matches, setMatches } = useLeague();
  const [home, setHome] = useState<string | null>(null);
  const [away, setAway] = useState<string | null>(null);
  const [hs, setHs] = useState(0);
  const [as, setAs] = useState(0);
  const [newP, setNewP] = useState('');
  const table = computeTable(players, matches);

  const save = () => {
    if (!home || !away || home === away) return;
    setMatches((p) => [...p, { id: uid(), home, away, hs, as, ts: Date.now() }]);
    setHome(null);
    setAway(null);
    setHs(0);
    setAs(0);
    playSound('whistle');
  };

  const cols = ['P', 'W', 'D', 'L', 'GD', 'Pts'];
  return (
    <Col>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <Row style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: C.card2 }} gap={0}>
          <Txt v="label" color={C.muted} style={{ width: 24 }}>
            #
          </Txt>
          <Txt v="label" color={C.muted} style={{ flex: 1 }}>
            Player
          </Txt>
          {cols.map((c) => (
            <Txt key={c} v="label" color={C.muted} style={{ width: c === 'Pts' ? 38 : 30, textAlign: 'center' }}>
              {c}
            </Txt>
          ))}
        </Row>
        {table.map((s, i) => (
          <Row key={s.name} gap={0} style={{ paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: i === 0 ? color : i === table.length - 1 && table.length > 2 ? 'rgba(210,100,92,0.18)' : undefined }}>
            {i === 0 ? (
              <Art name="crown" size={20} style={{ width: 24 }} />
            ) : (
              <Txt v="h3" style={{ width: 24 }}>
                {i + 1}
              </Txt>
            )}
            <Txt v="h3" style={{ flex: 1 }} numberOfLines={1}>
              {s.name}
            </Txt>
            {[s.p, s.w, s.d, s.l, s.gf - s.ga].map((v, k) => (
              <Txt key={k} v="small" style={{ width: 30, textAlign: 'center' }}>
                {k === 4 && v > 0 ? `+${v}` : v}
              </Txt>
            ))}
            <Txt v="h3" style={{ width: 38, textAlign: 'center' }}>
              {s.pts}
            </Txt>
          </Row>
        ))}
      </Card>

      <Section title="Add result">
        <Txt v="small" color={C.muted}>
          Home
        </Txt>
        <Row wrap gap={6}>
          {players.map((p) => (
            <Chip key={`h${p}`} small label={p} active={home === p} color={color} onPress={() => setHome(p)} />
          ))}
        </Row>
        <Txt v="small" color={C.muted}>
          Away
        </Txt>
        <Row wrap gap={6}>
          {players.filter((p) => p !== home).map((p) => (
            <Chip key={`a${p}`} small label={p} active={away === p} color={C.coral} onPress={() => setAway(p)} />
          ))}
        </Row>
        <Row style={{ justifyContent: 'space-around' }}>
          <Col gap={4} style={{ alignItems: 'center' }}>
            <Txt v="label" color={C.muted}>
              {home ?? 'Home'}
            </Txt>
            <Stepper value={hs} onChange={setHs} color={color} />
          </Col>
          <Col gap={4} style={{ alignItems: 'center' }}>
            <Txt v="label" color={C.muted}>
              {away ?? 'Away'}
            </Txt>
            <Stepper value={as} onChange={setAs} color={C.coral} />
          </Col>
        </Row>
        <Btn title="Save result" color={color} onPress={save} disabled={!home || !away || home === away} />
      </Section>

      <Section title="Players">
        <Row>
          <View style={{ flex: 1 }}>
            <Field value={newP} onChangeText={setNewP} placeholder="Add player" maxLength={20} />
          </View>
          <IconBtn
            icon={Plus}
            bg={color}
            onPress={() => {
              const n = newP.trim();
              if (n && !players.includes(n)) setPlayers((p) => [...p, n]);
              setNewP('');
            }}
            label="Add player"
          />
        </Row>
      </Section>

      <Section title={`Results (${matches.length})`}>
        {matches
          .slice()
          .reverse()
          .slice(0, 15)
          .map((m) => (
            <Row key={m.id} style={{ justifyContent: 'space-between' }}>
              <Txt v="body" style={{ flex: 1 }}>
                {m.home} <Txt v="h3">{m.hs} – {m.as}</Txt> {m.away}
              </Txt>
              <Txt v="small" color={C.muted}>
                {timeAgo(m.ts)}
              </Txt>
              <IconBtn icon={Trash} size={30} color={C.muted} onPress={() => setMatches((p) => p.filter((x) => x.id !== m.id))} label="Delete result" />
            </Row>
          ))}
      </Section>
    </Col>
  );
}

// ---------------------------------------------------------------- Hype Poster
export function HypePoster({ color }: ModuleProps) {
  const [f, setF] = usePersisted('ef:poster', { p1: 'Eric', p2: 'Kevin', t1: 'Man City', t2: 'Arsenal', stakes: 'Loser buys lunch for a week', when: 'Friday · 4:00 PM', venue: 'Hostel Block C, Room 12' });
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  return (
    <Col>
      <View style={{ borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
        <Row style={{ backgroundColor: C.text, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'space-between' }}>
          <Txt v="label" color={C.ink}>
            ● LIVE · ARENA 50+ SPORTS
          </Txt>
          <Txt v="label" color={C.ink}>
            eFOOTBALL
          </Txt>
        </Row>
        <Row gap={0} style={{ alignItems: 'stretch' }}>
          <View style={{ flex: 1, backgroundColor: C.cobalt, padding: 16, gap: 4, minHeight: 170, justifyContent: 'flex-end' }}>
            <Txt v="label">{f.t1}</Txt>
            <Txt v="display" numberOfLines={2}>
              {f.p1.toUpperCase()}
            </Txt>
          </View>
          <View style={{ flex: 1, backgroundColor: C.coral, padding: 16, gap: 4, minHeight: 170, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Txt v="label">{f.t2}</Txt>
            <Txt v="display" numberOfLines={2} style={{ textAlign: 'right' }}>
              {f.p2.toUpperCase()}
            </Txt>
          </View>
          <View style={{ position: 'absolute', left: '50%', top: 22, marginLeft: -28, width: 56, height: 56, borderRadius: 28, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.text }}>
            <Txt v="h1">VS</Txt>
          </View>
        </Row>
        <View style={{ backgroundColor: C.card, padding: 14, gap: 6 }}>
          <Txt v="label" color={C.amber}>
            On the line
          </Txt>
          <Txt v="h2">{f.stakes}</Txt>
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="small" color={C.textDim}>
              {f.when}
            </Txt>
            <Txt v="small" color={C.textDim}>
              {f.venue}
            </Txt>
          </Row>
        </View>
      </View>
      <Btn title="Share poster" icon={Share2} color={color} onPress={() => shareText(`🔴 LIVE · ARENA 50+ SPORTS\n${f.p1} (${f.t1}) 🆚 ${f.p2} (${f.t2})\n💰 ${f.stakes}\n🕓 ${f.when}\n📍 ${f.venue}`)} />
      <Txt v="small" color={C.muted}>
        Tip: screenshot the card above for the group chat.
      </Txt>
      <Row>
        <View style={{ flex: 1 }}>
          <Field label="Player 1" value={f.p1} onChangeText={set('p1')} maxLength={16} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Player 2" value={f.p2} onChangeText={set('p2')} maxLength={16} />
        </View>
      </Row>
      <Row>
        <View style={{ flex: 1 }}>
          <Field label="Team 1" value={f.t1} onChangeText={set('t1')} maxLength={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Team 2" value={f.t2} onChangeText={set('t2')} maxLength={20} />
        </View>
      </Row>
      <Field label="Stakes" value={f.stakes} onChangeText={set('stakes')} maxLength={60} />
      <Field label="When" value={f.when} onChangeText={set('when')} maxLength={30} />
      <Field label="Venue" value={f.venue} onChangeText={set('venue')} maxLength={30} />
    </Col>
  );
}

// ---------------------------------------------------------------- Team & Formation Wheel
export function TeamWheel({ color }: ModuleProps) {
  const pool = useEfootballNames();
  const [mode, setMode] = useState<'team' | 'formation'>('team');
  const [player, setPlayer] = useState<string | null>(null);
  const [assign, setAssign] = usePersisted<Record<string, { team?: string; formation?: string }>>('ef:teamwheel', {});
  const [last, setLast] = useState<string | null>(null);

  const onResult = (item: string) => {
    setLast(item);
    if (player) setAssign((p) => ({ ...p, [player]: { ...p[player], [mode]: item } }));
  };

  return (
    <Col>
      <Segmented options={[{ value: 'team', label: 'Team wheel' }, { value: 'formation', label: 'Formation wheel' }]} value={mode} onChange={setMode} color={color} />
      <Section title="Spinning for">
        <Row wrap gap={6}>
          {pool.map((n) => (
            <Chip key={n} small label={n} active={player === n} color={color} onPress={() => setPlayer(n)} />
          ))}
        </Row>
      </Section>
      <Wheel key={mode} items={mode === 'team' ? CLUBS : FORMATIONS} onResult={onResult} color={color} />
      {last ? (
        <Card color={color} style={{ alignItems: 'center' }}>
          <Txt v="label">{player ?? 'Result'}</Txt>
          <Txt v="display">{last}</Txt>
        </Card>
      ) : null}
      <Section title="Assignments" right={<Btn small variant="ghost" title="Clear" color={C.muted} onPress={() => setAssign({})} />}>
        {Object.keys(assign).length === 0 ? <Empty text="Pick a player, then spin both wheels." /> : null}
        {Object.entries(assign).map(([n, a]) => (
          <Row key={n} style={{ justifyContent: 'space-between' }}>
            <Txt v="h3">{n}</Txt>
            <Txt v="body" color={C.textDim}>
              {a.team ?? '—'} · {a.formation ?? '—'}
            </Txt>
          </Row>
        ))}
      </Section>
    </Col>
  );
}

// ---------------------------------------------------------------- Penalty Mind-Game
type Dir = 0 | 1 | 2;
const DIRS = ['Left', 'Center', 'Right'] as const;

export function PenaltyMindGame({ color }: ModuleProps) {
  const [rec, setRec] = usePersisted('ef:pens', { w: 0, l: 0, habits: [1, 1, 1] as number[] });
  const [you, setYou] = useState<boolean[]>([]);
  const [cpu, setCpu] = useState<boolean[]>([]);
  const [last, setLast] = useState<{ ball: Dir; keeper: Dir; scored: boolean; youShot: boolean } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const shooting = you.length === cpu.length;

  const yg = you.filter(Boolean).length;
  const cg = cpu.filter(Boolean).length;

  const decide = (nyou: boolean[], ncpu: boolean[]) => {
    const a = nyou.filter(Boolean).length;
    const b = ncpu.filter(Boolean).length;
    const ry = nyou.length;
    const rc = ncpu.length;
    let res: 'win' | 'loss' | null = null;
    if (ry <= 5 && rc <= 5) {
      if (a > b + (5 - rc)) res = 'win';
      else if (b > a + (5 - ry)) res = 'loss';
    } else if (ry === rc && a !== b) res = a > b ? 'win' : 'loss';
    if (res) {
      setOver(res === 'win' ? 'YOU WIN THE SHOOTOUT' : 'CPU WINS. HEARTBREAK.');
      setRec((r) => ({ ...r, w: r.w + (res === 'win' ? 1 : 0), l: r.l + (res === 'loss' ? 1 : 0) }));
      playSound(res === 'win' ? 'goal' : 'trombone');
    }
  };

  const act = (d: Dir) => {
    if (over) return;
    if (shooting) {
      // Keeper reads your habits half the time.
      const h = rec.habits;
      const fav = h.indexOf(Math.max(...h)) as Dir;
      const keeper = (chance(0.45) ? fav : randInt(0, 2)) as Dir;
      const scored = keeper !== d;
      const n = [...you, scored];
      setYou(n);
      setLast({ ball: d, keeper, scored, youShot: true });
      setRec((r) => ({ ...r, habits: r.habits.map((v, i) => (i === d ? v + 1 : v)) }));
      playSound(scored ? 'goal' : 'boo');
      decide(n, cpu);
    } else {
      const ball = randInt(0, 2) as Dir;
      const scored = ball !== d;
      const n = [...cpu, scored];
      setCpu(n);
      setLast({ ball, keeper: d, scored, youShot: false });
      playSound(scored ? 'boo' : 'airhorn');
      decide(you, n);
    }
    tap('heavy');
  };
  const reset = () => {
    setYou([]);
    setCpu([]);
    setLast(null);
    setOver(null);
  };
  const dots = (arr: boolean[]) => {
    const len = Math.max(5, arr.length);
    return Array.from({ length: len }, (_, i) => (
      <View key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: arr[i] === undefined ? C.border : arr[i] ? C.win : C.loss }} />
    ));
  };

  return (
    <Col>
      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="h3">You</Txt>
          <Row gap={5}>{dots(you)}</Row>
          <Txt v="h1">{yg}</Txt>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="h3">CPU</Txt>
          <Row gap={5}>{dots(cpu)}</Row>
          <Txt v="h1">{cg}</Txt>
        </Row>
      </Card>
      {/* goal frame */}
      <View style={{ height: 150, borderWidth: 6, borderBottomWidth: 0, borderColor: C.text, borderTopLeftRadius: 4, borderTopRightRadius: 4, flexDirection: 'row' }}>
        {[0, 1, 2].map((z) => (
          <View key={z} style={{ flex: 1, borderRightWidth: z < 2 ? 1 : 0, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: last && last.keeper === z ? 'rgba(214,161,61,0.25)' : undefined }}>
            {last && last.keeper === z ? <Art name="keeper-duel" size={50} /> : null}
            {last && last.ball === z ? <Art name="ball" size={42} /> : null}
          </View>
        ))}
      </View>
      <Txt v="h1" center color={over ? color : C.text}>
        {over ?? (last ? (last.scored ? (last.youShot ? 'GOAL!' : 'CPU scores…') : last.youShot ? 'SAVED by the keeper!' : 'WHAT A SAVE!') : 'Your kick first')}
      </Txt>
      {!over ? (
        <>
          <Txt v="label" center color={C.muted}>
            {shooting ? 'You are shooting — pick a corner' : 'You are in goal — pick a dive'}
          </Txt>
          <Row>
            {DIRS.map((d, i) => (
              <Btn key={d} flex title={d} color={shooting ? color : C.amber} onPress={() => act(i as Dir)} />
            ))}
          </Row>
        </>
      ) : (
        <Btn title="New shootout" icon={RotateCcw} color={color} onPress={reset} />
      )}
      <Row>
        <Stat label="Wins" value={rec.w} color={C.win} />
        <Stat label="Losses" value={rec.l} color={C.loss} />
      </Row>
      <Txt v="small" color={C.muted}>
        Mind-game: the CPU keeper learns your favourite corner over time. Be unpredictable.
      </Txt>
    </Col>
  );
}

// ---------------------------------------------------------------- PES Excuse Bingo
const LINES: number[][] = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  [0, 5, 10, 15], [3, 6, 9, 12],
];
const countLines = (m: boolean[]) => LINES.filter((l) => l.every((i) => m[i])).length;

export function ExcuseBingo({ color }: ModuleProps) {
  const [st, setSt] = usePersisted('ef:bingo', () => ({ cells: shuffle(PES_EXCUSES).slice(0, 16), marks: Array<boolean>(16).fill(false), wins: 0 }));
  const lines = countLines(st.marks);
  const toggle = (i: number) => {
    const marks = st.marks.map((m, k) => (k === i ? !m : m));
    const nl = countLines(marks);
    const won = nl > lines;
    setSt({ ...st, marks, wins: st.wins + (won ? 1 : 0) });
    if (won) playSound('airhorn');
    else tap();
  };
  const winning = new Set(LINES.filter((l) => l.every((i) => st.marks[i])).flat());
  return (
    <Col>
      <Txt v="small" color={C.muted}>
        Tap a square every time your opponent uses that excuse. Four in a row = BINGO.
      </Txt>
      {lines > 0 ? (
        <Card color={C.amber} style={{ alignItems: 'center' }}>
          <Txt v="display">BINGO ×{lines}</Txt>
        </Card>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {st.cells.map((c, i) => (
          <Pressable
            key={i}
            onPress={() => toggle(i)}
            style={{
              width: '23.5%',
              aspectRatio: 1,
              borderRadius: R.md,
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: st.marks[i] ? (winning.has(i) ? C.amber : color) : C.border,
              backgroundColor: st.marks[i] ? (winning.has(i) ? C.amber : color) : C.card,
            }}
          >
            <Txt v="small" center style={{ fontFamily: F.semi, fontSize: 11, lineHeight: 14 }}>
              {c}
            </Txt>
          </Pressable>
        ))}
      </View>
      <Row>
        <Btn flex title="New card" icon={Shuffle} color={color} onPress={() => setSt({ cells: shuffle(PES_EXCUSES).slice(0, 16), marks: Array<boolean>(16).fill(false), wins: st.wins })} />
        <Btn flex variant="outline" title="Clear marks" color={color} onPress={() => setSt({ ...st, marks: Array<boolean>(16).fill(false) })} />
      </Row>
      <Row>
        <Stat label="Lifetime bingos" value={st.wins} color={color} />
      </Row>
    </Col>
  );
}

// ---------------------------------------------------------------- Rivalry Tracker
export function RivalryTracker({ color }: ModuleProps) {
  const names = useEfootballNames();
  const [list, setList] = usePersisted<Rivalry[]>('ef:rivalries', SEED_RIVALRIES);
  const [open, setOpen] = useState(false);
  const [pair, setPair] = useState<string[]>([]);

  const record = (id: string, r: 'a' | 'b' | 'd') => {
    setList((p) => p.map((x) => (x.id === id ? { ...x, aw: x.aw + (r === 'a' ? 1 : 0), bw: x.bw + (r === 'b' ? 1 : 0), d: x.d + (r === 'd' ? 1 : 0), log: [...x.log, r].slice(-20) } : x)));
    playSound(r === 'd' ? 'whistle' : 'goal');
  };
  const undo = (id: string) => {
    setList((p) =>
      p.map((x) => {
        if (x.id !== id || x.log.length === 0) return x;
        const r = x.log[x.log.length - 1];
        return { ...x, aw: x.aw - (r === 'a' ? 1 : 0), bw: x.bw - (r === 'b' ? 1 : 0), d: x.d - (r === 'd' ? 1 : 0), log: x.log.slice(0, -1) };
      }),
    );
  };

  return (
    <Col>
      <Btn title="New rivalry" icon={Plus} color={color} onPress={() => { setPair([]); setOpen(true); }} />
      {list.length === 0 ? <Empty text="No beef yet. Start a rivalry." /> : null}
      {list.map((r) => {
        const total = r.aw + r.bw + r.d || 1;
        const lead = r.aw === r.bw ? 'Dead even' : `${r.aw > r.bw ? r.a : r.b} owns this rivalry`;
        let streak = 0;
        const lastR = r.log[r.log.length - 1];
        for (let i = r.log.length - 1; i >= 0 && r.log[i] === lastR; i--) streak++;
        return (
          <Card key={r.id} style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt v="h1">{r.a}</Txt>
              <Txt v="label" color={C.muted}>
                head to head
              </Txt>
              <Txt v="h1">{r.b}</Txt>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt v="display" color={C.cobalt}>
                {r.aw}
              </Txt>
              <Txt v="h3" color={C.muted}>
                {r.d} draws
              </Txt>
              <Txt v="display" color={C.coral}>
                {r.bw}
              </Txt>
            </Row>
            <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ flex: r.aw / total, backgroundColor: C.cobalt }} />
              <View style={{ flex: r.d / total, backgroundColor: C.slate }} />
              <View style={{ flex: r.bw / total, backgroundColor: C.coral }} />
            </View>
            <Txt v="small" color={C.textDim}>
              {lead}
              {lastR && lastR !== 'd' && streak > 1 ? ` · ${lastR === 'a' ? r.a : r.b} on a ${streak}-game streak` : ''}
            </Txt>
            <Row>
              <Btn flex small title={`${r.a} won`} color={C.cobalt} onPress={() => record(r.id, 'a')} />
              <Btn flex small title="Draw" color={C.slate} onPress={() => record(r.id, 'd')} />
              <Btn flex small title={`${r.b} won`} color={C.coral} onPress={() => record(r.id, 'b')} />
            </Row>
            <Row style={{ justifyContent: 'flex-end' }}>
              <Btn small variant="ghost" title="Undo" icon={Undo2} color={C.muted} onPress={() => undo(r.id)} />
              <Btn small variant="ghost" title="Delete" icon={Trash} color={C.muted} onPress={() => setList((p) => p.filter((x) => x.id !== r.id))} />
            </Row>
          </Card>
        );
      })}
      <Sheet visible={open} onClose={() => setOpen(false)} title="Pick two rivals">
        <Row wrap gap={6}>
          {names.map((n) => (
            <Chip key={n} label={n} active={pair.includes(n)} color={color} onPress={() => setPair((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < 2 ? [...p, n] : p))} />
          ))}
        </Row>
        <Btn
          title="Start rivalry"
          color={color}
          disabled={pair.length !== 2}
          onPress={() => {
            setList((p) => [{ id: uid(), a: pair[0] ?? '', b: pair[1] ?? '', aw: 0, bw: 0, d: 0, log: [] }, ...p]);
            setOpen(false);
          }}
        />
      </Sheet>
    </Col>
  );
}

// ---------------------------------------------------------------- Winner Stays On
type Q = { king: string | null; streak: number; queue: string[]; best: { name: string; streak: number } | null; games: number };

export function WinnerStaysOn({ color }: ModuleProps) {
  const names = useEfootballNames();
  const [q, setQ] = usePersisted<Q>('ef:wso', () => ({ king: null, streak: 0, queue: SEED_LEAGUE_PLAYERS.slice(0, 5), best: null, games: 0 }));
  const challenger = q.queue[0] ?? null;

  const addToQueue = (n: string) => {
    if (q.king === n || q.queue.includes(n)) {
      setQ({ ...q, queue: q.queue.filter((x) => x !== n) });
      return;
    }
    setQ({ ...q, queue: [...q.queue, n] });
  };
  const start = () => {
    if (q.queue.length < 2) return;
    setQ({ ...q, king: q.queue[0] ?? null, queue: q.queue.slice(1), streak: 0 });
  };
  const result = (kingWon: boolean) => {
    if (!q.king || !challenger) return;
    const rest = q.queue.slice(1);
    const newKing = kingWon ? q.king : challenger;
    const loser = kingWon ? challenger : q.king;
    const streak = kingWon ? q.streak + 1 : 1;
    const best = !q.best || streak > q.best.streak ? { name: newKing, streak } : q.best;
    setQ({ king: newKing, streak, queue: [...rest, loser], best, games: q.games + 1 });
    playSound(kingWon ? 'airhorn' : 'goal');
  };

  return (
    <Col>
      {q.king && challenger ? (
        <>
          <Row gap={0} style={{ borderRadius: R.lg, overflow: 'hidden' }}>
            <View style={{ flex: 1, backgroundColor: C.amber, padding: 16, gap: 4 }}>
              <Art name="crown" size={28} />
              <Txt v="label">King · {q.streak} wins</Txt>
              <Txt v="h1">{q.king}</Txt>
            </View>
            <View style={{ flex: 1, backgroundColor: color, padding: 16, gap: 4, alignItems: 'flex-end' }}>
              <Art name="rivalry" size={30} />
              <Txt v="label">Challenger</Txt>
              <Txt v="h1">{challenger}</Txt>
            </View>
          </Row>
          <Row>
            <Btn flex title={`${q.king} won`} color={C.amber} onPress={() => result(true)} />
            <Btn flex title={`${challenger} won`} color={color} onPress={() => result(false)} />
          </Row>
        </>
      ) : (
        <Card style={{ gap: 8 }}>
          <Txt v="h2">Add at least 2 players, then start.</Txt>
          <Btn title="Start session" color={color} onPress={start} disabled={q.queue.length < 2} />
        </Card>
      )}
      <Section title={`Queue (${q.queue.length})`}>
        {q.queue.length === 0 ? <Empty text="Queue is empty." /> : null}
        {q.queue.map((n, i) => (
          <Row key={n} style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
            <Txt v="h3" color={i === 0 ? color : C.text}>
              {i + 1}. {n} {i === 0 ? '· up next' : ''}
            </Txt>
            <IconBtn icon={Trash} size={30} color={C.muted} onPress={() => setQ({ ...q, queue: q.queue.filter((x) => x !== n) })} label="Remove" />
          </Row>
        ))}
      </Section>
      <Section title="Tap to join / leave the queue">
        <Row wrap gap={6}>
          {names.map((n) => (
            <Chip key={n} small label={n} active={q.queue.includes(n) || q.king === n} color={color} onPress={() => addToQueue(n)} />
          ))}
        </Row>
      </Section>
      <Row>
        <Stat label="Games" value={q.games} />
        <Stat label="Record streak" value={q.best ? `${q.best.streak}` : '—'} color={C.amber} />
      </Row>
      {q.best ? (
        <Txt v="small" color={C.muted} center>
          Record held by {q.best.name}
        </Txt>
      ) : null}
      <Btn variant="outline" title="Reset session" icon={RotateCcw} color={C.muted} onPress={() => setQ({ king: null, streak: 0, queue: [], best: q.best, games: q.games })} />
    </Col>
  );
}

// ---------------------------------------------------------------- Handicap Spinner
export function HandicapSpinner({ color }: ModuleProps) {
  const [custom, setCustom] = usePersisted<string[]>('ef:handicap-custom', []);
  const [hist, setHist] = usePersisted<{ h: string; ts: number }[]>('ef:handicap-hist', []);
  const [res, setRes] = useState<string | null>(null);
  const [txt, setTxt] = useState('');
  const items = [...HANDICAPS, ...custom];
  return (
    <Col>
      <Wheel items={items} onResult={(h) => { setRes(h); setHist((p) => [{ h, ts: Date.now() }, ...p].slice(0, 10)); }} color={color} label="SPIN HANDICAP" />
      {res ? (
        <Card color={C.coral} style={{ alignItems: 'center', gap: 4 }}>
          <Txt v="label">Your handicap</Txt>
          <Txt v="display" center>
            {res}
          </Txt>
        </Card>
      ) : null}
      <Section title="Add your own rule">
        <Row>
          <View style={{ flex: 1 }}>
            <Field value={txt} onChangeText={setTxt} placeholder="e.g. Only shoot with R1" maxLength={30} />
          </View>
          <IconBtn icon={Plus} bg={color} onPress={() => { if (txt.trim()) setCustom((p) => [...p, txt.trim()]); setTxt(''); }} label="Add" />
        </Row>
        <Row wrap gap={6}>
          {custom.map((c) => (
            <Chip key={c} small label={`${c} ✕`} onPress={() => setCustom((p) => p.filter((x) => x !== c))} />
          ))}
        </Row>
      </Section>
      {hist.length ? (
        <Section title="Recent spins">
          {hist.map((h, i) => (
            <Row key={i} style={{ justifyContent: 'space-between' }}>
              <Txt v="body">{h.h}</Txt>
              <Txt v="small" color={C.muted}>
                {timeAgo(h.ts)}
              </Txt>
            </Row>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Wooden Spoon
export function WoodenSpoon({ color }: ModuleProps) {
  const names = useNames();
  const [list, setList] = usePersisted<Shame[]>('ef:shame', SEED_SHAME);
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState('');
  const [crime, setCrime] = useState('');
  const sorted = list.slice().sort((a, b) => b.tomatoes - a.tomatoes);
  const max = Math.max(1, ...list.map((s) => s.tomatoes));
  return (
    <Col>
      <Btn title="Nominate for the Wall" icon={Plus} color={color} onPress={() => setOpen(true)} />
      {sorted.map((s, i) => (
        <Card key={s.id} style={{ gap: 8 }} color={i === 0 ? C.card2 : undefined}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row gap={8}>
              {i === 0 ? <Art name="wooden-spoon" size={28} /> : null}
              <Txt v="h1">{s.name}</Txt>
            </Row>
            <Txt v="small" color={C.muted}>
              {timeAgo(s.ts)}
            </Txt>
          </Row>
          <Txt v="body" color={C.textDim}>
            {s.crime}
          </Txt>
          <Bar pct={(s.tomatoes / max) * 100} color={C.coral} />
          <Row>
            <Btn small art="tomato" title={`Throw tomato · ${s.tomatoes}`} color={C.coral} onPress={() => { setList((p) => p.map((x) => (x.id === s.id ? { ...x, tomatoes: x.tomatoes + 1 } : x))); playSound('boo'); }} />
            <View style={{ flex: 1 }} />
            <IconBtn icon={Trash} size={32} color={C.muted} onPress={() => setList((p) => p.filter((x) => x.id !== s.id))} label="Pardon" />
          </Row>
        </Card>
      ))}
      <Sheet visible={open} onClose={() => setOpen(false)} title="Hall of Shame entry">
        <Row wrap gap={6}>
          {names.map((n) => (
            <Chip key={n} small label={n} active={who === n} color={color} onPress={() => setWho(n)} />
          ))}
        </Row>
        <Field label="The crime" value={crime} onChangeText={setCrime} placeholder="Lost 6–0 and blamed the Wi-Fi" multiline maxLength={140} />
        <Btn
          title="Hang it on the wall"
          color={color}
          disabled={!who || !crime.trim()}
          onPress={() => {
            setList((p) => [{ id: uid(), name: who, crime: crime.trim(), tomatoes: 0, ts: Date.now() }, ...p]);
            setOpen(false);
            setCrime('');
            playSound('trombone');
          }}
        />
      </Sheet>
    </Col>
  );
}
