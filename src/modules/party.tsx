import { Eye, EyeOff, Plus, RotateCcw, Shuffle, Timer, Users } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import {
  BLUFFS,
  BOMB_TOPICS,
  CHARADES,
  DARES,
  FIVE_SECOND,
  NEVER,
  SPOTS_CAMPUS,
  SPOTS_FOOTBALL,
  TABOO,
  TRUTHS,
  WAVELENGTH,
  WHO_IN_CLASS,
  WYR,
} from '../data/content';
import { useCountdown, useDeck, useNames } from '../engines/hooks';
import { QuizRunner } from '../engines/Quiz';
import { Wheel } from '../engines/Wheel';
import { usePersisted } from '../lib/store';
import { playSound, stopSound, tap } from '../lib/sound';
import { hashStr, pick, randInt, sample, timeAgo } from '../lib/utils';
import { C, R } from '../theme';
import { Art, Bar, Btn, Card, Chip, Col, Empty, Field, IconBtn, PeoplePicker, Row, Section, Segmented, Stat, Tag, Txt } from '../ui';
import type { ModuleProps } from './types';

function TimerBar({ left, pct, color }: { left: number; pct: number; color: string }) {
  return (
    <Col gap={6}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="label" color={C.muted}>
          Time
        </Txt>
        <Txt v="h1" color={left < 5 ? C.coral : C.text}>
          {Math.ceil(left)}s
        </Txt>
      </Row>
      <Bar pct={pct} color={left < 5 ? C.coral : color} height={10} />
    </Col>
  );
}

function PromptCard({ color, label, text, sub }: { color: string; label: string; text: string; sub?: string }) {
  return (
    <Card color={color} style={{ minHeight: 170, justifyContent: 'center', gap: 10, paddingVertical: 28 }}>
      <Txt v="label">{label}</Txt>
      <Txt v="display">{text}</Txt>
      {sub ? <Txt v="body">{sub}</Txt> : null}
    </Card>
  );
}

// ---------------------------------------------------------------- Imposter
type ImpPhase = 'setup' | 'reveal' | 'discuss' | 'vote' | 'result';

export function Imposter({ color }: ModuleProps) {
  const names = useNames();
  const [players, setPlayers] = usePersisted<string[]>('party:imp-players', () => names.slice(0, 5));
  const [mode, setMode] = useState<'campus' | 'football'>('campus');
  const [phase, setPhase] = useState<ImpPhase>('setup');
  const [secret, setSecret] = useState('');
  const [imp, setImp] = useState(0);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [voted, setVoted] = useState<string | null>(null);
  const [stats, setStats] = usePersisted('party:imp-stats', { games: 0, caught: 0, escaped: 0 });
  const timer = useCountdown(() => {
    playSound('whistle');
    setPhase('vote');
  });

  const start = () => {
    if (players.length < 3) return;
    setSecret(pick(mode === 'campus' ? SPOTS_CAMPUS : SPOTS_FOOTBALL));
    setImp(Math.floor(Math.random() * players.length));
    setI(0);
    setShown(false);
    setVoted(null);
    setPhase('reveal');
  };
  const vote = (n: string) => {
    setVoted(n);
    const caught = n === players[imp];
    setStats({ games: stats.games + 1, caught: stats.caught + (caught ? 1 : 0), escaped: stats.escaped + (caught ? 0 : 1) });
    playSound(caught ? 'airhorn' : 'trombone');
    setPhase('result');
  };

  if (phase === 'setup') {
    return (
      <Col>
        <Segmented options={[{ value: 'campus', label: 'Campus spots' }, { value: 'football', label: 'Footballers' }]} value={mode} onChange={setMode} color={color} />
        <Section title={`Players (${players.length}) — min 3`}>
          <PeoplePicker people={names.map((n, k) => ({ id: `${k}`, name: n, nick: '', club: '', efootball: false }))} selected={players} onToggle={(n) => setPlayers((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))} color={color} />
        </Section>
        <Card style={{ gap: 6 }}>
          <Txt v="h3">How to play</Txt>
          <Txt v="small" color={C.textDim}>
            Pass the phone. Everyone sees the secret {mode === 'campus' ? 'place' : 'player'} — except the Imposter. Ask each other questions, then vote out who’s faking it.
          </Txt>
        </Card>
        <Btn title="Deal roles" icon={Users} color={color} onPress={start} disabled={players.length < 3} />
        <Row>
          <Stat label="Games" value={stats.games} />
          <Stat label="Caught" value={stats.caught} color={C.win} />
          <Stat label="Escaped" value={stats.escaped} color={C.loss} />
        </Row>
      </Col>
    );
  }

  if (phase === 'reveal') {
    const isImp = i === imp;
    return (
      <Col>
        <Txt v="label" color={C.muted} center>
          Player {i + 1} of {players.length}
        </Txt>
        <Txt v="display" center>
          Pass to {players[i]}
        </Txt>
        <Pressable onPress={() => setShown((s) => !s)}>
          <Card color={shown ? (isImp ? C.coral : color) : C.card} style={{ minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {shown ? (
              <>
                <Txt v="label">{isImp ? 'You are the' : mode === 'campus' ? 'The place is' : 'The player is'}</Txt>
                {isImp ? <Art name="imposter" size={96} /> : null}
                <Txt v="display" center>
                  {isImp ? 'IMPOSTER' : secret}
                </Txt>
                {isImp ? <Txt v="small">Blend in. Figure out the secret.</Txt> : null}
              </>
            ) : (
              <>
                <Eye size={32} color={C.muted} />
                <Txt v="h2" color={C.muted}>
                  Tap to reveal your role
                </Txt>
              </>
            )}
          </Card>
        </Pressable>
        <Btn
          title={i + 1 < players.length ? 'Hide & pass on' : 'Start discussion'}
          icon={EyeOff}
          color={color}
          disabled={!shown}
          onPress={() => {
            setShown(false);
            if (i + 1 < players.length) setI(i + 1);
            else {
              setPhase('discuss');
              timer.start(120);
            }
          }}
        />
      </Col>
    );
  }

  if (phase === 'discuss') {
    return (
      <Col>
        <View style={{ alignItems: 'center' }}>
          <Art name="eyes" size={80} />
        </View>
        <Txt v="display" center>
          Interrogate!
        </Txt>
        <Txt v="body" center color={C.textDim}>
          {players[randInt(0, players.length - 1)]} asks the first question.
        </Txt>
        <TimerBar left={timer.left} pct={timer.pct} color={color} />
        <Btn title="Vote now" color={color} onPress={() => { timer.stop(); setPhase('vote'); }} />
      </Col>
    );
  }

  if (phase === 'vote') {
    return (
      <Col>
        <Txt v="display" center>
          Who is the Imposter?
        </Txt>
        <Row wrap gap={8} style={{ justifyContent: 'center' }}>
          {players.map((p) => (
            <Btn key={p} title={p} color={C.card2} onPress={() => vote(p)} />
          ))}
        </Row>
      </Col>
    );
  }

  const caught = voted === players[imp];
  return (
    <Col>
      <Card color={caught ? C.win : C.coral} style={{ alignItems: 'center', gap: 6, paddingVertical: 28 }}>
        <Txt v="label">{caught ? 'Caught!' : 'The Imposter escaped'}</Txt>
        <Txt v="display" center>
          {players[imp]} was the Imposter
        </Txt>
        <Txt v="h3">Secret: {secret}</Txt>
      </Card>
      <Row>
        <Btn flex title="Play again" icon={RotateCcw} color={color} onPress={start} />
        <Btn flex variant="outline" title="Change players" color={color} onPress={() => setPhase('setup')} />
      </Row>
    </Col>
  );
}

// ---------------------------------------------------------------- Who in this class
export function WhoInClass({ color }: ModuleProps) {
  const names = useNames();
  const [custom, setCustom] = usePersisted<string[]>('party:who-custom', []);
  const [titles, setTitles] = usePersisted<Record<string, number>>('party:who-titles', {});
  const deck = useDeck([...WHO_IN_CLASS, ...custom]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [txt, setTxt] = useState('');
  const total = Object.values(votes).reduce((s, v) => s + v, 0);
  const max = Math.max(0, ...Object.values(votes));
  const winners = Object.entries(votes).filter(([, v]) => v === max && v > 0).map(([n]) => n);

  const reveal = () => {
    setRevealed(true);
    setTitles((t) => {
      const n = { ...t };
      winners.forEach((w) => (n[w] = (n[w] ?? 0) + 1));
      return n;
    });
    playSound('rimshot');
  };
  const next = () => {
    deck.next();
    setVotes({});
    setRevealed(false);
  };

  return (
    <Col>
      <PromptCard color={color} label={`Rapid roast · ${deck.index + 1}/${deck.total}`} text={deck.card ?? ''} />
      {!revealed ? (
        <>
          <Txt v="small" color={C.muted}>
            Pass the phone — everyone taps one name secretly. {total} vote{total === 1 ? '' : 's'} so far.
          </Txt>
          <Row wrap gap={6}>
            {names.map((n) => (
              <Chip key={n} label={n} onPress={() => setVotes((v) => ({ ...v, [n]: (v[n] ?? 0) + 1 }))} />
            ))}
          </Row>
          <Row>
            <Btn flex title="Reveal verdict" color={color} onPress={reveal} disabled={total === 0} />
            <Btn flex variant="outline" title="Skip" color={color} onPress={next} />
          </Row>
        </>
      ) : (
        <>
          <Card style={{ gap: 8 }}>
            <Txt v="label" color={C.muted}>
              The class has spoken
            </Txt>
            <Txt v="display" color={color}>
              {winners.join(' & ')}
            </Txt>
            {Object.entries(votes)
              .sort((a, b) => b[1] - a[1])
              .map(([n, v]) => (
                <Col key={n} gap={4}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Txt v="h3">{n}</Txt>
                    <Txt v="small">{v} votes</Txt>
                  </Row>
                  <Bar pct={(v / total) * 100} color={winners.includes(n) ? color : C.slate} />
                </Col>
              ))}
          </Card>
          <Btn title="Next question" icon={Shuffle} color={color} onPress={next} />
        </>
      )}
      <Section title="Add your own question">
        <Row>
          <View style={{ flex: 1 }}>
            <Field value={txt} onChangeText={setTxt} placeholder="Who in this class is most likely to…" maxLength={120} />
          </View>
          <IconBtn icon={Plus} bg={color} onPress={() => { if (txt.trim()) setCustom((p) => [...p, txt.trim()]); setTxt(''); }} label="Add" />
        </Row>
      </Section>
      {Object.keys(titles).length ? (
        <Section title="Most roasted" right={<Btn small variant="ghost" title="Reset" color={C.muted} onPress={() => setTitles({})} />}>
          <Row wrap gap={6}>
            {Object.entries(titles)
              .sort((a, b) => b[1] - a[1])
              .map(([n, c]) => (
                <Tag key={n} label={`${n} ×${c}`} color={C.card2} />
              ))}
          </Row>
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- 5-Second Rule
export function FiveSecond({ color }: ModuleProps) {
  const names = useNames();
  const deck = useDeck(FIVE_SECOND);
  const [scores, setScores] = usePersisted<Record<string, number>>('party:5s-scores', {});
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'run' | 'judge'>('ready');
  const players = names.slice(0, 8);
  const cur = players[turn % Math.max(1, players.length)] ?? 'Player';
  const timer = useCountdown(() => {
    playSound('whistle');
    setPhase('judge');
  });
  const judge = (ok: boolean) => {
    if (ok) setScores((s) => ({ ...s, [cur]: (s[cur] ?? 0) + 1 }));
    else playSound('boo');
    setTurn((t) => t + 1);
    deck.next();
    setPhase('ready');
  };
  return (
    <Col>
      <Txt v="label" color={C.muted} center>
        {cur}’s turn
      </Txt>
      <PromptCard color={phase === 'run' ? C.coral : color} label="5-second rule" text={phase === 'ready' ? 'Ready?' : deck.card ?? ''} sub={phase === 'ready' ? 'The prompt appears when the timer starts.' : undefined} />
      {phase === 'run' ? (
        <Txt v="big" center>
          {Math.ceil(timer.left)}
        </Txt>
      ) : null}
      {phase === 'ready' ? (
        <Btn title="Start 5 seconds" icon={Timer} color={color} onPress={() => { setPhase('run'); timer.start(5); tap('heavy'); }} />
      ) : null}
      {phase === 'judge' ? (
        <Row>
          <Btn flex title="Got all 3 ✓" color={C.win} onPress={() => judge(true)} />
          <Btn flex title="Failed ✗" color={C.loss} onPress={() => judge(false)} />
        </Row>
      ) : null}
      <Section title="Scoreboard" right={<Btn small variant="ghost" title="Reset" color={C.muted} onPress={() => setScores({})} />}>
        {players.map((p) => (
          <Row key={p} style={{ justifyContent: 'space-between' }}>
            <Txt v="h3" color={p === cur ? color : C.text}>
              {p}
            </Txt>
            <Txt v="h3">{scores[p] ?? 0}</Txt>
          </Row>
        ))}
      </Section>
    </Col>
  );
}

// ---------------------------------------------------------------- Truth or Dare
export function TruthOrDare({ color }: ModuleProps) {
  const names = useNames();
  const [seat, setSeat] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<{ kind: 'TRUTH' | 'DARE'; text: string } | null>(null);
  const [stats, setStats] = usePersisted<Record<string, { brave: number; chicken: number }>>('party:tod', {});
  const spin = () => {
    setSeat(pick(names));
    setPrompt(null);
    playSound('heartbeat');
  };
  const done = (brave: boolean) => {
    if (!seat) return;
    const s = stats[seat] ?? { brave: 0, chicken: 0 };
    setStats({ ...stats, [seat]: { brave: s.brave + (brave ? 1 : 0), chicken: s.chicken + (brave ? 0 : 1) } });
    playSound(brave ? 'airhorn' : 'boo');
    setSeat(null);
    setPrompt(null);
  };
  return (
    <Col>
      <Card color={seat ? color : C.card} style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <Art name="truth-dare" size={64} />
        <Txt v="label">Hot seat</Txt>
        <Txt v="display">{seat ?? '—'}</Txt>
      </Card>
      <Btn title={seat ? 'Re-spin hot seat' : 'Pick who is in the hot seat'} icon={Shuffle} color={color} variant={seat ? 'outline' : 'solid'} onPress={spin} />
      {seat ? (
        <Row>
          <Btn flex title="Truth" color={C.cobalt} onPress={() => setPrompt({ kind: 'TRUTH', text: pick(TRUTHS) })} />
          <Btn flex title="Dare" color={C.coral} onPress={() => setPrompt({ kind: 'DARE', text: pick(DARES) })} />
        </Row>
      ) : null}
      {prompt ? (
        <>
          <PromptCard color={prompt.kind === 'TRUTH' ? C.cobalt : C.coral} label={prompt.kind} text={prompt.text} />
          <Row>
            <Btn flex title="Done ✓" color={C.win} onPress={() => done(true)} />
            <Btn flex title="Chickened out" color={C.slate} onPress={() => done(false)} />
          </Row>
        </>
      ) : null}
      {Object.keys(stats).length ? (
        <Section title="Bravery board">
          {Object.entries(stats)
            .sort((a, b) => b[1].brave - a[1].brave)
            .map(([n, s]) => (
              <Row key={n} style={{ justifyContent: 'space-between' }}>
                <Txt v="h3">{n}</Txt>
                <Txt v="small" color={C.textDim}>
                  brave {s.brave} · chicken {s.chicken}
                </Txt>
              </Row>
            ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Never Have I Ever
export function NeverHaveIEver({ color }: ModuleProps) {
  const names = useNames();
  const deck = useDeck(NEVER);
  const [fingers, setFingers] = usePersisted<Record<string, number>>('party:nhie', () => Object.fromEntries(names.slice(0, 6).map((n) => [n, 5])));
  const [adding, setAdding] = useState(false);
  const entries = Object.entries(fingers);
  const alive = entries.filter(([, f]) => f > 0);
  return (
    <Col>
      <PromptCard color={color} label="Campus edition" text={deck.card ?? ''} sub="If you HAVE done it, tap your name to put a finger down." />
      <Btn title="Next statement" icon={Shuffle} color={color} onPress={deck.next} />
      <Section title={`Fingers up · ${alive.length} still in`} right={<Btn small variant="ghost" title={adding ? 'Done' : 'Edit players'} color={C.muted} onPress={() => setAdding((a) => !a)} />}>
        {adding ? (
          <Row wrap gap={6}>
            {names.map((n) => (
              <Chip
                key={n}
                small
                label={n}
                active={fingers[n] !== undefined}
                color={color}
                onPress={() =>
                  setFingers((f) => {
                    const c = { ...f };
                    if (c[n] !== undefined) delete c[n];
                    else c[n] = 5;
                    return c;
                  })
                }
              />
            ))}
          </Row>
        ) : null}
        {entries.length === 0 ? <Empty text="Add players to start." /> : null}
        {entries.map(([n, f]) => (
          <Pressable
            key={n}
            onPress={() => {
              if (f <= 0) return;
              setFingers((x) => ({ ...x, [n]: f - 1 }));
              if (f - 1 === 0) playSound('trombone');
              else tap();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: R.md, backgroundColor: f === 0 ? C.bg : C.card, borderWidth: 1, borderColor: C.border }}
          >
            <Txt v="h3" color={f === 0 ? C.muted : C.text}>
              {n} {f === 0 ? '— OUT' : ''}
            </Txt>
            <Row gap={2}>
              {f === 0 ? <Art name="skull" size={26} /> : Array.from({ length: f }, (_, k) => <Art key={k} name="never" size={22} />)}
            </Row>
          </Pressable>
        ))}
      </Section>
      {alive.length === 1 && entries.length > 1 ? (
        <Card color={C.amber} style={{ alignItems: 'center' }}>
          <Txt v="label">Most innocent</Txt>
          <Txt v="display">{alive[0]?.[0]}</Txt>
        </Card>
      ) : null}
      <Btn variant="outline" title="Reset fingers" icon={RotateCcw} color={color} onPress={() => setFingers((f) => Object.fromEntries(Object.keys(f).map((n) => [n, 5])))} />
    </Col>
  );
}

// ---------------------------------------------------------------- Bomb Hot Potato
export function BombPotato({ color }: ModuleProps) {
  const names = useNames();
  const [phase, setPhase] = useState<'idle' | 'live' | 'boom'>('idle');
  const [topic, setTopic] = useState(pick(BOMB_TOPICS));
  const [losses, setLosses] = usePersisted<Record<string, number>>('party:bomb', {});
  const [pulse] = useState(() => new Animated.Value(1));
  const fuse = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (fuse.current) clearTimeout(fuse.current);
    if (tick.current) clearInterval(tick.current);
    fuse.current = null;
    tick.current = null;
  };
  useEffect(() => () => {
    clear();
    stopSound('heartbeat');
  }, []);
  useEffect(() => {
    if (phase !== 'live') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  const start = () => {
    clear();
    setTopic(pick(BOMB_TOPICS));
    setPhase('live');
    playSound('heartbeat');
    tick.current = setInterval(() => playSound('heartbeat'), 2600);
    fuse.current = setTimeout(() => {
      clear();
      stopSound('heartbeat');
      setPhase('boom');
      playSound('boom');
      tap('error');
    }, randInt(12, 40) * 1000);
  };

  return (
    <Col>
      {phase === 'boom' ? (
        <Card color={C.coral} style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
          <Art name="roast-name" size={110} />
          <Txt v="big">BOOM</Txt>
          <Txt v="h2">Whoever is holding the phone loses!</Txt>
        </Card>
      ) : (
        <Card color={phase === 'live' ? C.card2 : C.card} style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Art name="bomb" size={110} />
          </Animated.View>
          <Txt v="label" color={C.muted}>
            Topic
          </Txt>
          <Txt v="display" center>
            {topic}
          </Txt>
          <Txt v="small" color={C.textDim} center>
            {phase === 'live' ? 'Say one answer, pass the phone. The fuse is hidden…' : 'The fuse is random: 12–40 seconds. Nobody knows when.'}
          </Txt>
        </Card>
      )}
      {phase !== 'live' ? <Btn title={phase === 'boom' ? 'Light a new fuse' : 'Light the fuse'} art="fire" color={color} onPress={start} /> : null}
      {phase === 'boom' ? (
        <Section title="Who was holding it?">
          <Row wrap gap={6}>
            {names.map((n) => (
              <Chip key={n} small label={n} onPress={() => { setLosses((l) => ({ ...l, [n]: (l[n] ?? 0) + 1 })); setPhase('idle'); }} />
            ))}
          </Row>
        </Section>
      ) : null}
      {Object.keys(losses).length ? (
        <Section title="Blown up the most" right={<Btn small variant="ghost" title="Reset" color={C.muted} onPress={() => setLosses({})} />}>
          {Object.entries(losses)
            .sort((a, b) => b[1] - a[1])
            .map(([n, c]) => (
              <Row key={n} style={{ justifyContent: 'space-between' }}>
                <Txt v="h3">{n}</Txt>
                <Row gap={4}>
                  <Art name="bomb" size={20} />
                  <Txt v="h3">{c}</Txt>
                </Row>
              </Row>
            ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Would You Rather
export function WouldYouRather({ color }: ModuleProps) {
  const deck = useDeck(WYR.map((_, i) => i));
  const [votes, setVotes] = usePersisted<Record<number, [number, number]>>('party:wyr', {});
  const [picked, setPicked] = useState<0 | 1 | null>(null);
  const idx = deck.card ?? 0;
  const pair = WYR[idx] ?? WYR[0]!;
  const base: [number, number] = (() => {
    const h = hashStr(pair[0]);
    return [8 + (h % 20), 8 + ((h >> 5) % 20)];
  })();
  const v = votes[idx] ?? base;
  const total = v[0] + v[1];
  const choose = (k: 0 | 1) => {
    if (picked !== null) return;
    setPicked(k);
    setVotes((p) => ({ ...p, [idx]: (k === 0 ? [v[0] + 1, v[1]] : [v[0], v[1] + 1]) as [number, number] }));
    tap();
  };
  return (
    <Col>
      <Txt v="display" center>
        Would you rather…
      </Txt>
      {([0, 1] as const).map((k) => {
        const pct = Math.round((v[k] / total) * 100);
        return (
          <Pressable key={k} onPress={() => choose(k)}>
            <Card color={k === 0 ? C.cobalt : C.coral} style={{ minHeight: 130, justifyContent: 'center', gap: 8, borderWidth: 3, borderColor: picked === k ? C.text : k === 0 ? C.cobalt : C.coral }}>
              <Txt v="h1">{pair[k]}</Txt>
              {picked !== null ? (
                <>
                  <Bar pct={pct} color={C.text} track="rgba(0,0,0,0.25)" />
                  <Txt v="h3">
                    {pct}% · {v[k]} votes
                  </Txt>
                </>
              ) : null}
            </Card>
          </Pressable>
        );
      })}
      <Btn title={picked === null ? 'Skip' : 'Next dilemma'} icon={Shuffle} color={color} variant={picked === null ? 'outline' : 'solid'} onPress={() => { setPicked(null); deck.next(); }} />
    </Col>
  );
}

// ---------------------------------------------------------------- Charades
export function Charades({ color }: ModuleProps) {
  const cats = Object.keys(CHARADES);
  const [cat, setCat] = useState(cats[0] ?? '');
  const deck = useDeck(CHARADES[cat] ?? []);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'run' | 'done'>('ready');
  const [best, setBest] = usePersisted('party:charades-best', 0);
  const timer = useCountdown(() => {
    setPhase('done');
    playSound('whistle');
  });
  useEffect(() => {
    if (phase === 'done' && score > best) setBest(score);
  }, [phase, score, best, setBest]);
  return (
    <Col>
      {phase === 'ready' ? (
        <>
          <Row wrap gap={6}>
            {cats.map((c) => (
              <Chip key={c} label={c} active={cat === c} color={color} onPress={() => setCat(c)} />
            ))}
          </Row>
          <Card style={{ gap: 6 }}>
            <Txt v="h3">60 seconds. Act it out. No talking.</Txt>
            <Txt v="small" color={C.textDim}>
              The actor holds the phone facing themselves. Tap Correct when your team guesses, Skip if stuck.
            </Txt>
          </Card>
          <Btn title="Start round" icon={Timer} color={color} onPress={() => { setScore(0); deck.next(); setPhase('run'); timer.start(60); }} />
        </>
      ) : null}
      {phase === 'run' ? (
        <>
          <TimerBar left={timer.left} pct={timer.pct} color={color} />
          <PromptCard color={color} label={`${cat} · score ${score}`} text={deck.card ?? ''} />
          <Row>
            <Btn flex title="Skip" color={C.slate} onPress={deck.next} />
            <Btn flex title="Correct ✓" color={C.win} onPress={() => { setScore((s) => s + 1); tap('success'); deck.next(); }} />
          </Row>
        </>
      ) : null}
      {phase === 'done' ? (
        <>
          <Card color={color} style={{ alignItems: 'center', paddingVertical: 28 }}>
            <Txt v="label">Time’s up</Txt>
            <Txt v="big">{score}</Txt>
            <Txt v="h3">correct guesses</Txt>
          </Card>
          <Btn title="Next team" icon={RotateCcw} color={color} onPress={() => setPhase('ready')} />
        </>
      ) : null}
      <Row>
        <Stat label="Best round" value={best} color={color} />
      </Row>
    </Col>
  );
}

// ---------------------------------------------------------------- Forbidden Word
export function ForbiddenWord({ color }: ModuleProps) {
  const deck = useDeck(TABOO);
  const [team, setTeam] = useState<0 | 1>(0);
  const [scores, setScores] = usePersisted<[number, number]>('party:taboo', [0, 0]);
  const [phase, setPhase] = useState<'ready' | 'run'>('ready');
  const timer = useCountdown(() => {
    setPhase('ready');
    setTeam((t) => (t === 0 ? 1 : 0));
    playSound('whistle');
  });
  const add = (d: number) => setScores((s) => (team === 0 ? [s[0] + d, s[1]] : [s[0], s[1] + d]));
  const card = deck.card;
  return (
    <Col>
      <Row>
        {(['Team A', 'Team B'] as const).map((t, k) => (
          <Card key={t} color={team === k ? (k === 0 ? C.cobalt : C.coral) : C.card} style={{ flex: 1, alignItems: 'center' }} pad={12}>
            <Txt v="label">{t}</Txt>
            <Txt v="display">{scores[k]}</Txt>
          </Card>
        ))}
      </Row>
      {phase === 'ready' ? (
        <>
          <Txt v="h2" center>
            {team === 0 ? 'Team A' : 'Team B'}, you’re up. 60 seconds.
          </Txt>
          <Btn title="Start round" icon={Timer} color={color} onPress={() => { deck.next(); setPhase('run'); timer.start(60); }} />
          <Btn variant="outline" title="Reset scores" color={C.muted} onPress={() => setScores([0, 0])} />
        </>
      ) : card ? (
        <>
          <TimerBar left={timer.left} pct={timer.pct} color={color} />
          <Card color={color} style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
            <Txt v="label">Describe</Txt>
            <Txt v="display">{card.word}</Txt>
            <View style={{ width: '100%', gap: 6 }}>
              {card.banned.map((b) => (
                <View key={b} style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: R.sm, padding: 8 }}>
                  <Txt v="h3" center>
                    {b}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
          <Row>
            <Btn flex small title="TABOO! −1" color={C.loss} onPress={() => { add(-1); playSound('boo'); deck.next(); }} />
            <Btn flex small title="Skip" color={C.slate} onPress={deck.next} />
            <Btn flex small title="Correct +1" color={C.win} onPress={() => { add(1); tap('success'); deck.next(); }} />
          </Row>
        </>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Bluff Detective
export function BluffDetective({ color }: ModuleProps) {
  return (
    <QuizRunner
      storageKey="party:bluff"
      color={color}
      intro="Fake News desk: decide if each headline is REAL or a BLUFF. Pass the phone between rounds."
      make={() =>
        sample(BLUFFS, 8).map((b) => ({ prompt: b.text, options: ['Real news', 'Total bluff'], answer: b.real ? 0 : 1, explain: b.note }))
      }
    />
  );
}

// ---------------------------------------------------------------- Wavelength
export function Wavelength({ color }: ModuleProps) {
  const [pair, setPair] = useState(pick(WAVELENGTH));
  const [target, setTarget] = useState(randInt(5, 95));
  const [guess, setGuess] = useState(50);
  const [phase, setPhase] = useState<'psychic' | 'guess' | 'reveal'>('psychic');
  const [peek, setPeek] = useState(false);
  const [w, setW] = useState(1);
  const [stats, setStats] = usePersisted('party:wave', { rounds: 0, points: 0 });
  const diff = Math.abs(guess - target);
  const pts = diff <= 4 ? 4 : diff <= 9 ? 3 : diff <= 15 ? 2 : 0;

  const reveal = () => {
    setPhase('reveal');
    setStats({ rounds: stats.rounds + 1, points: stats.points + pts });
    playSound(pts === 4 ? 'airhorn' : pts > 0 ? 'rimshot' : 'trombone');
  };
  const next = () => {
    setPair(pick(WAVELENGTH));
    setTarget(randInt(5, 95));
    setGuess(50);
    setPeek(false);
    setPhase('psychic');
  };

  const showTarget = (phase === 'psychic' && peek) || phase === 'reveal';
  return (
    <Col>
      <Row style={{ justifyContent: 'space-between' }}>
        <Tag label={`◀ ${pair[0]}`} color={C.cobalt} />
        <Tag label={`${pair[1]} ▶`} color={C.coral} />
      </Row>
      <Pressable
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        onPress={(e) => {
          if (phase !== 'guess') return;
          setGuess(Math.round(Math.max(0, Math.min(100, (e.nativeEvent.locationX / w) * 100))));
        }}
        style={{ height: 90, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}
      >
        {showTarget ? (
          <>
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${Math.max(0, target - 15)}%`, width: `${Math.min(30, 100)}%`, backgroundColor: 'rgba(214,161,61,0.25)' }} />
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${Math.max(0, target - 9)}%`, width: '18%', backgroundColor: 'rgba(214,161,61,0.45)' }} />
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${Math.max(0, target - 4)}%`, width: '8%', backgroundColor: C.amber }} />
          </>
        ) : null}
        {phase !== 'psychic' ? <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${guess}%`, width: 4, marginLeft: -2, backgroundColor: C.text }} /> : null}
      </Pressable>
      {phase === 'psychic' ? (
        <>
          <Card style={{ gap: 6 }}>
            <Txt v="h3">Psychic only</Txt>
            <Txt v="small" color={C.textDim}>
              Peek at the hidden target, then give your team ONE clue that sits at that spot between “{pair[0]}” and “{pair[1]}”.
            </Txt>
          </Card>
          <Row>
            <Btn flex variant="outline" title={peek ? 'Hide target' : 'Peek target'} icon={peek ? EyeOff : Eye} color={color} onPress={() => setPeek((p) => !p)} />
            <Btn flex title="Clue given → team guess" color={color} onPress={() => { setPeek(false); setPhase('guess'); }} />
          </Row>
        </>
      ) : null}
      {phase === 'guess' ? (
        <>
          <Txt v="small" color={C.muted} center>
            Team: tap the bar where you think the target is. Fine-tune below.
          </Txt>
          <Row style={{ justifyContent: 'center' }}>
            <Btn small title="◀ −5" color={C.slate} onPress={() => setGuess((g) => Math.max(0, g - 5))} />
            <Btn small title="−1" color={C.slate} onPress={() => setGuess((g) => Math.max(0, g - 1))} />
            <Txt v="h1" style={{ minWidth: 50, textAlign: 'center' }}>
              {guess}
            </Txt>
            <Btn small title="+1" color={C.slate} onPress={() => setGuess((g) => Math.min(100, g + 1))} />
            <Btn small title="+5 ▶" color={C.slate} onPress={() => setGuess((g) => Math.min(100, g + 5))} />
          </Row>
          <Btn title="Lock in & reveal" color={color} onPress={reveal} />
        </>
      ) : null}
      {phase === 'reveal' ? (
        <>
          <Card color={pts ? color : C.card2} style={{ alignItems: 'center' }}>
            <Txt v="label">Target {target} · guess {guess}</Txt>
            <Txt v="display">+{pts} points</Txt>
          </Card>
          <Btn title="Next round" icon={Shuffle} color={color} onPress={next} />
        </>
      ) : null}
      <Row>
        <Stat label="Rounds" value={stats.rounds} />
        <Stat label="Total pts" value={stats.points} color={color} />
      </Row>
    </Col>
  );
}

// ---------------------------------------------------------------- Random Victim Wheel
export function VictimWheel({ color }: ModuleProps) {
  const names = useNames();
  const [excluded, setExcluded] = usePersisted<string[]>('party:victim-out', []);
  const [hist, setHist] = usePersisted<{ n: string; ts: number }[]>('party:victim-hist', []);
  const [removeAfter, setRemoveAfter] = useState(false);
  const [res, setRes] = useState<string | null>(null);
  const poolKey = names.filter((n) => !excluded.includes(n)).join('|');
  const pool = useMemo(() => (poolKey ? poolKey.split('|').slice(0, 20) : []), [poolKey]);
  return (
    <Col>
      <Wheel
        items={pool.length ? pool : ['Add classmates']}
        onResult={(n) => {
          setRes(n);
          setHist((h) => [{ n, ts: Date.now() }, ...h].slice(0, 12));
          if (removeAfter) setExcluded((e) => [...e, n]);
        }}
        color={color}
        label="SPIN FOR A VICTIM"
      />
      {res ? (
        <Card color={C.coral} style={{ alignItems: 'center' }}>
          <Txt v="label">Today’s victim</Txt>
          <Art name="victim" size={64} />
          <Txt v="display">{res}</Txt>
        </Card>
      ) : null}
      <Row>
        <Chip label={removeAfter ? '✓ Remove after picked' : 'Keep everyone in'} active={removeAfter} color={color} onPress={() => setRemoveAfter((r) => !r)} />
        {excluded.length ? <Chip label={`Restore ${excluded.length}`} onPress={() => setExcluded([])} /> : null}
      </Row>
      <Txt v="small" color={C.muted}>
        Uses your Classmate Roster ({pool.length} in the pool). Edit names in the Roster tab.
      </Txt>
      {hist.length ? (
        <Section title="Past victims">
          {hist.map((h, i) => (
            <Row key={i} style={{ justifyContent: 'space-between' }}>
              <Txt v="h3">{h.n}</Txt>
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
