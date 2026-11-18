import { Check, RotateCcw, X } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { usePersisted } from '../lib/store';
import { playSound, tap } from '../lib/sound';
import { C, F, R } from '../theme';
import { Bar, Btn, Card, Col, Row, Stat, Txt } from '../ui';

export type QuizQ = { prompt: string; sub?: string; options: string[]; answer: number; explain?: string };

/** Generic multiple-choice round engine with persisted best score. */
export function QuizRunner({
  storageKey,
  make,
  color,
  renderPrompt,
  intro,
}: {
  storageKey: string;
  make: () => QuizQ[];
  color: string;
  renderPrompt?: (q: QuizQ) => ReactNode;
  intro?: string;
}) {
  const [qs, setQs] = useState<QuizQ[]>(make);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [stats, setStats] = usePersisted(`${storageKey}:stats`, { best: 0, played: 0 });
  const done = i >= qs.length;
  const q = qs[i];

  const choose = (k: number) => {
    if (picked !== null || !q) return;
    setPicked(k);
    if (k === q.answer) {
      setScore((s) => s + 1);
      tap('success');
    } else {
      tap('error');
    }
  };

  const next = () => {
    const ni = i + 1;
    setPicked(null);
    setI(ni);
    if (ni >= qs.length) {
      const isBest = score > stats.best;
      setStats({ best: Math.max(stats.best, score), played: stats.played + 1 });
      playSound(isBest ? 'goal' : score < qs.length / 2 ? 'trombone' : 'rimshot');
    }
  };

  const restart = () => {
    setQs(make());
    setI(0);
    setScore(0);
    setPicked(null);
  };

  if (done) {
    return (
      <Col>
        <Card color={color} style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Txt v="label">Final score</Txt>
          <Txt v="big">
            {score}/{qs.length}
          </Txt>
          <Txt v="h3" center>
            {score === qs.length ? 'Perfect. Absolute ball knowledge.' : score >= qs.length * 0.7 ? 'Certified football brain.' : score >= qs.length * 0.4 ? 'Mid. Watch more highlights.' : 'Do you even watch football?'}
          </Txt>
        </Card>
        <Row>
          <Stat label="Best" value={stats.best} />
          <Stat label="Rounds" value={stats.played} />
        </Row>
        <Btn title="Play again" icon={RotateCcw} onPress={restart} color={color} />
      </Col>
    );
  }
  if (!q) return null;

  return (
    <Col>
      {intro && i === 0 && picked === null ? (
        <Txt v="small" color={C.muted}>
          {intro}
        </Txt>
      ) : null}
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="label" color={C.muted}>
          Question {i + 1} / {qs.length}
        </Txt>
        <Txt v="label" color={color}>
          Score {score}
        </Txt>
      </Row>
      <Bar pct={(i / qs.length) * 100} color={color} />
      {renderPrompt ? (
        renderPrompt(q)
      ) : (
        <Card>
          <Txt v="h1">{q.prompt}</Txt>
          {q.sub ? (
            <Txt v="small" color={C.muted} style={{ marginTop: 6 }}>
              {q.sub}
            </Txt>
          ) : null}
        </Card>
      )}
      <Col gap={8}>
        {q.options.map((o, k) => {
          const isAns = picked !== null && k === q.answer;
          const isWrong = picked === k && k !== q.answer;
          return (
            <Pressable
              key={`${o}-${k}`}
              onPress={() => choose(k)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 15,
                borderRadius: R.md,
                borderWidth: 1,
                borderColor: isAns ? C.win : isWrong ? C.loss : C.border,
                backgroundColor: isAns ? C.win : isWrong ? C.loss : pressed ? C.card2 : C.card,
              })}
            >
              <Txt v="h3" style={{ flex: 1, fontFamily: F.medium }}>
                {o}
              </Txt>
              {isAns ? <Check size={18} color={C.text} /> : isWrong ? <X size={18} color={C.text} /> : null}
            </Pressable>
          );
        })}
      </Col>
      {picked !== null ? (
        <View style={{ gap: 10 }}>
          {q.explain ? (
            <Txt v="small" color={C.textDim}>
              {q.explain}
            </Txt>
          ) : null}
          <Btn title={i + 1 >= qs.length ? 'See result' : 'Next'} onPress={next} color={color} />
        </View>
      ) : null}
    </Col>
  );
}
