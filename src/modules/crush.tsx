import { Eye, Heart, MessageCircle, Plus, RotateCcw, Send, Share2, Sparkles, Trash } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { ADMIRER_FACTS, AURA_TRAITS } from '../data/content';
import { SEED_CONFESSIONS, SEED_CRUSHES, SEED_POLLS, type Confession, type Crush, type Poll } from '../data/seed';
import { useNames } from '../engines/hooks';
import { usePersisted } from '../lib/store';
import { playSound, tap } from '../lib/sound';
import { hashStr, pick, pickSeeded, seeded, timeAgo, uid } from '../lib/utils';
import { C, F, PALETTE, R } from '../theme';
import { Art, Bar, Btn, Card, Chip, Col, Empty, Field, IconBtn, Row, Section, Sheet, Stat, Tag, Txt, shareText } from '../ui';
import type { ModuleProps } from './types';

// ---------------------------------------------------------------- Crush Board
export function CrushBoard({ color }: ModuleProps) {
  const [crushes, setCrushes] = usePersisted<Crush[]>('crush:board', SEED_CRUSHES);
  const [hearted, setHearted] = usePersisted<string[]>('crush:hearted', []);
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const [msg, setMsg] = useState('');
  const [guessFor, setGuessFor] = useState<string | null>(null);
  const [guess, setGuess] = useState('');

  const post = () => {
    if (!to.trim() || !msg.trim()) return;
    setCrushes((p) => [{ id: uid(), to: to.trim(), message: msg.trim(), hearts: 0, guesses: [], ts: Date.now(), color: Math.floor(Math.random() * 5) }, ...p]);
    setTo('');
    setMsg('');
    setOpen(false);
    playSound('heartbeat');
  };
  const heart = (id: string) => {
    const on = hearted.includes(id);
    setHearted(on ? hearted.filter((h) => h !== id) : [...hearted, id]);
    setCrushes((p) => p.map((c) => (c.id === id ? { ...c, hearts: c.hearts + (on ? -1 : 1) } : c)));
    tap();
  };
  const addGuess = () => {
    if (!guessFor || !guess.trim()) return;
    setCrushes((p) => p.map((c) => (c.id === guessFor ? { ...c, guesses: [...c.guesses, guess.trim()] } : c)));
    setGuess('');
    setGuessFor(null);
  };

  return (
    <Col>
      <Btn title="Post Anonymous Crush" icon={Plus} onPress={() => setOpen(true)} color={color} />
      <Txt v="small" color={C.muted}>
        {crushes.length} crushes dropped · names stay anonymous forever
      </Txt>
      {crushes.map((c) => (
        <View key={c.id} style={{ borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
          <View style={{ backgroundColor: PALETTE[c.color % 5], padding: 16, gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Tag label="SECRET CRUSH" />
              <Txt v="small" color={C.text}>
                {timeAgo(c.ts)}
              </Txt>
            </Row>
            <Txt v="label">To</Txt>
            <Txt v="h1">{c.to}</Txt>
            <Txt v="body">“{c.message}”</Txt>
          </View>
          <View style={{ backgroundColor: C.card, padding: 12, gap: 10 }}>
            <Row>
              <Pressable onPress={() => heart(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.pill, backgroundColor: hearted.includes(c.id) ? C.coral : C.card2 }}>
                <Heart size={16} color={C.text} fill={hearted.includes(c.id) ? C.text : 'transparent'} />
                <Txt v="h3">{c.hearts}</Txt>
              </Pressable>
              <Pressable onPress={() => setGuessFor(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.pill, backgroundColor: C.card2 }}>
                <MessageCircle size={16} color={C.text} />
                <Txt v="h3">Guess who · {c.guesses.length}</Txt>
              </Pressable>
              <View style={{ flex: 1 }} />
              <IconBtn icon={Share2} size={34} onPress={() => shareText(`💌 SECRET CRUSH — CLASS ARENA 50+\nTo: ${c.to}\n“${c.message}”\n❤️ ${c.hearts} hearts`)} label="Share" />
            </Row>
            {c.guesses.slice(-3).map((g, i) => (
              <Row key={`${c.id}-g${i}`} gap={6}>
                <Art name="imposter" size={18} />
                <Txt v="small" color={C.textDim} style={{ flex: 1 }}>
                  {g}
                </Txt>
              </Row>
            ))}
          </View>
        </View>
      ))}
      <Sheet visible={open} onClose={() => setOpen(false)} title="New secret crush">
        <Field label="To (name or hint)" value={to} onChangeText={setTo} placeholder="e.g. Hoodie guy, row 3" maxLength={60} />
        <Field label="Your message" value={msg} onChangeText={setMsg} placeholder="Say it. Nobody will know." multiline maxLength={240} />
        <Btn title="Drop it anonymously" icon={Send} onPress={post} color={color} disabled={!to.trim() || !msg.trim()} />
      </Sheet>
      <Sheet visible={guessFor !== null} onClose={() => setGuessFor(null)} title="Guess who posted it">
        <Field value={guess} onChangeText={setGuess} placeholder="I think it's…" maxLength={80} />
        <Btn title="Post guess" onPress={addGuess} color={color} disabled={!guess.trim()} />
      </Sheet>
    </Col>
  );
}

// ---------------------------------------------------------------- Confessions
const REACTS = [
  { k: 'laugh', art: 'laugh' },
  { k: 'skull', art: 'skull' },
  { k: 'cap', art: 'billed-cap' },
] as const;

export function Confessions({ color }: ModuleProps) {
  const [list, setList] = usePersisted<Confession[]>('crush:confessions', SEED_CONFESSIONS);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [mine, setMine] = usePersisted<Record<string, string>>('crush:conf-reacts', {});
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const post = () => {
    if (!text.trim()) return;
    const num = (list[0]?.num ?? 0) + 1;
    setList((p) => [{ id: uid(), num, text: text.trim(), laugh: 0, skull: 0, cap: 0, ts: Date.now() }, ...p]);
    setText('');
    setOpen(false);
    playSound('boom');
  };
  const react = (id: string, k: 'laugh' | 'skull' | 'cap') => {
    const prev = mine[id];
    setList((p) =>
      p.map((c) => {
        if (c.id !== id) return c;
        const n = { ...c };
        if (prev === 'laugh' || prev === 'skull' || prev === 'cap') n[prev] -= 1;
        if (prev !== k) n[k] += 1;
        return n;
      }),
    );
    const next = { ...mine };
    if (prev === k) delete next[id];
    else next[id] = k;
    setMine(next);
    tap();
  };

  return (
    <Col>
      <Btn title="Post Confession" icon={Plus} onPress={() => setOpen(true)} color={color} />
      {list.map((c) => {
        const shown = revealed.includes(c.id);
        return (
          <Card key={c.id} style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt v="h2">Anonymous Confession #{c.num}</Txt>
              <Txt v="small" color={C.muted}>
                {timeAgo(c.ts)}
              </Txt>
            </Row>
            <Pressable onPress={() => setRevealed((r) => (shown ? r.filter((x) => x !== c.id) : [...r, c.id]))}>
              {shown ? (
                <Txt v="body">{c.text}</Txt>
              ) : (
                <View style={{ gap: 6 }}>
                  {[0.95, 0.85, 0.6].map((w, i) => (
                    <View key={i} style={{ height: 13, width: `${w * 100}%`, backgroundColor: C.border, borderRadius: 4 }} />
                  ))}
                  <Row gap={6} style={{ marginTop: 4 }}>
                    <Eye size={14} color={color} />
                    <Txt v="label" color={color}>
                      Tap to unblur
                    </Txt>
                  </Row>
                </View>
              )}
            </Pressable>
            <Row>
              {REACTS.map((r) => (
                <Pressable
                  key={r.k}
                  onPress={() => react(c.id, r.k)}
                  style={{ flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.pill, backgroundColor: mine[c.id] === r.k ? color : C.card2 }}
                >
                  <Art name={r.art} size={20} />
                  <Txt v="h3">{c[r.k]}</Txt>
                </Pressable>
              ))}
            </Row>
          </Card>
        );
      })}
      <Sheet visible={open} onClose={() => setOpen(false)} title="Confess anonymously">
        <Field value={text} onChangeText={setText} placeholder="I have never told anyone that…" multiline maxLength={300} />
        <Txt v="small" color={C.muted}>
          Be funny, not cruel. No real names in confessions about others.
        </Txt>
        <Btn title="Post Confession" icon={Send} onPress={post} color={color} disabled={!text.trim()} />
      </Sheet>
    </Col>
  );
}

// ---------------------------------------------------------------- Rizz Meter
const RIZZ_VERDICTS: [number, string, string[]][] = [
  [90, 'SOULMATES', ['Wedding committee is already being formed in the class group chat.', 'Even the lecturer ships it.']],
  [70, 'DANGEROUSLY COMPATIBLE', ['Sit next to each other in the next CAT. For research.', 'Group project partners → life partners pipeline.']],
  [50, 'SITUATIONSHIP LOADING', ['Talking stage until graduation, minimum.', 'Lots of "haha" texts. No progress.']],
  [30, 'FRIEND ZONE FC', ['Signed to Friend Zone FC on a 5-year contract.', '"You\'re like a brother to me" incoming.']],
  [0, 'ABSOLUTELY NOT', ['The Wi-Fi has better chemistry with the library.', 'Even eFootball AI has more rizz than this pairing.']],
];

export function RizzMeter({ color }: ModuleProps) {
  const names = useNames();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [res, setRes] = useState<{ pct: number; title: string; roast: string } | null>(null);
  const [history, setHistory] = usePersisted<{ a: string; b: string; pct: number }[]>('crush:rizz', []);
  const [anim] = useState(() => new Animated.Value(0));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value }) => setShown(Math.round(value)));
    return () => anim.removeListener(id);
  }, [anim]);

  const calc = () => {
    if (!a.trim() || !b.trim()) return;
    const key = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort().join('+');
    const h = hashStr(key);
    const pct = h % 101;
    const r = seeded(h);
    const v = RIZZ_VERDICTS.find(([min]) => pct >= min) ?? RIZZ_VERDICTS[RIZZ_VERDICTS.length - 1]!;
    setRes({ pct, title: v[1], roast: pickSeeded(v[2], r) });
    anim.setValue(0);
    Animated.timing(anim, { toValue: pct, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => playSound(pct >= 70 ? 'heartbeat' : pct < 30 ? 'trombone' : 'rimshot'));
    setHistory((p) => [{ a: a.trim(), b: b.trim(), pct }, ...p].slice(0, 8));
  };

  const quick = names.slice(0, 12);
  return (
    <Col>
      <Field label="Classmate 1" value={a} onChangeText={setA} placeholder="Type a name" />
      <Row wrap gap={6}>
        {quick.map((n) => (
          <Chip key={`a${n}`} small label={n} active={a === n} onPress={() => setA(n)} color={color} />
        ))}
      </Row>
      <Field label="Classmate 2" value={b} onChangeText={setB} placeholder="Type a name" />
      <Row wrap gap={6}>
        {quick.map((n) => (
          <Chip key={`b${n}`} small label={n} active={b === n} onPress={() => setB(n)} color={color} />
        ))}
      </Row>
      <Btn title="Calculate Rizz" icon={Heart} onPress={calc} color={color} disabled={!a.trim() || !b.trim()} />
      {res ? (
        <Card color={color} style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
          <Row gap={8}>
            <Txt v="label">{a}</Txt>
            <Art name="heart" size={18} />
            <Txt v="label">{b}</Txt>
          </Row>
          <Txt v="big">{shown}%</Txt>
          <View style={{ width: '100%' }}>
            <Bar pct={shown} color={C.text} track="rgba(0,0,0,0.25)" height={10} />
          </View>
          <Txt v="h1" center>
            {res.title}
          </Txt>
          <Txt v="body" center>
            {res.roast}
          </Txt>
          <Btn small variant="outline" color={C.text} title="Share verdict" icon={Share2} onPress={() => shareText(`💘 Rizz Meter: ${a} + ${b} = ${res.pct}% — ${res.title}. ${res.roast}`)} />
        </Card>
      ) : null}
      {history.length ? (
        <Section title="Recent readings">
          {history.map((h, i) => (
            <Row key={i} style={{ justifyContent: 'space-between' }}>
              <Txt v="small" color={C.textDim}>
                {h.a} + {h.b}
              </Txt>
              <Txt v="h3" color={color}>
                {h.pct}%
              </Txt>
            </Row>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Polls
export function Polls({ color }: ModuleProps) {
  const [polls, setPolls] = usePersisted<Poll[]>('crush:polls', SEED_POLLS);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState<string[]>(['', '']);

  const create = () => {
    const clean = opts.map((o) => o.trim()).filter(Boolean);
    if (!q.trim() || clean.length < 2) return;
    setPolls((p) => [{ id: uid(), q: q.trim(), options: clean.map((text) => ({ text, votes: 0 })), voted: null, ts: Date.now() }, ...p]);
    setQ('');
    setOpts(['', '']);
    setOpen(false);
  };
  const vote = (id: string, k: number) => {
    setPolls((p) =>
      p.map((poll) => {
        if (poll.id !== id) return poll;
        const options = poll.options.map((o, i) => ({ ...o, votes: o.votes + (i === k ? 1 : 0) - (i === poll.voted ? 1 : 0) }));
        return { ...poll, options, voted: k };
      }),
    );
    tap();
  };

  return (
    <Col>
      <Btn title="Create Poll" icon={Plus} onPress={() => setOpen(true)} color={color} />
      {polls.map((p) => {
        const total = p.options.reduce((s, o) => s + o.votes, 0);
        const top = Math.max(...p.options.map((o) => o.votes));
        return (
          <Card key={p.id} style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Tag label="LIVE POLL" color={color} />
              <Row gap={6}>
                <Txt v="small" color={C.muted}>
                  {total} votes
                </Txt>
                <IconBtn icon={Trash} size={30} color={C.muted} onPress={() => setPolls((x) => x.filter((y) => y.id !== p.id))} label="Delete poll" />
              </Row>
            </Row>
            <Txt v="h2">{p.q}</Txt>
            {p.options.map((o, k) => {
              const pct = total ? Math.round((o.votes / total) * 100) : 0;
              const mine = p.voted === k;
              return (
                <Pressable key={k} onPress={() => vote(p.id, k)} style={{ borderRadius: R.md, borderWidth: 1, borderColor: mine ? color : C.border, overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p.voted === null ? 0 : pct}%`, backgroundColor: o.votes === top && p.voted !== null ? color : C.card2 }} />
                  <Row style={{ justifyContent: 'space-between', padding: 12 }}>
                    <Txt v="h3" style={{ flex: 1 }}>
                      {mine ? '✓ ' : ''}
                      {o.text}
                    </Txt>
                    {p.voted !== null ? <Txt v="h3">{pct}%</Txt> : null}
                  </Row>
                </Pressable>
              );
            })}
            {p.voted === null ? (
              <Txt v="small" color={C.muted}>
                Tap an option to vote and see results.
              </Txt>
            ) : null}
          </Card>
        );
      })}
      <Sheet visible={open} onClose={() => setOpen(false)} title="New class poll">
        <Field label="Question" value={q} onChangeText={setQ} placeholder="Who will graduate first?" maxLength={120} />
        {opts.map((o, i) => (
          <Field key={i} label={`Option ${i + 1}`} value={o} onChangeText={(t) => setOpts((p) => p.map((x, j) => (j === i ? t : x)))} maxLength={60} />
        ))}
        {opts.length < 5 ? <Btn title="Add option" variant="outline" color={color} icon={Plus} onPress={() => setOpts((p) => [...p, ''])} /> : null}
        <Btn title="Publish poll" onPress={create} color={color} disabled={!q.trim() || opts.filter((o) => o.trim()).length < 2} />
      </Sheet>
    </Col>
  );
}

// ---------------------------------------------------------------- Aura Rater
const AURA_TITLES: [number, string][] = [
  [90, 'MAIN CHARACTER'],
  [75, 'CAMPUS ICON'],
  [60, 'CERTIFIED DRIP'],
  [45, 'NPC WITH POTENTIAL'],
  [0, 'AURA IN DEBT'],
];

export function AuraRater({ color }: ModuleProps) {
  const [name, setName] = useState('');
  const [sel, setSel] = useState<Record<string, number>>({});
  const [cards, setCards] = usePersisted<{ id: string; name: string; score: number; title: string; traits: string[] }[]>('crush:aura', []);
  const max = AURA_TRAITS.reduce((s, g) => s + Math.max(...g.options.map((o) => o.pts)), 0);
  const raw = AURA_TRAITS.reduce((s, g) => s + (g.options[sel[g.group] ?? -1]?.pts ?? 0), 0);
  const complete = AURA_TRAITS.every((g) => sel[g.group] !== undefined);
  const score = Math.round((raw / max) * 1000);
  const title = (AURA_TITLES.find(([m]) => score / 10 >= m) ?? AURA_TITLES[AURA_TITLES.length - 1]!)[1];

  const save = () => {
    if (!complete) return;
    const traits = AURA_TRAITS.map((g) => g.options[sel[g.group] ?? 0]?.t ?? '');
    setCards((p) => [{ id: uid(), name: name.trim() || 'Anonymous', score, title, traits }, ...p].slice(0, 20));
    playSound(score >= 750 ? 'airhorn' : 'rimshot');
  };

  return (
    <Col>
      <Field label="Who's getting rated?" value={name} onChangeText={setName} placeholder="Name" maxLength={30} />
      {AURA_TRAITS.map((g) => (
        <Section key={g.group} title={g.group}>
          <Row wrap gap={6}>
            {g.options.map((o, i) => (
              <Chip key={o.t} small label={o.t} active={sel[g.group] === i} onPress={() => setSel((p) => ({ ...p, [g.group]: i }))} color={color} />
            ))}
          </Row>
        </Section>
      ))}
      <Card color={complete ? color : C.card} style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <Txt v="label">{name || 'Your'} aura score</Txt>
        <Txt v="big">{complete ? score : '???'}</Txt>
        <Txt v="h1">{complete ? title : 'Pick one per row'}</Txt>
      </Card>
      <Row>
        <Btn flex title="Save card" icon={Sparkles} onPress={save} color={color} disabled={!complete} />
        <Btn flex variant="outline" title="Share" icon={Share2} color={color} disabled={!complete} onPress={() => shareText(`✨ AURA SCORE: ${name || 'Me'} — ${score} (${title})`)} />
      </Row>
      {cards.length ? (
        <Section title="Aura hall">
          {cards.map((c) => (
            <Card key={c.id} pad={12}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt v="h3">{c.name}</Txt>
                <Txt v="h2" color={color}>
                  {c.score}
                </Txt>
              </Row>
              <Txt v="small" color={C.muted}>
                {c.title} · {c.traits.join(' · ')}
              </Txt>
            </Card>
          ))}
        </Section>
      ) : null}
    </Col>
  );
}

// ---------------------------------------------------------------- Secret Admirer Hint Dropper
type Drop = { id: string; target: string; clues: string[]; revealed: number; ts: number };

export function AdmirerHints({ color }: ModuleProps) {
  const names = useNames();
  const [target, setTarget] = useState('');
  const [seat, setSeat] = useState(ADMIRER_FACTS.seat[0]!);
  const [vibe, setVibe] = useState(ADMIRER_FACTS.vibe[0]!);
  const [wears, setWears] = useState(ADMIRER_FACTS.wears[0]!);
  const [drops, setDrops] = usePersisted<Drop[]>('crush:admirer', []);

  const generate = () => {
    if (!target) return;
    const clues = [
      pick([`Clue 1: I sit somewhere in the ${seat}. That narrows it down… barely.`, `Clue 1: My usual spot? The ${seat}. Look around.`]),
      pick([`Clue 2: People describe me as ${vibe}. You might have noticed. Or not.`, `Clue 2: If you had to describe me in one word: ${vibe}.`]),
      pick([`Clue 3: I almost always wear ${wears}. Final clue, ${target}. Your move.`, `Clue 3: Look for ${wears}. That's all you get, ${target}.`]),
    ];
    setDrops((p) => [{ id: uid(), target, clues, revealed: 1, ts: Date.now() }, ...p].slice(0, 15));
    playSound('heartbeat');
  };

  return (
    <Col>
      <Section title="Who are you secretly admiring?">
        <Row wrap gap={6}>
          {names.map((n) => (
            <Chip key={n} small label={n} active={target === n} onPress={() => setTarget(n)} color={color} />
          ))}
        </Row>
      </Section>
      <Section title="Where you sit">
        <Row wrap gap={6}>
          {ADMIRER_FACTS.seat.map((s) => (
            <Chip key={s} small label={s} active={seat === s} onPress={() => setSeat(s)} color={color} />
          ))}
        </Row>
      </Section>
      <Section title="Your vibe">
        <Row wrap gap={6}>
          {ADMIRER_FACTS.vibe.map((s) => (
            <Chip key={s} small label={s} active={vibe === s} onPress={() => setVibe(s)} color={color} />
          ))}
        </Row>
      </Section>
      <Section title="You usually wear">
        <Row wrap gap={6}>
          {ADMIRER_FACTS.wears.map((s) => (
            <Chip key={s} small label={s} active={wears === s} onPress={() => setWears(s)} color={color} />
          ))}
        </Row>
      </Section>
      <Btn title="Generate 3 mystery clues" icon={Sparkles} onPress={generate} color={color} disabled={!target} />
      {drops.length === 0 ? <Empty text="Your hint drops appear here. Reveal one clue at a time to build suspense." /> : null}
      {drops.map((d) => (
        <Card key={d.id} style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row gap={6}>
              <Art name="crush-board" size={24} />
              <Txt v="h2">For {d.target}</Txt>
            </Row>
            <Txt v="small" color={C.muted}>
              {timeAgo(d.ts)}
            </Txt>
          </Row>
          {d.clues.map((c, i) => (
            <View key={i} style={{ padding: 10, borderRadius: R.md, backgroundColor: i < d.revealed ? C.card2 : C.bg, borderWidth: 1, borderColor: C.border }}>
              <Txt v="body" color={i < d.revealed ? C.text : C.muted}>
                {i < d.revealed ? c : `Clue ${i + 1} locked`}
              </Txt>
            </View>
          ))}
          <Row>
            {d.revealed < 3 ? (
              <Btn flex small title="Reveal next clue" color={color} onPress={() => setDrops((p) => p.map((x) => (x.id === d.id ? { ...x, revealed: x.revealed + 1 } : x)))} />
            ) : (
              <Btn flex small variant="outline" title="Share clues" icon={Share2} color={color} onPress={() => shareText(`💌 Secret admirer clues for ${d.target}:\n${d.clues.join('\n')}`)} />
            )}
            <IconBtn icon={RotateCcw} size={36} onPress={() => setDrops((p) => p.filter((x) => x.id !== d.id))} label="Delete" />
          </Row>
        </Card>
      ))}
      <Row>
        <Stat label="Drops made" value={drops.length} color={color} />
      </Row>
      <Txt v="small" color={C.muted} style={{ fontFamily: F.regular }}>
        Keep it sweet — hints are for fun, not for pressure.
      </Txt>
    </Col>
  );
}
