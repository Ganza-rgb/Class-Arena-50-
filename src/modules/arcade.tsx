import { Coins, Dices, RotateCcw } from 'lucide-react-native';
import { Fragment, useRef, useState, type ReactNode } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { useClearTimeouts, useCountdown, useRaf } from '../engines/hooks';
import { TapZone } from '../engines/TapZone';
import { usePersisted } from '../lib/store';
import { playSound, tap } from '../lib/sound';
import { chance, pick, randInt, shuffle } from '../lib/utils';
import { C, R } from '../theme';
import { Art, Bar, Btn, Card, Chip, Col, Row, Section, Segmented, Stat, Txt } from '../ui';
import type { ModuleProps } from './types';

const P1 = C.cobalt;
const P2 = C.coral;

function Flipped({ children, flip }: { children: ReactNode; flip?: boolean }) {
  return <View style={flip ? { transform: [{ rotate: '180deg' }] } : undefined}>{children}</View>;
}

// ---------------------------------------------------------------- Tug of War (fullscreen)
export function TugOfWar({ color }: ModuleProps) {
  const [pos, setPos] = useState(0); // +1 = blue (top) wins
  const [phase, setPhase] = useState<'ready' | 'count' | 'run' | 'over'>('ready');
  const [count, setCount] = useState(3);
  const [wins, setWins] = usePersisted('arc:tug', { blue: 0, coral: 0 });
  const { later } = useClearTimeouts();
  const LIMIT = 0.8;

  const start = () => {
    setPos(0);
    posRef.current = 0;
    setPhase('count');
    setCount(3);
    later(() => setCount(2), 700);
    later(() => setCount(1), 1400);
    later(() => {
      setPhase('run');
      playSound('whistle');
    }, 2100);
  };
  const posRef = useRef(0);
  const pull = (d: number) => {
    if (phase !== 'run' || Math.abs(posRef.current) >= LIMIT) return;
    const n = Math.max(-LIMIT, Math.min(LIMIT, posRef.current + d * 0.035));
    posRef.current = n;
    setPos(n);
    if (Math.abs(n) >= LIMIT) {
      setPhase('over');
      setWins((w) => (n > 0 ? { ...w, blue: w.blue + 1 } : { ...w, coral: w.coral + 1 }));
      playSound('goal');
    }
  };

  const winner = pos > 0 ? 'BLUE' : 'CORAL';
  return (
    <View style={{ flex: 1 }}>
      <TapZone onTap={() => pull(1)} style={{ flex: 1 + pos, backgroundColor: P1, alignItems: 'center', justifyContent: 'center' }}>
        <Flipped flip>
          <Txt v="display" center>
            {phase === 'run' ? 'TAP TAP TAP!' : phase === 'over' ? (pos > 0 ? 'YOU WIN' : 'YOU LOSE') : 'BLUE'}
          </Txt>
          <Txt v="label" center>
            Wins: {wins.blue}
          </Txt>
        </Flipped>
      </TapZone>
      <View style={{ height: 6, backgroundColor: C.text }} />
      <TapZone onTap={() => pull(-1)} style={{ flex: 1 - pos, backgroundColor: P2, alignItems: 'center', justifyContent: 'center' }}>
        <Txt v="display" center>
          {phase === 'run' ? 'TAP TAP TAP!' : phase === 'over' ? (pos < 0 ? 'YOU WIN' : 'YOU LOSE') : 'CORAL'}
        </Txt>
        <Txt v="label" center>
          Wins: {wins.coral}
        </Txt>
      </TapZone>
      {phase !== 'run' ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }} pointerEvents="box-none">
          <Card style={{ alignItems: 'center', gap: 10, minWidth: 220 }}>
            {phase === 'count' ? (
              <Txt v="big">{count}</Txt>
            ) : (
              <>
                {phase === 'over' ? <Txt v="h1">{winner} pulls it!</Txt> : <Txt v="h2">Each player taps their half</Txt>}
                <Btn title={phase === 'over' ? 'Rematch' : 'Start'} color={color} onPress={start} />
              </>
            )}
          </Card>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- Keeper Reflex Duel (fullscreen)
export function KeeperDuel({ color }: ModuleProps) {
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [ball, setBall] = useState<0 | 1 | null>(null); // 0 = screen left
  const [phase, setPhase] = useState<'ready' | 'wait' | 'shot' | 'point' | 'over'>('ready');
  const [msg, setMsg] = useState('First to 5 saves');
  const [wins, setWins] = usePersisted('arc:keeper', { blue: 0, coral: 0 });
  const { later, clearAll } = useClearTimeouts();
  const TARGET = 5;

  const serve = () => {
    setBall(null);
    setPhase('wait');
    setMsg('Wait for the shot…');
    later(() => {
      setBall(Math.random() < 0.5 ? 0 : 1);
      setPhase('shot');
      tap('heavy');
    }, randInt(1000, 3500));
  };
  const award = (pl: 0 | 1, text: string) => {
    clearAll();
    const n: [number, number] = pl === 0 ? [score[0] + 1, score[1]] : [score[0], score[1] + 1];
    setScore(n);
    setMsg(text);
    if (n[pl] >= TARGET) {
      setPhase('over');
      setWins((w) => (pl === 0 ? { ...w, blue: w.blue + 1 } : { ...w, coral: w.coral + 1 }));
      playSound('goal');
    } else {
      setPhase('point');
      playSound(text.includes('Early') ? 'boo' : 'whistle');
      later(serve, 1300);
    }
  };
  const dive = (pl: 0 | 1, side: 0 | 1) => {
    const other: 0 | 1 = pl === 0 ? 1 : 0;
    const who = pl === 0 ? 'Blue' : 'Coral';
    if (phase === 'wait') award(other, `Early dive by ${who}!`);
    else if (phase === 'shot') {
      if (side === ball) award(pl, `${who} saves it!`);
      else award(other, `${who} dived the wrong way!`);
    }
  };
  const reset = () => {
    setScore([0, 0]);
    setMsg('First to 5 saves');
    serve();
  };

  const half = (pl: 0 | 1) => (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {([0, 1] as const).map((side) => (
        <TapZone key={side} onTap={() => dive(pl, side)} style={{ flex: 1, backgroundColor: pl === 0 ? P1 : P2, borderWidth: 1, borderColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Flipped flip={pl === 0}>
            <Txt v="display">{side === 0 ? (pl === 0 ? '▶' : '◀') : pl === 0 ? '◀' : '▶'}</Txt>
          </Flipped>
        </TapZone>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {half(0)}
      <View style={{ height: 150, backgroundColor: C.bg, justifyContent: 'center', paddingHorizontal: 16, gap: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ width: 70, alignItems: 'center' }}>{ball === 0 ? <Art name="ball" size={58} /> : null}</View>
          <Col gap={2} style={{ alignItems: 'center', flex: 1 }}>
            <Txt v="display">
              <Txt v="display" color={P1}>
                {score[0]}
              </Txt>{' '}
              –{' '}
              <Txt v="display" color={P2}>
                {score[1]}
              </Txt>
            </Txt>
            <Txt v="small" color={C.textDim} center>
              {msg}
            </Txt>
            {phase === 'ready' || phase === 'over' ? <Btn small title={phase === 'over' ? 'Rematch' : 'Start'} color={color} onPress={reset} /> : null}
          </Col>
          <View style={{ width: 70, alignItems: 'center' }}>{ball === 1 ? <Art name="ball" size={58} /> : null}</View>
        </Row>
        <Txt v="label" color={C.muted} center>
          Series · Blue {wins.blue} – {wins.coral} Coral
        </Txt>
      </View>
      {half(1)}
    </View>
  );
}

// ---------------------------------------------------------------- Crossbar Challenge
export function Crossbar({ color }: ModuleProps) {
  const [pos, setPos] = useState(0);
  const dir = useRef(1);
  const [running, setRunning] = useState(false);
  const [shots, setShots] = useState<('bar' | 'near' | 'miss')[]>([]);
  const [msg, setMsg] = useState('Stop the power bar on the crossbar line.');
  const [best, setBest] = usePersisted('arc:crossbar', 0);
  const ZONE: [number, number] = [0.86, 0.91];
  const SHOTS = 10;
  const speed = 0.9 + shots.length * 0.12;
  const score = shots.reduce((s, x) => s + (x === 'bar' ? 3 : x === 'near' ? 1 : 0), 0);
  const done = shots.length >= SHOTS;

  useRaf((dt) => {
    setPos((p) => {
      let n = p + dir.current * speed * dt;
      if (n >= 1) {
        n = 1;
        dir.current = -1;
      } else if (n <= 0) {
        n = 0;
        dir.current = 1;
      }
      return n;
    });
  }, running && !done);

  const shoot = () => {
    if (done) return;
    if (!running) {
      setRunning(true);
      return;
    }
    const r: 'bar' | 'near' | 'miss' = pos >= ZONE[0] && pos <= ZONE[1] ? 'bar' : pos >= ZONE[0] - 0.06 && pos <= ZONE[1] + 0.06 ? 'near' : 'miss';
    const next = [...shots, r];
    setShots(next);
    setMsg(r === 'bar' ? 'DINK! CROSSBAR! +3' : r === 'near' ? 'So close! +1' : pos > ZONE[1] ? 'Over the bar into row Z.' : 'Into the keeper\'s hands.');
    playSound(r === 'bar' ? 'airhorn' : r === 'near' ? 'rimshot' : 'boo');
    if (next.length >= SHOTS) {
      const sc = next.reduce((s, x) => s + (x === 'bar' ? 3 : x === 'near' ? 1 : 0), 0);
      if (sc > best) setBest(sc);
      setRunning(false);
    }
  };

  return (
    <Col>
      <Row>
        <Stat label="Shot" value={`${Math.min(shots.length + 1, SHOTS)}/${SHOTS}`} />
        <Stat label="Score" value={score} color={color} />
        <Stat label="Best" value={best} color={C.amber} />
      </Row>
      <Row style={{ alignItems: 'stretch', height: 320 }} gap={16}>
        <View style={{ width: 70, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: `${ZONE[0] * 100}%`, height: `${(ZONE[1] - ZONE[0]) * 100}%`, backgroundColor: C.amber }} />
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: `${(ZONE[0] - 0.06) * 100}%`, height: `${(ZONE[1] - ZONE[0] + 0.12) * 100}%`, backgroundColor: 'rgba(214,161,61,0.2)' }} />
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${pos * 100}%`, backgroundColor: color, opacity: 0.55 }} />
          <View style={{ position: 'absolute', left: -2, right: -2, bottom: `${pos * 100}%`, height: 4, backgroundColor: C.text }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ height: 120, borderWidth: 6, borderBottomWidth: 0, borderColor: C.text, alignItems: 'center', justifyContent: 'center' }}>
            <Txt v="label" color={C.amber}>
              ▲ crossbar
            </Txt>
          </View>
          <Txt v="h2" center>
            {msg}
          </Txt>
          <Row wrap gap={4}>
            {shots.map((s, i) => (
              <View key={i} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: s === 'bar' ? C.amber : s === 'near' ? C.teal : C.border }} />
            ))}
          </Row>
        </View>
      </Row>
      {done ? (
        <Btn title={`Final: ${score} pts — play again`} icon={RotateCcw} color={color} onPress={() => { setShots([]); setPos(0); setMsg('Stop the power bar on the crossbar line.'); }} />
      ) : (
        <Btn title={running ? 'SHOOT!' : 'Start power bar'} color={running ? C.coral : color} onPress={shoot} />
      )}
    </Col>
  );
}

// ---------------------------------------------------------------- F1 Lights
export function F1Lights({ color }: ModuleProps) {
  const [lit, setLit] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'lights' | 'go' | 'result' | 'jump'>('idle');
  const [ms, setMs] = useState(0);
  const goAt = useRef(0);
  const [st, setSt] = usePersisted('arc:f1', { best: 0, recent: [] as number[] });
  const { later, clearAll } = useClearTimeouts();

  const start = () => {
    clearAll();
    setLit(0);
    setPhase('lights');
    for (let i = 1; i <= 5; i++) later(() => { setLit(i); tap(); }, i * 900);
    later(() => {
      setLit(0);
      goAt.current = Date.now();
      setPhase('go');
    }, 5 * 900 + randInt(300, 2800));
  };
  const press = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'jump') return start();
    if (phase === 'lights') {
      clearAll();
      setPhase('jump');
      playSound('boo');
      return;
    }
    const t = Date.now() - goAt.current;
    setMs(t);
    setPhase('result');
    const best = st.best === 0 ? t : Math.min(st.best, t);
    if (t < st.best || st.best === 0) playSound('airhorn');
    setSt({ best, recent: [t, ...st.recent].slice(0, 8) });
  };

  const verdict = ms < 200 ? 'Verstappen reflexes' : ms < 260 ? 'Podium finish' : ms < 350 ? 'Midfield' : 'Still in the garage';
  return (
    <Col>
      <TapZone onTap={press} style={{ backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 18, gap: 18, minHeight: 330, justifyContent: 'center' }}>
        <Row style={{ justifyContent: 'center' }} gap={8}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ width: 52, backgroundColor: C.ink, borderRadius: 10, padding: 6, gap: 6 }}>
              {[0, 1].map((k) => (
                <View key={k} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: lit >= i ? '#E2483D' : '#2A2E38' }} />
              ))}
            </View>
          ))}
        </Row>
        <Txt v="display" center color={phase === 'jump' ? C.coral : C.text}>
          {phase === 'idle' ? 'Tap to start' : phase === 'lights' ? 'Wait for lights out…' : phase === 'go' ? 'GO GO GO!' : phase === 'jump' ? 'JUMP START!' : `${ms} ms`}
        </Txt>
        {phase === 'result' ? (
          <Txt v="h2" center color={color}>
            {verdict}
          </Txt>
        ) : null}
        <Txt v="small" center color={C.muted}>
          {phase === 'result' || phase === 'jump' ? 'Tap to race again' : 'Tap this panel the instant the lights go out'}
        </Txt>
      </TapZone>
      <Row>
        <Stat label="Personal best" value={st.best ? `${st.best} ms` : '—'} color={C.amber} />
      </Row>
      {st.recent.length ? (
        <Section title="Recent starts">
          <Row wrap gap={6}>
            {st.recent.map((t, i) => (
              <Chip key={i} small label={`${t} ms`} />
            ))}
          </Row>
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Stroop
const INKS: { name: string; c: string }[] = [
  { name: 'BLUE', c: C.cobalt },
  { name: 'RED', c: '#E2483D' },
  { name: 'PURPLE', c: C.purple },
  { name: 'GREEN', c: '#4FAE6A' },
  { name: 'YELLOW', c: '#E5C04A' },
];

export function Stroop({ color }: ModuleProps) {
  const [q, setQ] = useState(() => ({ word: pick(INKS).name, ink: pick(INKS) }));
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'run' | 'over'>('ready');
  const [flash, setFlash] = useState<string | null>(null);
  const [best, setBest] = usePersisted('arc:stroop', 0);
  const scoreRef = useRef(0);
  const timer = useCountdown(() => {
    setPhase('over');
    if (scoreRef.current > best) {
      setBest(scoreRef.current);
      playSound('airhorn');
    } else playSound('whistle');
  });
  const nextQ = () => {
    const ink = pick(INKS);
    const word = chance(0.8) ? pick(INKS.filter((i) => i.name !== ink.name)).name : ink.name;
    setQ({ word, ink });
  };
  const answer = (name: string) => {
    if (phase !== 'run') return;
    const ok = name === q.ink.name;
    scoreRef.current = Math.max(0, scoreRef.current + (ok ? 1 : -1));
    setScore(scoreRef.current);
    setFlash(ok ? C.win : C.loss);
    tap(ok ? 'light' : 'error');
    setTimeout(() => setFlash(null), 140);
    nextQ();
  };
  return (
    <Col>
      <Row>
        <Stat label="Time" value={phase === 'run' ? Math.ceil(timer.left) : 30} />
        <Stat label="Score" value={score} color={color} />
        <Stat label="Best" value={best} color={C.amber} />
      </Row>
      <Card style={{ alignItems: 'center', justifyContent: 'center', minHeight: 170, borderColor: flash ?? C.border, borderWidth: 3 }}>
        {phase === 'run' ? (
          <Txt v="big" color={q.ink.c}>
            {q.word}
          </Txt>
        ) : (
          <Col gap={6} style={{ alignItems: 'center' }}>
            <Txt v="h1" center>
              {phase === 'over' ? `Time! ${score} points` : 'Tap the INK colour, not the word.'}
            </Txt>
            <Txt v="small" color={C.muted}>
              +1 right, −1 wrong. 30 seconds.
            </Txt>
          </Col>
        )}
      </Card>
      {phase === 'run' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {INKS.map((i) => (
            <Pressable key={i.name} onPress={() => answer(i.name)} style={({ pressed }) => ({ width: '48.5%', paddingVertical: 18, borderRadius: R.md, backgroundColor: pressed ? C.card2 : C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center' })}>
              <Txt v="h2">{i.name}</Txt>
            </Pressable>
          ))}
        </View>
      ) : (
        <Btn title={phase === 'over' ? 'Play again' : 'Start'} color={color} onPress={() => { scoreRef.current = 0; setScore(0); nextQ(); setPhase('run'); timer.start(30); }} />
      )}
    </Col>
  );
}

// ---------------------------------------------------------------- Flappy Football
type Post = { x: number; gap: number; passed: boolean };
type FlappyState = { y: number; vy: number; posts: Post[]; score: number; rot: number; dead: boolean };
const BALL_X = 80;
const BALL_R = 17;
const POST_W = 58;

const freshFlappy = (w: number, h: number): FlappyState => ({ y: h / 2, vy: 0, posts: [{ x: w + 60, gap: h / 2, passed: false }], score: 0, rot: 0, dead: false });

/** Pure physics step (randomness only for new post gaps). */
function stepFlappy(s: FlappyState, dt: number, w: number, h: number, gapH: number): FlappyState {
  const vy = s.vy + 1500 * dt;
  const y = s.y + vy * dt;
  const speed = 150 + Math.min(120, s.score * 6);
  let score = s.score;
  let posts = s.posts.map((p) => {
    const x = p.x - speed * dt;
    if (!p.passed && x + POST_W < BALL_X - BALL_R) {
      score += 1;
      return { ...p, x, passed: true };
    }
    return { ...p, x };
  });
  const last = posts[posts.length - 1];
  if (last && last.x < w - 210) {
    posts.push({ x: w + 20, gap: randInt(Math.round(gapH / 2 + 30), Math.round(h - gapH / 2 - 30)), passed: false });
  }
  posts = posts.filter((p) => p.x > -POST_W - 10);
  const hitPost = posts.some((p) => {
    const inX = BALL_X + BALL_R > p.x && BALL_X - BALL_R < p.x + POST_W;
    const inGap = y - BALL_R > p.gap - gapH / 2 && y + BALL_R < p.gap + gapH / 2;
    return inX && !inGap;
  });
  const dead = hitPost || y + BALL_R > h || y - BALL_R < 0;
  return { y, vy, posts, score, rot: s.rot + 360 * dt, dead };
}

export function FlappyFootball({ color }: ModuleProps) {
  const win = useWindowDimensions();
  // Estimate the pitch from the window until onLayout reports the real size.
  const [size, setSize] = useState(() => ({ w: Math.min(win.width, 560) - 32, h: Math.max(320, win.height - 260) }));
  const [started, setStarted] = useState(false);
  const [game, setGame] = useState<FlappyState>(() => freshFlappy(size.w, size.h));
  const [best, setBest] = usePersisted('arc:flappy', 0);
  const GAP = Math.max(150, size.h * 0.32);
  const running = started && !game.dead;

  useRaf((dt) => {
    const next = stepFlappy(game, dt, size.w, size.h, GAP);
    setGame(next);
    if (next.score > game.score) {
      tap();
      if (next.score % 5 === 0) playSound('goal');
    }
    if (next.dead) {
      playSound('boo');
      tap('error');
      if (next.score > best) setBest(next.score);
    }
  }, running);

  const flap = () => {
    if (game.dead) {
      setGame(freshFlappy(size.w, size.h));
      setStarted(false);
      return;
    }
    if (!started) setStarted(true);
    setGame((g) => ({ ...g, vy: -430 }));
  };

  const phase = game.dead ? 'over' : started ? 'run' : 'ready';
  return (
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      <Row>
        <Stat label="Goals" value={game.score} color={color} />
        <Stat label="Best" value={best} color={C.amber} />
      </Row>
      <Pressable onPressIn={flap} style={{ flex: 1 }}>
        <View
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setSize({ w: width, h: height });
            if (!started) setGame(freshFlappy(width, height));
          }}
          style={{ flex: 1, borderRadius: R.lg, backgroundColor: '#2F6B4F', overflow: 'hidden', borderWidth: 1, borderColor: C.border }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 12.5}%`, width: '6.25%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          ))}
          {game.posts.map((p, i) => (
            <Fragment key={i}>
              <View style={{ position: 'absolute', left: p.x, top: 0, width: POST_W, height: Math.max(0, p.gap - GAP / 2), backgroundColor: C.text, borderBottomWidth: 8, borderColor: C.coral }} />
              <View style={{ position: 'absolute', left: p.x, top: p.gap + GAP / 2, width: POST_W, bottom: 0, backgroundColor: C.text, borderTopWidth: 8, borderColor: C.coral }} />
            </Fragment>
          ))}
          <View style={{ position: 'absolute', left: BALL_X - BALL_R, top: game.y - BALL_R, width: BALL_R * 2, height: BALL_R * 2, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: `${game.rot % 360}deg` }] }}>
            <Art name="ball" size={BALL_R * 2 + 4} />
          </View>
          {phase !== 'run' ? (
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Card style={{ alignItems: 'center', gap: 4 }}>
                <Txt v="h1">{phase === 'over' ? `Full time: ${game.score}` : 'Flappy Football'}</Txt>
                <Txt v="small" color={C.textDim}>
                  {phase === 'over' ? 'Tap to reset' : 'Tap to kick the ball up. Dodge the posts.'}
                </Txt>
              </Card>
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------- Simon
const PADS = [C.cobalt, C.coral, C.teal, C.amber];

export function Simon({ color }: ModuleProps) {
  const [seq, setSeq] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<'ready' | 'show' | 'input' | 'over'>('ready');
  const [best, setBest] = usePersisted('arc:simon', 0);
  const { later, clearAll } = useClearTimeouts();

  const play = (s: number[]) => {
    setPhase('show');
    const gap = Math.max(260, 600 - s.length * 25);
    s.forEach((p, i) => {
      later(() => { setActive(p); tap(); }, 500 + i * gap);
      later(() => setActive(null), 500 + i * gap + gap * 0.6);
    });
    later(() => {
      setPhase('input');
      setStep(0);
    }, 500 + s.length * gap);
  };
  const start = () => {
    clearAll();
    const s = [randInt(0, 3)];
    setSeq(s);
    play(s);
  };
  const press = (p: number) => {
    if (phase !== 'input') return;
    setActive(p);
    later(() => setActive(null), 150);
    if (seq[step] !== p) {
      setPhase('over');
      playSound('trombone');
      if (seq.length - 1 > best) setBest(seq.length - 1);
      return;
    }
    tap();
    if (step + 1 === seq.length) {
      const s = [...seq, randInt(0, 3)];
      setSeq(s);
      if (s.length % 5 === 1) playSound('rimshot');
      play(s);
    } else setStep(step + 1);
  };

  return (
    <Col>
      <Row>
        <Stat label="Level" value={Math.max(0, seq.length - (phase === 'over' ? 1 : 0))} color={color} />
        <Stat label="Best" value={best} color={C.amber} />
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {PADS.map((c, i) => (
          <Pressable
            key={i}
            onPress={() => press(i)}
            style={{ width: '48.5%', aspectRatio: 1, borderRadius: R.xl, backgroundColor: c, opacity: active === i ? 1 : 0.35, borderWidth: active === i ? 4 : 0, borderColor: C.text }}
          />
        ))}
      </View>
      <Txt v="h2" center>
        {phase === 'ready' ? 'Watch the pattern, then repeat it.' : phase === 'show' ? 'Watch…' : phase === 'input' ? `Your turn (${step}/${seq.length})` : `Game over — you reached level ${seq.length - 1}`}
      </Txt>
      {phase === 'ready' || phase === 'over' ? <Btn title={phase === 'over' ? 'Try again' : 'Start'} color={color} onPress={start} /> : null}
    </Col>
  );
}

// ---------------------------------------------------------------- 10-Second Tap Battle (fullscreen)
export function TapBattle({ color }: ModuleProps) {
  const [c, setC] = useState<[number, number]>([0, 0]);
  const [phase, setPhase] = useState<'ready' | 'count' | 'run' | 'over'>('ready');
  const [count, setCount] = useState(3);
  const [rec, setRec] = usePersisted('arc:tapbattle', { record: 0, blue: 0, coral: 0 });
  const { later } = useClearTimeouts();
  const live = useRef<[number, number]>([0, 0]);
  const timer = useCountdown(() => {
    setPhase('over');
    const [a, b] = live.current;
    setRec((r) => ({ record: Math.max(r.record, a, b), blue: r.blue + (a > b ? 1 : 0), coral: r.coral + (b > a ? 1 : 0) }));
    playSound('airhorn');
  });

  const start = () => {
    live.current = [0, 0];
    setC([0, 0]);
    setPhase('count');
    setCount(3);
    later(() => setCount(2), 700);
    later(() => setCount(1), 1400);
    later(() => {
      setPhase('run');
      timer.start(10);
    }, 2100);
  };
  const hit = (p: 0 | 1) => {
    if (phase !== 'run') return;
    live.current = p === 0 ? [live.current[0] + 1, live.current[1]] : [live.current[0], live.current[1] + 1];
    setC(live.current);
  };
  const winner = c[0] === c[1] ? 'DRAW' : c[0] > c[1] ? 'BLUE WINS' : 'CORAL WINS';
  return (
    <View style={{ flex: 1 }}>
      <TapZone onTap={() => hit(0)} style={{ flex: 1, backgroundColor: P1, alignItems: 'center', justifyContent: 'center' }}>
        <Flipped flip>
          <Txt v="big" center>
            {c[0]}
          </Txt>
          <Txt v="label" center>
            Blue · wins {rec.blue}
          </Txt>
        </Flipped>
      </TapZone>
      <View style={{ height: 64, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        {phase === 'run' ? <Txt v="display">{timer.left.toFixed(1)}s</Txt> : <Txt v="label" color={C.muted}>Record: {rec.record} taps</Txt>}
      </View>
      <TapZone onTap={() => hit(1)} style={{ flex: 1, backgroundColor: P2, alignItems: 'center', justifyContent: 'center' }}>
        <Txt v="big" center>
          {c[1]}
        </Txt>
        <Txt v="label" center>
          Coral · wins {rec.coral}
        </Txt>
      </TapZone>
      {phase !== 'run' ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }} pointerEvents="box-none">
          <Card style={{ alignItems: 'center', gap: 10, minWidth: 220 }}>
            {phase === 'count' ? (
              <Txt v="big">{count}</Txt>
            ) : (
              <>
                <Txt v="h1">{phase === 'over' ? winner : '10 seconds. Tap your half.'}</Txt>
                <Btn title={phase === 'over' ? 'Rematch' : 'Start'} color={color} onPress={start} />
              </>
            )}
          </Card>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- Rock Paper Scissors
const RPS = [
  { k: 'rock', art: 'rps-rock', beats: 'scissors' },
  { k: 'paper', art: 'rps-paper', beats: 'rock' },
  { k: 'scissors', art: 'rps-scissors', beats: 'paper' },
] as const;
type RpsK = (typeof RPS)[number]['k'];

export function RockPaperScissors({ color }: ModuleProps) {
  const [me, setMe] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [last, setLast] = useState<{ m: RpsK; c: RpsK; r: 'win' | 'loss' | 'draw' } | null>(null);
  const [rec, setRec] = usePersisted('arc:rps', { w: 0, l: 0 });
  const over = me >= 3 || cpu >= 3;
  const throwIt = (m: RpsK) => {
    if (over) return;
    const c = pick(RPS).k;
    const mm = RPS.find((x) => x.k === m);
    const r: 'win' | 'loss' | 'draw' = m === c ? 'draw' : mm?.beats === c ? 'win' : 'loss';
    setLast({ m, c, r });
    const nm = me + (r === 'win' ? 1 : 0);
    const nc = cpu + (r === 'loss' ? 1 : 0);
    setMe(nm);
    setCpu(nc);
    if (nm >= 3 || nc >= 3) {
      setRec({ w: rec.w + (nm >= 3 ? 1 : 0), l: rec.l + (nc >= 3 ? 1 : 0) });
      playSound(nm >= 3 ? 'goal' : 'trombone');
    } else tap(r === 'win' ? 'success' : r === 'loss' ? 'error' : 'light');
  };
  const art = (k: RpsK) => RPS.find((x) => x.k === k)?.art ?? 'rps-rock';
  return (
    <Col>
      <Txt v="label" color={C.muted} center>
        Best of 5 · first to 3
      </Txt>
      <Row style={{ justifyContent: 'space-around' }}>
        <Col gap={2} style={{ alignItems: 'center' }}>
          <Txt v="label" color={C.muted}>
            You
          </Txt>
          <Txt v="big" color={color}>
            {me}
          </Txt>
        </Col>
        <Col gap={2} style={{ alignItems: 'center' }}>
          <Txt v="label" color={C.muted}>
            CPU
          </Txt>
          <Txt v="big" color={C.coral}>
            {cpu}
          </Txt>
        </Col>
      </Row>
      <Card style={{ alignItems: 'center', gap: 6 }}>
        {last ? (
          <>
            <Row gap={14}>
              <Art name={art(last.m)} size={72} />
              <Txt v="h1" color={C.muted}>
                vs
              </Txt>
              <Art name={art(last.c)} size={72} style={{ transform: [{ scaleX: -1 }] }} />
            </Row>
            <Txt v="h2" color={last.r === 'win' ? C.win : last.r === 'loss' ? C.loss : C.textDim}>
              {over ? (me >= 3 ? 'YOU WIN THE SERIES' : 'CPU TAKES THE SERIES') : last.r === 'win' ? 'Point to you' : last.r === 'loss' ? 'Point to CPU' : 'Draw — go again'}
            </Txt>
          </>
        ) : (
          <Txt v="h2">Pick your weapon</Txt>
        )}
      </Card>
      {!over ? (
        <Row>
          {RPS.map((r) => (
            <Pressable key={r.k} onPress={() => throwIt(r.k)} style={({ pressed }) => ({ flex: 1, aspectRatio: 1, borderRadius: R.lg, backgroundColor: pressed ? color : C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' })}>
              <Art name={r.art} size={64} />
            </Pressable>
          ))}
        </Row>
      ) : (
        <Btn title="New series" icon={RotateCcw} color={color} onPress={() => { setMe(0); setCpu(0); setLast(null); }} />
      )}
      <Row>
        <Stat label="Series won" value={rec.w} color={C.win} />
        <Stat label="Series lost" value={rec.l} color={C.loss} />
      </Row>
    </Col>
  );
}

// ---------------------------------------------------------------- Higher or Lower
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];
type CardT = { v: number; s: string };
const newDeck = (): CardT[] => shuffle(SUITS.flatMap((s) => RANKS.map((_, v) => ({ v, s }))));

function PlayingCard({ c }: { c: CardT }) {
  const red = c.s === '♥' || c.s === '♦';
  return (
    <View style={{ width: 130, height: 180, borderRadius: R.lg, backgroundColor: C.text, padding: 10, justifyContent: 'space-between' }}>
      <Txt v="h1" color={red ? '#C8413A' : C.ink}>
        {RANKS[c.v]}
        {c.s}
      </Txt>
      <Txt v="big" center color={red ? '#C8413A' : C.ink}>
        {c.s}
      </Txt>
      <Txt v="h1" color={red ? '#C8413A' : C.ink} style={{ alignSelf: 'flex-end', transform: [{ rotate: '180deg' }] }}>
        {RANKS[c.v]}
        {c.s}
      </Txt>
    </View>
  );
}

export function HigherLower({ color }: ModuleProps) {
  const [deck, setDeck] = useState<CardT[]>(newDeck);
  const [streak, setStreak] = useState(0);
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState('Will the next card be higher or lower?');
  const [best, setBest] = usePersisted('arc:hilo', 0);
  const cur = deck[0];
  const guess = (higher: boolean) => {
    const next = deck[1];
    if (!cur || !next || over) return;
    const rest = deck.slice(1);
    const nd = rest.length < 2 ? [...rest, ...newDeck()] : rest;
    if (next.v === cur.v) {
      setMsg('Same value — push. Streak safe.');
      setDeck(nd);
      return;
    }
    const ok = higher ? next.v > cur.v : next.v < cur.v;
    setDeck(nd);
    if (ok) {
      setStreak(streak + 1);
      setMsg('Correct! Keep going.');
      tap('success');
      if ((streak + 1) % 5 === 0) playSound('airhorn');
    } else {
      setOver(true);
      setMsg(`Wrong! It was ${RANKS[next.v]}${next.s}.`);
      playSound('trombone');
      if (streak > best) setBest(streak);
    }
  };
  return (
    <Col>
      <Row>
        <Stat label="Streak" value={streak} color={color} />
        <Stat label="Best" value={best} color={C.amber} />
      </Row>
      <View style={{ alignItems: 'center', paddingVertical: 8 }}>{cur ? <PlayingCard c={cur} /> : null}</View>
      <Txt v="h2" center>
        {msg}
      </Txt>
      {over ? (
        <Btn title="New run" icon={RotateCcw} color={color} onPress={() => { setDeck(newDeck()); setStreak(0); setOver(false); setMsg('Will the next card be higher or lower?'); }} />
      ) : (
        <Row>
          <Btn flex title="▲ Higher" color={color} onPress={() => guess(true)} />
          <Btn flex title="▼ Lower" color={C.coral} onPress={() => guess(false)} />
        </Row>
      )}
      <Txt v="small" color={C.muted} center>
        Aces are low. Equal cards are a push.
      </Txt>
    </Col>
  );
}

// ---------------------------------------------------------------- Quick Math Sprint
function makeMath(level: number) {
  const hard = level > 8;
  const op = pick(hard ? ['+', '−', '×', '×'] : ['+', '−', '×']);
  let a = randInt(2, hard ? 25 : 12);
  let b = randInt(2, hard ? 15 : 12);
  if (op === '−' && b > a) [a, b] = [b, a];
  const ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
  const opts = new Set<number>([ans]);
  while (opts.size < 4) opts.add(ans + pick([-10, -2, -1, 1, 2, 3, 10, 5, -5]));
  return { text: `${a} ${op} ${b}`, ans, opts: shuffle([...opts]) };
}

export function MathSprint({ color }: ModuleProps) {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [q, setQ] = useState(() => makeMath(0));
  const [phase, setPhase] = useState<'ready' | 'run' | 'over'>('ready');
  const [best, setBest] = usePersisted('arc:math', 0);
  const timer = useCountdown(() => {
    setPhase('over');
    if (scoreRef.current > best) {
      setBest(scoreRef.current);
      playSound('airhorn');
    } else playSound('whistle');
  });
  const answer = (n: number) => {
    if (phase !== 'run') return;
    if (n === q.ans) {
      scoreRef.current += 1;
      tap('success');
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 1);
      tap('error');
    }
    setScore(scoreRef.current);
    setQ(makeMath(scoreRef.current));
  };
  return (
    <Col>
      <Row>
        <Stat label="Time" value={phase === 'run' ? Math.ceil(timer.left) : 30} />
        <Stat label="Score" value={score} color={color} />
        <Stat label="Best" value={best} color={C.amber} />
      </Row>
      {phase === 'run' ? <Bar pct={timer.pct} color={color} /> : null}
      <Card style={{ alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
        <Txt v="big">{phase === 'run' ? q.text : phase === 'over' ? `${score} pts` : '30s'}</Txt>
        {phase !== 'run' ? <Txt v="small" color={C.muted}>{phase === 'over' ? 'Time\'s up!' : '+1 right, −1 wrong. Go fast.'}</Txt> : null}
      </Card>
      {phase === 'run' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {q.opts.map((o) => (
            <Pressable key={o} onPress={() => answer(o)} style={({ pressed }) => ({ width: '48.5%', paddingVertical: 20, borderRadius: R.md, backgroundColor: pressed ? color : C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center' })}>
              <Txt v="display">{o}</Txt>
            </Pressable>
          ))}
        </View>
      ) : (
        <Btn title={phase === 'over' ? 'Again' : 'Start sprint'} color={color} onPress={() => { scoreRef.current = 0; setScore(0); setQ(makeMath(0)); setPhase('run'); timer.start(30); }} />
      )}
    </Col>
  );
}

// ---------------------------------------------------------------- Dice & Coin
const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function DiceCoin({ color }: ModuleProps) {
  const [mode, setMode] = useState<'dice' | 'coin'>('dice');
  const [n, setN] = useState(2);
  const [vals, setVals] = useState<number[]>([1, 1]);
  const [coin, setCoin] = useState<'HEADS' | 'TAILS' | null>(null);
  const [rolling, setRolling] = useState(false);
  const [hist, setHist] = usePersisted<string[]>('arc:fate', []);
  const [coinStats, setCoinStats] = usePersisted('arc:coin', { h: 0, t: 0 });
  const { later } = useClearTimeouts();

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    tap('heavy');
    for (let i = 0; i < 8; i++) {
      later(() => {
        if (mode === 'dice') setVals(Array.from({ length: n }, () => randInt(1, 6)));
        else setCoin(i % 2 ? 'HEADS' : 'TAILS');
      }, i * 70);
    }
    later(() => {
      if (mode === 'dice') {
        const v = Array.from({ length: n }, () => randInt(1, 6));
        setVals(v);
        const sum = v.reduce((a, b) => a + b, 0);
        setHist((h) => [`Dice: ${v.join(' + ')} = ${sum}`, ...h].slice(0, 12));
        if (v.length > 1 && v.every((x) => x === v[0])) playSound('airhorn');
      } else {
        const c = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
        setCoin(c);
        setCoinStats((s) => (c === 'HEADS' ? { ...s, h: s.h + 1 } : { ...s, t: s.t + 1 }));
        setHist((h) => [`Coin: ${c}`, ...h].slice(0, 12));
        playSound('rimshot');
      }
      setRolling(false);
    }, 620);
  };

  return (
    <Col>
      <Segmented options={[{ value: 'dice', label: 'Dice' }, { value: 'coin', label: 'Coin' }]} value={mode} onChange={setMode} color={color} />
      {mode === 'dice' ? (
        <>
          <Row style={{ justifyContent: 'center' }}>
            {[1, 2, 3].map((k) => (
              <Chip key={k} label={`${k} dice`} active={n === k} color={color} onPress={() => { setN(k); setVals(Array.from({ length: k }, () => 1)); }} />
            ))}
          </Row>
          <Card style={{ alignItems: 'center', paddingVertical: 24, gap: 4 }}>
            <Row style={{ justifyContent: 'center' }} gap={12}>
              {vals.map((v, i) => (
                <Txt key={i} v="big" style={{ fontSize: 76, lineHeight: 84 }}>
                  {FACES[v - 1]}
                </Txt>
              ))}
            </Row>
            <Txt v="h1">Total {vals.reduce((a, b) => a + b, 0)}</Txt>
          </Card>
        </>
      ) : (
        <Card style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
          <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: coin === 'TAILS' ? C.slate : C.amber, alignItems: 'center', justifyContent: 'center' }}>
            <Txt v="h1">{coin ?? '?'}</Txt>
          </View>
          <Txt v="small" color={C.muted}>
            Heads {coinStats.h} · Tails {coinStats.t}
          </Txt>
        </Card>
      )}
      <Btn title={rolling ? '…' : mode === 'dice' ? 'Roll' : 'Flip'} icon={mode === 'dice' ? Dices : Coins} color={color} onPress={roll} disabled={rolling} />
      {hist.length ? (
        <Section title="Fate log" right={<Btn small variant="ghost" title="Clear" color={C.muted} onPress={() => setHist([])} />}>
          {hist.map((h, i) => (
            <Row key={i}>
              <Art name={h.startsWith('Coin') ? 'medal1' : 'dice'} size={22} />
              <Txt v="body" color={C.textDim}>
                {h.replace(/^(Dice|Coin): /, '')}
              </Txt>
            </Row>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}
