import type { ArtKey } from './art';
import { usePersisted } from './store';

export type Profile = { name: string; avatar: ArtKey };
export type Prefs = { sound: boolean; haptics: boolean };

export const AVATARS: ArtKey[] = ['av-1', 'av-2', 'av-3', 'av-4', 'av-5', 'av-6', 'av-7', 'av-8', 'av-9', 'av-10', 'av-11', 'av-12'];

export function useProfile() {
  return usePersisted<Profile>('meta:profile', { name: 'Player One', avatar: 'av-1' });
}

export function usePrefs() {
  return usePersisted<Prefs>('meta:prefs', { sound: true, haptics: true });
}

export function usePlays() {
  return usePersisted<Record<string, number>>('meta:plays', {});
}

/** Timestamp of the last time the notification sheet was opened. */
export function useSeenAt() {
  return usePersisted<number>('meta:seen-at', () => Date.now() - 2.5 * 3600_000);
}

/** Coins: everyone starts with 120 and earns 15 per game opened. */
export function useCoins(): number {
  const [plays] = usePlays();
  return 120 + Object.values(plays).reduce((s, n) => s + n, 0) * 15;
}
