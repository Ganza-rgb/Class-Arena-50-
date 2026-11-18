import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SOUNDS, playSound, tap, type SoundId } from '../lib/sound';
import { C, F, R, glow } from '../theme';
import { Art, Grad, Row, Sheet, Txt } from '../ui';

const Ctx = createContext<{ open: () => void }>({ open: () => undefined });
export const useSoundboard = () => useContext(Ctx);

export function SoundboardProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [last, setLast] = useState<SoundId | null>(null);
  const value = useMemo(() => ({ open: () => setVisible(true) }), []);
  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet visible={visible} onClose={() => setVisible(false)} title="Soundboard">
        <Row wrap gap={10}>
          {SOUNDS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => {
                tap('heavy');
                playSound(s.id);
                setLast(s.id);
              }}
              style={({ pressed }) => [
                styles.pad,
                { boxShadow: glow(s.color, last === s.id ? 0.7 : 0.35, last === s.id ? 22 : 14), borderColor: last === s.id ? '#fff' : 'rgba(255,255,255,0.2)' },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Grad color={s.color} />
              <Art name={s.art} size={46} />
              <Text style={styles.label}>{s.label}</Text>
            </Pressable>
          ))}
        </Row>
        <Txt v="small" color={C.muted} center>
          Every sound is synthesised in-app. Spam responsibly.
        </Txt>
      </Sheet>
    </Ctx.Provider>
  );
}

export function SoundboardPill({ bottom }: { bottom: number }) {
  const { open } = useSoundboard();
  return (
    <Pressable
      onPress={() => {
        tap();
        open();
      }}
      style={({ pressed }) => [styles.pill, { bottom }, pressed && { transform: [{ scale: 0.96 }] }]}
      accessibilityLabel="Open soundboard"
    >
      <Grad colors={['#FFB45C', C.orange]} angle="down" />
      <Art name="speaker" size={22} />
      <Text style={styles.pillText}>Soundboard</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { width: '47%', flexGrow: 1, height: 104, borderRadius: R.lg, padding: 12, justifyContent: 'space-between', borderWidth: 1.5, overflow: 'hidden' },
  label: { color: '#fff', fontFamily: F.bold, fontSize: 15 },
  pill: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: R.pill,
    overflow: 'hidden',
    boxShadow: `inset 0px -5px 0px #C9640E, 0px 8px 16px rgba(30,15,5,0.35)`,
  },
  pillText: { color: '#fff', fontFamily: F.bold, fontSize: 14 },
});
