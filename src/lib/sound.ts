import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type SoundId = 'airhorn' | 'goal' | 'boo' | 'whistle' | 'trombone' | 'rimshot' | 'boom' | 'heartbeat';

export const SOUNDS: { id: SoundId; label: string; art: 's-airhorn' | 's-goal' | 's-boo' | 's-whistle' | 's-trombone' | 's-rimshot' | 's-boom' | 's-heartbeat'; color: string }[] = [
  { id: 'airhorn', label: 'Airhorn', art: 's-airhorn', color: '#F59E0B' },
  { id: 'goal', label: 'Goal Roar', art: 's-goal', color: '#3B82F6' },
  { id: 'boo', label: 'Crowd Boo', art: 's-boo', color: '#F43F5E' },
  { id: 'whistle', label: 'Whistle', art: 's-whistle', color: '#14B8A6' },
  { id: 'trombone', label: 'Sad Trombone', art: 's-trombone', color: '#8B5CF6' },
  { id: 'rimshot', label: 'Rimshot', art: 's-rimshot', color: '#F97316' },
  { id: 'boom', label: 'Dramatic Boom', art: 's-boom', color: '#EC4899' },
  { id: 'heartbeat', label: 'Heartbeat', art: 's-heartbeat', color: '#D946EF' },
];

const SOURCES: Record<SoundId, number> = {
  airhorn: require('../../assets/sounds/airhorn.wav') as number,
  goal: require('../../assets/sounds/goal.wav') as number,
  boo: require('../../assets/sounds/boo.wav') as number,
  whistle: require('../../assets/sounds/whistle.wav') as number,
  trombone: require('../../assets/sounds/trombone.wav') as number,
  rimshot: require('../../assets/sounds/rimshot.wav') as number,
  boom: require('../../assets/sounds/boom.wav') as number,
  heartbeat: require('../../assets/sounds/heartbeat.wav') as number,
};

const players = new Map<SoundId, AudioPlayer>();
let modeSet = false;
let soundOn = true;
let hapticsOn = true;

/** Global switches, driven by the Settings screen. */
export function setEffects(sound: boolean, haptics: boolean): void {
  soundOn = sound;
  hapticsOn = haptics;
}

export function playSound(id: SoundId): void {
  if (!soundOn) return;
  try {
    if (!modeSet) {
      modeSet = true;
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    }
    let p = players.get(id);
    if (!p) {
      p = createAudioPlayer(SOURCES[id]);
      players.set(id, p);
    }
    const player = p;
    player
      .seekTo(0)
      .catch(() => undefined)
      .finally(() => player.play());
  } catch {
    /* audio is best-effort; never crash a game over it */
  }
}

export function stopSound(id: SoundId): void {
  try {
    players.get(id)?.pause();
  } catch {
    /* ignore */
  }
}

export function tap(kind: 'light' | 'heavy' | 'success' | 'error' = 'light'): void {
  if (Platform.OS === 'web' || !hapticsOn) return;
  const run = (): Promise<void> => {
    switch (kind) {
      case 'heavy':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      default:
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  run().catch(() => undefined);
}
