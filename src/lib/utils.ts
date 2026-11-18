export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Stable 32-bit hash so generators give the same verdict for the same input. */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seeded(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function pickSeeded<T>(arr: readonly T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)] as T;
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const firstName = (full: string): string => full.trim().split(/\s+/)[0] ?? full;

export const fmtDate = (ts: number): string =>
  new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Randomness helpers (kept out of component bodies so render stays pure). */
export const rand = (): number => Math.random();
export const chance = (p: number): boolean => Math.random() < p;
export const todayStr = (): string => fmtDate(Date.now());
export const nowMs = (): number => Date.now();
