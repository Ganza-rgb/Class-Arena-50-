import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SEED_ROSTER, type Classmate } from '../data/seed';
import { usePersisted } from '../lib/store';
import { firstName, shuffle } from '../lib/utils';

export function useRoster() {
  return usePersisted<Classmate[]>('roster', SEED_ROSTER);
}

export function useNames(): string[] {
  const [roster] = useRoster();
  return useMemo(() => roster.map((c) => firstName(c.name)), [roster]);
}

/** Wall-clock countdown that survives re-renders. `left` is in seconds (float). */
export function useCountdown(onEnd?: () => void) {
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(1);
  const endAt = useRef(0);
  const cb = useRef(onEnd);
  useEffect(() => {
    cb.current = onEnd;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const l = Math.max(0, (endAt.current - Date.now()) / 1000);
      setLeft(l);
      if (l <= 0) {
        setRunning(false);
        cb.current?.();
      }
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback((seconds: number) => {
    setTotal(seconds);
    endAt.current = Date.now() + seconds * 1000;
    setLeft(seconds);
    setRunning(true);
  }, []);
  const stop = useCallback(() => setRunning(false), []);

  return { left, running, start, stop, pct: (left / total) * 100 };
}

/** Draws through a shuffled deck without repeats, reshuffling when exhausted. */
export function useDeck<T>(items: readonly T[]) {
  const [order, setOrder] = useState<T[]>(() => shuffle(items));
  const [i, setI] = useState(0);
  // Reshuffle when the deck size changes (adjust-state-during-render pattern).
  const [sig, setSig] = useState(items.length);
  if (sig !== items.length) {
    setSig(items.length);
    setOrder(shuffle(items));
    setI(0);
  }
  const next = useCallback(() => {
    setI((n) => {
      if (n + 1 >= order.length) {
        setOrder(shuffle(items));
        return 0;
      }
      return n + 1;
    });
  }, [items, order.length]);
  return { card: order[i] as T | undefined, next, index: i, total: order.length };
}

/** requestAnimationFrame loop delivering dt in seconds while `active`. */
export function useRaf(fn: (dt: number) => void, active: boolean) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!active) return;
    let last = 0;
    let id = 0;
    const loop = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      ref.current(dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}

export function useClearTimeouts() {
  const ids = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  const later = useCallback((fn: () => void, ms: number) => {
    ids.current.push(setTimeout(fn, ms));
  }, []);
  const clearAll = useCallback(() => {
    ids.current.forEach(clearTimeout);
    ids.current = [];
  }, []);
  return { later, clearAll };
}
