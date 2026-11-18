import { ArrowRight, Award, Flame, Heart, Plus, RotateCcw, Share2, Shuffle, Sparkles, Trash } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AWARDS, CAREERS, COMMENTARY, DELUSION_QS, EXCUSE_PARTS, FOOTBALLERS, RANK_THEMES, ROAST_BITS, TRANSFERS } from '../data/content';
import { SEED_TAKES, type HotTake } from '../data/seed';
import { useNames } from '../engines/hooks';
import { QuizRunner } from '../engines/Quiz';
import { usePersisted } from '../lib/store';
import { playSound, tap } from '../lib/sound';
import { hashStr, pick, pickSeeded, sample, seeded, shuffle, timeAgo, todayStr, uid } from '../lib/utils';
import { C, F, R } from '../theme';
import { Art, Bar, Btn, Card, Chip, Col, Divider, Empty, Field, IconBtn, Row, Section, Sheet, Stat, Stepper, Tag, Txt, shareText } from '../ui';
import type { ModuleProps } from './types';

// ---------------------------------------------------------------- Career Path
export function CareerPath({ color }: ModuleProps) {
  return (
    <QuizRunner
      storageKey="tr:career"
      color={color}
      intro="Name the footballer from their club career path (major clubs, in order)."
      make={() =>
        sample(CAREERS, 8).map((c) => {
          const opts = shuffle([c.name, ...sample(CAREERS.filter((x) => x.name !== c.name), 3).map((x) => x.name)]);
          return { prompt: c.path.join(' → '), options: opts, answer: opts.indexOf(c.name) };
        })
      }
      renderPrompt={(q) => (
        <Card style={{ gap: 10 }}>
          <Txt v="label" color={C.muted}>
            Career path
          </Txt>
          <Row wrap gap={6}>
            {q.prompt.split(' → ').map((club, i, arr) => (
              <Row key={`${club}-${i}`} gap={6}>
                <Tag label={club.toUpperCase()} color={color} />
                {i < arr.length - 1 ? <ArrowRight size={14} color={C.muted} /> : null}
              </Row>
            ))}
          </Row>
        </Card>
      )}
    />
  );
}

// ---------------------------------------------------------------- Transfer Fee Higher or Lower
function TCard({ t, show, c }: { t: (typeof TRANSFERS)[number]; show: boolean; c: string }) {
  return (
    <Card color={c} style={{ gap: 4 }}>
      <Txt v="h1">{t.player}</Txt>
      <Txt v="small">{t.move}</Txt>
      <Txt v="display">{show ? `€${t.fee}m` : '€ ???'}</Txt>
    </Card>
  );
}

export function TransferHL({ color }: ModuleProps) {
  const [order, setOrder] = useState(() => shuffle(TRANSFERS));
  const [i, setI] = useState(0);
  const [streak, setStreak] = useState(0);
  const [reveal, setReveal] = useState<null | boolean>(null);
  const [best, setBest] = usePersisted('tr:fees', 0);
  const a = order[i];
  const b = order[i + 1];

  const guess = (higher: boolean) => {
    if (!a || !b || reveal !== null) return;
    const ok = b.fee === a.fee || (higher ? b.fee > a.fee : b.fee < a.fee);
    setReveal(ok);
    if (ok) {
      setStreak(streak + 1);
      tap('success');
    } else {
      playSound('trombone');
      if (streak > best) setBest(streak);
    }
  };
  const next = () => {
    if (reveal === false) {
      setOrder(shuffle(TRANSFERS));
      setI(0);
      setStreak(0);
    } else if (i + 2 >= order.length) {
      setOrder(shuffle(TRANSFERS));
      setI(0);
    } else setI(i + 1);
    setReveal(null);
  };

  return (
    <Col>
      <Row>
        <Stat label="Streak" value={streak} color={color} />
        <Stat label="Best" value={best} color={C.amber} />
      </Row>
      {a ? <TCard t={a} show c={C.cobalt} /> : null}
      <Txt v="h2" center>
        Was this fee higher or lower?
      </Txt>
      {b ? <TCard t={b} show={reveal !== null} c={reveal === null ? C.card2 : reveal ? C.win : C.loss} /> : null}
      {reveal === null ? (
        <Row>
          <Btn flex title="▲ Higher" color={color} onPress={() => guess(true)} />
          <Btn flex title="▼ Lower" color={C.coral} onPress={() => guess(false)} />
        </Row>
      ) : (
        <Btn title={reveal ? 'Next transfer' : 'Restart'} icon={reveal ? ArrowRight : RotateCcw} color={color} onPress={next} />
      )}
      <Txt v="small" color={C.muted}>
        Approximate reported base fees in € millions; add-ons excluded.
      </Txt>
    </Col>
  );
}

// ---------------------------------------------------------------- Start / Bench / Sell
type SBS = 'start' | 'bench' | 'sell';
export function StartBenchSell({ color }: ModuleProps) {
  const [trio, setTrio] = useState(() => sample(FOOTBALLERS, 3));
  const [pick3, setPick3] = useState<Record<string, SBS>>({});
  const [tally, setTally] = usePersisted<Record<string, Record<SBS, number>>>('tr:sbs', {});
  const [locked, setLocked] = useState(false);
  const opts: { k: SBS; label: string; c: string }[] = [
    { k: 'start', label: 'START', c: C.win },
    { k: 'bench', label: 'BENCH', c: C.amber },
    { k: 'sell', label: 'SELL', c: C.coral },
  ];
  const assign = (p: string, k: SBS) => {
    if (locked) return;
    const n: Record<string, SBS> = {};
    for (const [pl, v] of Object.entries(pick3)) if (v !== k && pl !== p) n[pl] = v;
    n[p] = k;
    setPick3(n);
    tap();
  };
  const lock = () => {
    setLocked(true);
    setTally((t) => {
      const n = { ...t };
      for (const [p, k] of Object.entries(pick3)) {
        const cur = n[p] ?? { start: 0, bench: 0, sell: 0 };
        n[p] = { ...cur, [k]: cur[k] + 1 };
      }
      return n;
    });
    playSound('rimshot');
  };
  return (
    <Col>
      <Txt v="small" color={C.muted}>
        One START, one BENCH, one SELL. No fence-sitting.
      </Txt>
      {trio.map((p) => {
        const t = tally[p];
        const tot = t ? t.start + t.bench + t.sell : 0;
        return (
          <Card key={p} style={{ gap: 10 }}>
            <Txt v="h1">{p}</Txt>
            <Row>
              {opts.map((o) => (
                <Btn key={o.k} flex small title={o.label} color={o.c} variant={pick3[p] === o.k ? 'solid' : 'outline'} onPress={() => assign(p, o.k)} />
              ))}
            </Row>
            {locked && t && tot ? (
              <Txt v="small" color={C.textDim}>
                Class says: start {Math.round((t.start / tot) * 100)}% · bench {Math.round((t.bench / tot) * 100)}% · sell {Math.round((t.sell / tot) * 100)}%
              </Txt>
            ) : null}
          </Card>
        );
      })}
      {!locked ? (
        <Btn title="Lock it in" color={color} disabled={Object.keys(pick3).length !== 3} onPress={lock} />
      ) : (
        <Row>
          <Btn flex title="New trio" icon={Shuffle} color={color} onPress={() => { setTrio(sample(FOOTBALLERS, 3)); setPick3({}); setLocked(false); }} />
          <Btn flex variant="outline" title="Share" icon={Share2} color={color} onPress={() => shareText(`Start / Bench / Sell:\n${trio.map((p) => `${p}: ${(pick3[p] ?? '').toUpperCase()}`).join('\n')}`)} />
        </Row>
      )}
    </Col>
  );
}

// ---------------------------------------------------------------- Blind Rank
export function BlindRank({ color }: ModuleProps) {
  const [theme, setTheme] = useState(RANK_THEMES[0]!);
  const [queue, setQueue] = useState<string[]>(() => sample(theme.pool, 5));
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [history, setHistory] = usePersisted<{ theme: string; order: string[]; ts: number }[]>('tr:blindrank', []);
  const placed = slots.filter(Boolean).length;
  const current = queue[placed];
  const done = placed === 5;

  const reset = (t = theme) => {
    setTheme(t);
    setQueue(sample(t.pool, 5));
    setSlots([null, null, null, null, null]);
  };
  const place = (i: number) => {
    if (!current || slots[i]) return;
    const n = slots.map((s, k) => (k === i ? current : s));
    setSlots(n);
    tap();
    if (n.every(Boolean)) {
      setHistory((h) => [{ theme: theme.title, order: n as string[], ts: Date.now() }, ...h].slice(0, 10));
      playSound('rimshot');
    }
  };

  return (
    <Col>
      <Row wrap gap={6}>
        {RANK_THEMES.map((t) => (
          <Chip key={t.title} small label={t.title} active={t.title === theme.title} color={color} onPress={() => reset(t)} />
        ))}
      </Row>
      <Card color={done ? C.card2 : color} style={{ alignItems: 'center', gap: 4 }}>
        <Txt v="label">{done ? 'Ranking locked' : `Player ${placed + 1} of 5 — place them now`}</Txt>
        <Txt v="display">{done ? theme.title : current}</Txt>
        {!done ? <Txt v="small">You can’t see who’s next. No take-backs.</Txt> : null}
      </Card>
      {slots.map((s, i) => (
        <Pressable
          key={i}
          onPress={() => place(i)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.md, borderWidth: 1, borderColor: s ? color : C.border, backgroundColor: s ? C.card : C.bg, borderStyle: s ? 'solid' : 'dashed' }}
        >
          <Txt v="h1" color={color}>
            {i + 1}
          </Txt>
          <Txt v="h2" color={s ? C.text : C.muted}>
            {s ?? (current ? 'Tap to place here' : '—')}
          </Txt>
        </Pressable>
      ))}
      {done ? (
        <Row>
          <Btn flex title="Rank again" icon={RotateCcw} color={color} onPress={() => reset()} />
          <Btn flex variant="outline" title="Share" icon={Share2} color={color} onPress={() => shareText(`Blind Rank — ${theme.title}\n${slots.map((s, i) => `${i + 1}. ${s}`).join('\n')}`)} />
        </Row>
      ) : null}
      {history.length ? (
        <Section title="Past rankings">
          {history.map((h, i) => (
            <Txt key={i} v="small" color={C.textDim}>
              {h.theme}: {h.order.join(' › ')}
            </Txt>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Weekend Scoreline Predictor
type Fixture = { id: string; home: string; away: string; result: [number, number] | null; preds: Record<string, [number, number]> };
const SEED_FIXTURES: Fixture[] = [
  { id: 'fx1', home: 'Arsenal', away: 'Chelsea', result: null, preds: { Kevin: [3, 0], Patrick: [1, 2], Diane: [1, 1] } },
  { id: 'fx2', home: 'Real Madrid', away: 'Barcelona', result: null, preds: { Cedric: [2, 1], Yves: [1, 3] } },
  { id: 'fx3', home: 'Liverpool', away: 'Man United', result: [2, 0], preds: { Moses: [2, 0], JP: [1, 1], Samuel: [0, 1] } },
];
const outcome = (s: [number, number]) => Math.sign(s[0] - s[1]);
const predPts = (p: [number, number], r: [number, number]) => (p[0] === r[0] && p[1] === r[1] ? 3 : outcome(p) === outcome(r) ? 1 : 0);

export function ScorelinePredictor({ color }: ModuleProps) {
  const names = useNames();
  const [fx, setFx] = usePersisted<Fixture[]>('tr:predictor', SEED_FIXTURES);
  const [adding, setAdding] = useState(false);
  const [h, setH] = useState('');
  const [a, setA] = useState('');
  const [predFor, setPredFor] = useState<Fixture | null>(null);
  const [who, setWho] = useState<string | null>(null);
  const [ps, setPs] = useState<[number, number]>([1, 1]);
  const [resFor, setResFor] = useState<Fixture | null>(null);

  const board: Record<string, number> = {};
  for (const f of fx) {
    if (!f.result) continue;
    for (const [n, p] of Object.entries(f.preds)) board[n] = (board[n] ?? 0) + predPts(p, f.result);
  }

  return (
    <Col>
      <Section title="Prediction league">
        {Object.keys(board).length === 0 ? <Empty text="Enter a final score to award points." /> : null}
        {Object.entries(board)
          .sort((x, y) => y[1] - x[1])
          .map(([n, p], i) => (
            <Row key={n} style={{ justifyContent: 'space-between' }}>
              <Txt v="h3" color={i === 0 ? color : C.text}>
                {i + 1}. {n}
              </Txt>
              <Txt v="h3">{p} pts</Txt>
            </Row>
          ))}
        <Txt v="small" color={C.muted}>
          Exact score = 3 pts · correct result = 1 pt
        </Txt>
      </Section>
      <Btn title="Add fixture" icon={Plus} color={color} variant="outline" onPress={() => setAdding(true)} />
      {fx.map((f) => (
        <Card key={f.id} style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="h2">
              {f.home} vs {f.away}
            </Txt>
            {f.result ? <Tag label={`FT ${f.result[0]}–${f.result[1]}`} color={color} /> : <Tag label="UPCOMING" color={C.card2} />}
          </Row>
          {Object.entries(f.preds).map(([n, p]) => (
            <Row key={n} style={{ justifyContent: 'space-between' }}>
              <Txt v="body">{n}</Txt>
              <Txt v="h3" color={f.result ? (predPts(p, f.result) === 3 ? C.win : predPts(p, f.result) === 1 ? C.amber : C.muted) : C.text}>
                {p[0]}–{p[1]}
                {f.result ? `  +${predPts(p, f.result)}` : ''}
              </Txt>
            </Row>
          ))}
          <Row>
            {!f.result ? <Btn flex small title="Predict" color={color} onPress={() => { setPredFor(f); setWho(null); setPs([1, 1]); }} /> : null}
            <Btn flex small variant="outline" title={f.result ? 'Edit score' : 'Enter result'} color={color} onPress={() => { setResFor(f); setPs(f.result ?? [0, 0]); }} />
            <IconBtn icon={Trash} size={34} color={C.muted} onPress={() => setFx((p) => p.filter((x) => x.id !== f.id))} label="Delete fixture" />
          </Row>
        </Card>
      ))}
      <Sheet visible={adding} onClose={() => setAdding(false)} title="New fixture">
        <Field label="Home" value={h} onChangeText={setH} placeholder="Arsenal" maxLength={24} />
        <Field label="Away" value={a} onChangeText={setA} placeholder="Tottenham" maxLength={24} />
        <Btn
          title="Add"
          color={color}
          disabled={!h.trim() || !a.trim()}
          onPress={() => {
            setFx((p) => [{ id: uid(), home: h.trim(), away: a.trim(), result: null, preds: {} }, ...p]);
            setH('');
            setA('');
            setAdding(false);
          }}
        />
      </Sheet>
      <Sheet visible={predFor !== null} onClose={() => setPredFor(null)} title={predFor ? `${predFor.home} vs ${predFor.away}` : ''}>
        <Row wrap gap={6}>
          {names.map((n) => (
            <Chip key={n} small label={n} active={who === n} color={color} onPress={() => setWho(n)} />
          ))}
        </Row>
        <Row style={{ justifyContent: 'space-around' }}>
          <Stepper value={ps[0]} onChange={(v) => setPs([v, ps[1]])} color={color} />
          <Stepper value={ps[1]} onChange={(v) => setPs([ps[0], v])} color={C.coral} />
        </Row>
        <Btn
          title="Save prediction"
          color={color}
          disabled={!who}
          onPress={() => {
            if (!predFor || !who) return;
            setFx((p) => p.map((x) => (x.id === predFor.id ? { ...x, preds: { ...x.preds, [who]: ps } } : x)));
            setPredFor(null);
          }}
        />
      </Sheet>
      <Sheet visible={resFor !== null} onClose={() => setResFor(null)} title="Final score">
        <Row style={{ justifyContent: 'space-around' }}>
          <Col gap={4} style={{ alignItems: 'center' }}>
            <Txt v="label" color={C.muted}>
              {resFor?.home}
            </Txt>
            <Stepper value={ps[0]} onChange={(v) => setPs([v, ps[1]])} color={color} />
          </Col>
          <Col gap={4} style={{ alignItems: 'center' }}>
            <Txt v="label" color={C.muted}>
              {resFor?.away}
            </Txt>
            <Stepper value={ps[1]} onChange={(v) => setPs([ps[0], v])} color={C.coral} />
          </Col>
        </Row>
        <Btn
          title="Confirm full time"
          color={color}
          onPress={() => {
            if (!resFor) return;
            setFx((p) => p.map((x) => (x.id === resFor.id ? { ...x, result: ps } : x)));
            setResFor(null);
            playSound('whistle');
          }}
        />
      </Sheet>
    </Col>
  );
}

// ---------------------------------------------------------------- Commentary Quiz
export function CommentaryQuiz({ color }: ModuleProps) {
  return (
    <QuizRunner
      storageKey="tr:commentary"
      color={color}
      intro="Which iconic moment is this commentary from?"
      make={() =>
        sample(COMMENTARY, 8).map((c) => {
          const right = c.options[c.answer] ?? '';
          const opts = shuffle(c.options);
          return { prompt: c.line, options: opts, answer: opts.indexOf(right), explain: c.note };
        })
      }
      renderPrompt={(q) => (
        <Card color={color} style={{ gap: 8, paddingVertical: 24 }}>
          <Row gap={6}>
            <Art name="commentary" size={22} />
            <Txt v="label">On the mic</Txt>
          </Row>
          <Txt v="h1" style={{ fontFamily: F.semi }}>
            {q.prompt}
          </Txt>
        </Card>
      )}
    />
  );
}

// ---------------------------------------------------------------- Delusional Fan Meter
const DELUSION_TITLES: [number, string, string][] = [
  [85, 'CLINICALLY DELUSIONAL', 'You think a 1–0 loss was a "tactical masterclass". Seek help.'],
  [60, 'COPIUM ADDICT', 'Your club is "one signing away" every single season.'],
  [35, 'HOPEFUL MERCHANT', 'Mostly sane, but you did say "this is our year" in August.'],
  [0, 'REALIST (RARE)', 'Honest fan. Suspiciously honest. Are you even a fan?'],
];

export function DelusionalMeter({ color }: ModuleProps) {
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [ans, setAns] = useState<Record<number, number>>({});
  const [results, setResults] = usePersisted<{ name: string; club: string; pct: number; title: string; ts: number }[]>('tr:delusion', []);
  const max = DELUSION_QS.reduce((s, q) => s + Math.max(...q.options.map((o) => o.pts)), 0);
  const done = DELUSION_QS.every((_, i) => ans[i] !== undefined);
  const raw = DELUSION_QS.reduce((s, q, i) => s + (q.options[ans[i] ?? -1]?.pts ?? 0), 0);
  const pct = Math.round((raw / max) * 100);
  const v = DELUSION_TITLES.find(([m]) => pct >= m) ?? DELUSION_TITLES[DELUSION_TITLES.length - 1]!;

  return (
    <Col>
      <Row>
        <View style={{ flex: 1 }}>
          <Field label="Fan" value={name} onChangeText={setName} placeholder="Name" maxLength={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Club" value={club} onChangeText={setClub} placeholder="Club" maxLength={20} />
        </View>
      </Row>
      {DELUSION_QS.map((q, i) => (
        <Section key={i} title={`${i + 1}. ${q.q}`}>
          <Row wrap gap={6}>
            {q.options.map((o, k) => (
              <Chip key={o.t} small label={o.t} active={ans[i] === k} color={color} onPress={() => setAns((p) => ({ ...p, [i]: k }))} />
            ))}
          </Row>
        </Section>
      ))}
      {done ? (
        <Card color={color} style={{ gap: 8, alignItems: 'center', paddingVertical: 24 }}>
          <Txt v="label">
            {name || 'This fan'} {club ? `· ${club}` : ''}
          </Txt>
          <Txt v="big">{pct}%</Txt>
          <View style={{ width: '100%' }}>
            <Bar pct={pct} color={C.text} track="rgba(0,0,0,0.25)" height={10} />
          </View>
          <Txt v="h1" center>
            {v[1]}
          </Txt>
          <Txt v="body" center>
            {v[2]}
          </Txt>
        </Card>
      ) : (
        <Empty text="Answer all 5 to get your delusion reading." />
      )}
      <Row>
        <Btn
          flex
          title="Save reading"
          color={color}
          disabled={!done}
          onPress={() => {
            setResults((r) => [{ name: name || 'Anon', club, pct, title: v[1], ts: Date.now() }, ...r].slice(0, 15));
            playSound(pct >= 60 ? 'boo' : 'rimshot');
          }}
        />
        <Btn flex variant="outline" title="Share" icon={Share2} color={color} disabled={!done} onPress={() => shareText(`🤡 Delusional Fan Meter: ${name || 'Me'} (${club || 'no club'}) = ${pct}% — ${v[1]}`)} />
      </Row>
      {results.length ? (
        <Section title="Delusion ranking">
          {results
            .slice()
            .sort((x, y) => y.pct - x.pct)
            .map((r, i) => (
              <Row key={i} style={{ justifyContent: 'space-between' }}>
                <Txt v="body">
                  {r.name} {r.club ? `(${r.club})` : ''}
                </Txt>
                <Txt v="h3" color={color}>
                  {r.pct}%
                </Txt>
              </Row>
            ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Banter Court
export function BanterCourt({ color }: ModuleProps) {
  const [takes, setTakes] = usePersisted<HotTake[]>('tr:takes', SEED_TAKES);
  const [txt, setTxt] = useState('');
  const vote = (id: string, v: 'w' | 'l') => {
    setTakes((p) =>
      p.map((t) => {
        if (t.id !== id) return t;
        const n = { ...t };
        if (t.mine === 'w') n.w--;
        if (t.mine === 'l') n.l--;
        if (t.mine === v) {
          n.mine = null;
          return n;
        }
        n.mine = v;
        n[v]++;
        return n;
      }),
    );
    tap();
  };
  return (
    <Col>
      <Row>
        <View style={{ flex: 1 }}>
          <Field value={txt} onChangeText={setTxt} placeholder="Drop your hottest take…" maxLength={140} />
        </View>
        <IconBtn
          icon={Flame}
          bg={color}
          onPress={() => {
            if (!txt.trim()) return;
            setTakes((p) => [{ id: uid(), text: txt.trim(), w: 0, l: 0, mine: null, ts: Date.now() }, ...p]);
            setTxt('');
            playSound('boom');
          }}
          label="Post take"
        />
      </Row>
      {takes.map((t) => {
        const tot = t.w + t.l;
        const wp = tot ? Math.round((t.w / tot) * 100) : 50;
        const verdict = tot < 3 ? 'AWAITING JURY' : wp >= 60 ? 'W TAKE' : wp <= 40 ? 'L TAKE' : 'HUNG JURY';
        return (
          <Card key={t.id} style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Tag label={verdict} color={wp >= 60 && tot >= 3 ? C.win : wp <= 40 && tot >= 3 ? C.loss : C.card2} />
              <Txt v="small" color={C.muted}>
                {timeAgo(t.ts)}
              </Txt>
            </Row>
            <Txt v="h2">“{t.text}”</Txt>
            <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ flex: Math.max(t.w, 0.001), backgroundColor: C.win }} />
              <View style={{ flex: Math.max(t.l, 0.001), backgroundColor: C.loss }} />
            </View>
            <Row>
              <Btn flex small title={`W · ${t.w}`} color={C.win} variant={t.mine === 'w' ? 'solid' : 'outline'} onPress={() => vote(t.id, 'w')} />
              <Btn flex small title={`L · ${t.l}`} color={C.loss} variant={t.mine === 'l' ? 'solid' : 'outline'} onPress={() => vote(t.id, 'l')} />
              <IconBtn icon={Trash} size={34} color={C.muted} onPress={() => setTakes((p) => p.filter((x) => x.id !== t.id))} label="Delete take" />
            </Row>
          </Card>
        );
      })}
    </Col>
  );
}

// ---------------------------------------------------------------- HERE WE GO transfer card
export function HereWeGo({ color }: ModuleProps) {
  const [f, setF] = usePersisted('tr:herewego', { player: 'Kevin Mugisha', from: 'Hostel FC', to: 'Real Madrid', fee: '€0.50 + 2 chapatis', contract: 'until June 2030', note: 'Medical booked for Monday. Agent: his mum.' });
  const [today] = useState(todayStr);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  return (
    <Col>
      <View style={{ borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
        <View style={{ backgroundColor: C.coral, padding: 18, gap: 2 }}>
          <Txt v="label">Breaking · @ClassInsider</Txt>
          <Txt v="big" style={{ fontSize: 44, lineHeight: 48 }}>
            HERE WE GO!
          </Txt>
        </View>
        <View style={{ backgroundColor: C.card, padding: 18, gap: 10 }}>
          <Txt v="display">{f.player}</Txt>
          <Row gap={10}>
            <Tag label={f.from.toUpperCase()} color={C.slate} />
            <ArrowRight size={18} color={C.text} />
            <Tag label={f.to.toUpperCase()} color={C.cobalt} />
          </Row>
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <Col gap={2}>
              <Txt v="label" color={C.muted}>
                Fee
              </Txt>
              <Txt v="h3">{f.fee}</Txt>
            </Col>
            <Col gap={2} style={{ alignItems: 'flex-end' }}>
              <Txt v="label" color={C.muted}>
                Contract
              </Txt>
              <Txt v="h3">{f.contract}</Txt>
            </Col>
          </Row>
          <Txt v="body" color={C.textDim}>
            {f.note}
          </Txt>
          <Txt v="small" color={C.muted}>
            Agreement done · documents being prepared · {today}
          </Txt>
        </View>
      </View>
      <Btn title="Share transfer news" icon={Share2} color={color} onPress={() => shareText(`🚨 ${f.player} to ${f.to}, HERE WE GO! ✅\nFrom ${f.from} · Fee: ${f.fee} · Contract ${f.contract}.\n${f.note}`)} />
      <Field label="Player" value={f.player} onChangeText={set('player')} maxLength={26} />
      <Row>
        <View style={{ flex: 1 }}>
          <Field label="From" value={f.from} onChangeText={set('from')} maxLength={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="To" value={f.to} onChangeText={set('to')} maxLength={20} />
        </View>
      </Row>
      <Field label="Fee" value={f.fee} onChangeText={set('fee')} maxLength={30} />
      <Field label="Contract" value={f.contract} onChangeText={set('contract')} maxLength={30} />
      <Field label="Extra detail" value={f.note} onChangeText={set('note')} multiline maxLength={120} />
      <Txt v="small" color={C.muted}>
        Parody card for class banter — not real transfer news.
      </Txt>
    </Col>
  );
}

// ---------------------------------------------------------------- Award Certificate
type Cert = { id: string; name: string; award: string; reason: string; by: string; ts: number };
export function AwardCertificate({ color }: ModuleProps) {
  const names = useNames();
  const [name, setName] = useState(names[0] ?? '');
  const [award, setAward] = useState(AWARDS[0] ?? '');
  const [reason, setReason] = useState('For outstanding dedication to arriving after attendance is taken.');
  const [by, setBy] = useState('The Class Arena Committee');
  const [gallery, setGallery] = usePersisted<Cert[]>('tr:certs', []);
  const [today] = useState(todayStr);
  return (
    <Col>
      <View style={{ backgroundColor: '#F1ECE1', borderRadius: R.md, padding: 8 }}>
        <View style={{ borderWidth: 3, borderColor: C.amber, borderRadius: R.sm, padding: 18, alignItems: 'center', gap: 8 }}>
          <Award size={36} color={C.amber} />
          <Txt v="label" color={C.ink}>
            Certificate of achievement
          </Txt>
          <Txt v="small" color="#5A5A5A">
            This is proudly presented to
          </Txt>
          <Txt v="display" color={C.ink} center>
            {name || '—'}
          </Txt>
          <View style={{ backgroundColor: color, paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.sm }}>
            <Txt v="h3" center>
              {award}
            </Txt>
          </View>
          <Txt v="body" color="#3A3A3A" center>
            {reason}
          </Txt>
          <Row style={{ justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 8 }}>
            <Txt v="small" color="#5A5A5A">
              {today}
            </Txt>
            <Txt v="small" color="#5A5A5A">
              — {by}
            </Txt>
          </Row>
        </View>
      </View>
      <Row>
        <Btn flex title="Save to gallery" icon={Sparkles} color={color} onPress={() => { setGallery((g) => [{ id: uid(), name, award, reason, by, ts: Date.now() }, ...g].slice(0, 30)); playSound('airhorn'); }} />
        <Btn flex variant="outline" title="Share" icon={Share2} color={color} onPress={() => shareText(`🏅 CERTIFICATE: ${name} — "${award}". ${reason} — ${by}`)} />
      </Row>
      <Section title="Recipient">
        <Row wrap gap={6}>
          {names.map((n) => (
            <Chip key={n} small label={n} active={name === n} color={color} onPress={() => setName(n)} />
          ))}
        </Row>
      </Section>
      <Section title="Award">
        <Row wrap gap={6}>
          {AWARDS.map((a) => (
            <Chip key={a} small label={a} active={award === a} color={color} onPress={() => setAward(a)} />
          ))}
        </Row>
        <Field value={award} onChangeText={setAward} placeholder="Or write your own award" maxLength={50} />
      </Section>
      <Field label="Citation" value={reason} onChangeText={setReason} multiline maxLength={140} />
      <Field label="Presented by" value={by} onChangeText={setBy} maxLength={40} />
      {gallery.length ? (
        <Section title={`Gallery (${gallery.length})`}>
          {gallery.map((c) => (
            <Row key={c.id} style={{ justifyContent: 'space-between' }}>
              <Art name="certificate" size={24} />
              <Txt v="body" style={{ flex: 1 }}>
                {c.name} — {c.award}
              </Txt>
              <IconBtn icon={Trash} size={30} color={C.muted} onPress={() => setGallery((g) => g.filter((x) => x.id !== c.id))} label="Delete" />
            </Row>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Lecturer Excuse Generator
export function LecturerExcuse({ color }: ModuleProps) {
  const make = () => `${pick(EXCUSE_PARTS.opener)} I will not be able to make it to today's class because ${pick(EXCUSE_PARTS.reason)}. ${pick(EXCUSE_PARTS.ending)}`;
  const [lect, setLect] = useState('Dr. Mwangi');
  const [text, setText] = useState(make);
  const [favs, setFavs] = usePersisted<string[]>('tr:excuses', []);
  const full = `${text}\n— ${lect || 'Your Lecturer'}`;
  return (
    <Col>
      <Field label="Lecturer (fictional is funnier)" value={lect} onChangeText={setLect} maxLength={30} />
      <Card style={{ gap: 10 }}>
        <Row>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
            <Txt v="h3">{(lect || 'L').replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').charAt(0).toUpperCase()}</Txt>
          </View>
          <Col gap={0}>
            <Txt v="h3">{lect || 'Your Lecturer'}</Txt>
            <Txt v="small" color={C.muted}>
              to Class 50+ · just now
            </Txt>
          </Col>
        </Row>
        <Txt v="body">{text}</Txt>
      </Card>
      <Row>
        <Btn flex title="Generate" icon={Shuffle} color={color} onPress={() => { setText(make()); tap(); }} />
        <IconBtn icon={Heart} bg={favs.includes(full) ? C.coral : C.card} onPress={() => setFavs((f) => (f.includes(full) ? f.filter((x) => x !== full) : [full, ...f].slice(0, 20)))} label="Favourite" />
        <IconBtn icon={Share2} onPress={() => shareText(full)} label="Share" />
      </Row>
      {favs.length ? (
        <Section title="Favourites">
          {favs.map((f, i) => (
            <Card key={i} pad={12}>
              <Txt v="small" color={C.textDim}>
                {f}
              </Txt>
            </Card>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Roast My Name
export function RoastMyName({ color }: ModuleProps) {
  const [name, setName] = useState('');
  const [hist, setHist] = usePersisted<{ name: string; roast: string; score: number }[]>('tr:roastname', []);
  const [cur, setCur] = useState<{ name: string; roast: string; score: number } | null>(null);
  const roast = () => {
    const n = name.trim();
    if (!n) return;
    const h = hashStr(n.toLowerCase());
    const r = seeded(h);
    const letters = n.replace(/[^a-z]/gi, '');
    const vowels = (letters.match(/[aeiou]/gi) ?? []).length;
    const score = 1 + (h % 10);
    const intro = letters.length > 8 ? `${letters.length} letters? Your name takes longer to say than your attendance record.` : letters.length <= 4 ? `Only ${letters.length} letters — even your name skips class.` : `${vowels} vowels, zero aura.`;
    const text = `${n} ${pickSeeded(ROAST_BITS.vibe, r)}. ${intro} ${pickSeeded(ROAST_BITS.power, r)}`;
    const res = { name: n, roast: text, score };
    setCur(res);
    setHist((p) => [res, ...p.filter((x) => x.name.toLowerCase() !== n.toLowerCase())].slice(0, 12));
    playSound('rimshot');
  };
  return (
    <Col>
      <Row>
        <View style={{ flex: 1 }}>
          <Field value={name} onChangeText={setName} placeholder="Type any name" maxLength={30} onSubmitEditing={roast} />
        </View>
        <IconBtn icon={Flame} bg={color} onPress={roast} label="Roast" />
      </Row>
      {cur ? (
        <Card color={color} style={{ gap: 10, paddingVertical: 22 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="display">{cur.name}</Txt>
            <Tag label={`NAME AURA ${cur.score}/10`} />
          </Row>
          <Txt v="h3" style={{ fontFamily: F.medium }}>
            {cur.roast}
          </Txt>
          <Btn small variant="outline" color={C.text} title="Share roast" icon={Share2} onPress={() => shareText(`🔥 ${cur.roast}`)} />
        </Card>
      ) : (
        <Empty text="Same name always gets the same roast — no rerolling your way out." />
      )}
      {hist.length ? (
        <Section title="Roasted so far" right={<Btn small variant="ghost" title="Clear" icon={Trash} color={C.muted} onPress={() => setHist([])} />}>
          {hist.map((x) => (
            <Pressable key={x.name} onPress={() => setCur(x)}>
              <Row style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
                <Txt v="h3">{x.name}</Txt>
                <Txt v="small" color={C.muted}>
                  aura {x.score}/10
                </Txt>
              </Row>
            </Pressable>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}
