// Tiny persisted key/value store on AsyncStorage (the React Native localStorage).
// Every hook instance sharing a key stays in sync, and writes are persisted.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'arena50:';
const cache = new Map<string, unknown>();
const loaded = new Set<string>();
const dirty = new Set<string>();
const loading = new Map<string, Promise<void>>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

function load(key: string): Promise<void> {
  const existing = loading.get(key);
  if (existing) return existing;
  const p = AsyncStorage.getItem(PREFIX + key)
    .then((raw) => {
      // A local write that happened before hydration wins over stale disk data.
      if (raw != null && !dirty.has(key)) {
        try {
          cache.set(key, JSON.parse(raw) as unknown);
          emit(key);
        } catch {
          /* ignore corrupt entries */
        }
      }
    })
    .catch(() => undefined)
    .finally(() => {
      loaded.add(key);
      emit(key);
    });
  loading.set(key, p);
  return p;
}

export function writeKey<T>(key: string, value: T): void {
  cache.set(key, value);
  dirty.add(key);
  emit(key);
  AsyncStorage.setItem(PREFIX + key, JSON.stringify(value)).catch(() => undefined);
}

export function readKey<T>(key: string, fallback: T): T {
  return cache.has(key) ? (cache.get(key) as T) : fallback;
}

export type Setter<T> = (next: T | ((prev: T) => T)) => void;

/** useState that survives app restarts. Returns [value, set, hydrated]. */
export function usePersisted<T>(key: string, initial: T | (() => T)): [T, Setter<T>, boolean] {
  const [, force] = useState(0);
  if (!cache.has(key)) {
    cache.set(key, typeof initial === 'function' ? (initial as () => T)() : initial);
  }

  useEffect(() => {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    const fn = () => force((n) => n + 1);
    set.add(fn);
    if (!loaded.has(key)) void load(key);
    return () => {
      set?.delete(fn);
    };
  }, [key]);

  const setter = useCallback<Setter<T>>(
    (next) => {
      const prev = cache.get(key) as T;
      const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeKey(key, value);
    },
    [key],
  );

  return [cache.get(key) as T, setter, loaded.has(key)];
}

export async function resetAll(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX)));
  cache.clear();
  dirty.clear();
  loading.clear();
  loaded.clear();
}
