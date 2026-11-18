import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../components/Header';
import { RosterScreen } from '../components/Roster';
import type { ArtKey } from '../lib/art';
import { AVATARS, useCoins, usePrefs, useProfile } from '../lib/prefs';
import { tap } from '../lib/sound';
import { resetAll } from '../lib/store';
import { C, F, ledge, shade } from '../theme';
import { Art, Chunky, Float, Plaque } from '../ui';
import { SectionHead } from './common';

/** Chunky green/grey pill switch. */
function Toggle({ on, onChange, label, sub, art }: { on: boolean; onChange: (v: boolean) => void; label: string; sub: string; art: ArtKey }) {
  const track = on ? C.green : '#7A6A5C';
  return (
    <Pressable
      onPress={() => {
        tap();
        onChange(!on);
      }}
      style={styles.row}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
    >
      <Art name={art} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: track, boxShadow: `inset 0px -4px 0px ${shade(track, -0.25)}` }]}>
        <View style={[styles.knob, { alignSelf: on ? 'flex-end' : 'flex-start' }]} />
      </View>
    </Pressable>
  );
}

export function SettingsTab({ onReset }: { onReset: () => void }) {
  const [profile, setProfile] = useProfile();
  const [prefs, setPrefs] = usePrefs();
  const coins = useCoins();
  const [confirm, setConfirm] = useState(false);

  return (
    <View style={{ gap: 16 }}>
      <View style={{ marginTop: 60 }}>
        <Float amp={4} duration={2400} style={styles.eyes}>
          <Art name="eyes" size={96} />
        </Float>
        <Plaque pad={20} style={{ alignItems: 'center', paddingTop: 34 }}>
          <Text style={styles.plaqueTitle}>Class Settings</Text>
        </Plaque>
      </View>

      <View style={styles.profile}>
        <Avatar art={profile.avatar} size={84} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.label}>YOUR ARENA NAME</Text>
          <TextInput value={profile.name} onChangeText={(name) => setProfile({ ...profile, name })} maxLength={24} style={styles.name} placeholder="Player One" placeholderTextColor="#C7A888" />
          <Text style={styles.meta}>{coins.toLocaleString()} coins earned</Text>
        </View>
      </View>

      <SectionHead title="Pick your mascot" art="av-5" />
      <View style={styles.avatars}>
        {AVATARS.map((a) => {
          const on = profile.avatar === a;
          const bg = on ? C.orange : C.stone;
          return (
            <Pressable
              key={a}
              onPress={() => {
                tap();
                setProfile({ ...profile, avatar: a });
              }}
              style={({ pressed }) => [styles.avatar, { backgroundColor: bg, boxShadow: `${ledge(bg, 5)}, 0px 6px 10px rgba(20,10,4,0.25)` }, pressed && { transform: [{ translateY: 2 }] }]}
              accessibilityLabel={`Mascot ${a}`}
            >
              <Art name={a} size={60} />
            </Pressable>
          );
        })}
      </View>

      <SectionHead title="Sound & feel" art="speaker" />
      <Toggle art="notes" label="Sound FX" sub="Soundboard and game sounds" on={prefs.sound} onChange={(sound) => setPrefs({ ...prefs, sound })} />
      <Toggle art="tap-battle" label="Haptics" sub="Little buzz on taps (phones only)" on={prefs.haptics} onChange={(haptics) => setPrefs({ ...prefs, haptics })} />

      <SectionHead title="Your class" art="who-in-class" />
      <RosterScreen />

      <SectionHead title="Data" art="trash" />
      <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
        <Text style={styles.rowSub}>Crushes, confessions, scores, drops and the roster are stored only on this phone.</Text>
        {confirm ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Chunky
              small
              title="Wipe it all"
              color={C.coral}
              style={{ flex: 1 }}
              onPress={() => {
                setConfirm(false);
                resetAll()
                  .catch(() => undefined)
                  .finally(onReset);
              }}
            />
            <Chunky small title="Cancel" color={C.slate} style={{ flex: 1 }} onPress={() => setConfirm(false)} />
          </View>
        ) : (
          <Chunky small title="Reset all app data" color={C.coral} onPress={() => setConfirm(true)} />
        )}
      </View>

      <Text style={styles.credits}>Class Arena · original 3D art modelled in-house · music previews & charts from Apple Music · memes via Reddit · templates from Imgflip · sounds synthesised in-app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyes: { position: 'absolute', alignSelf: 'center', top: -56, zIndex: 2 },
  plaqueTitle: { color: C.stoneText, fontFamily: F.slab, fontSize: 40, lineHeight: 46 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 24, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  label: { color: '#FFB066', fontFamily: F.bold, fontSize: 12, letterSpacing: 0.8 },
  name: { color: C.text, fontFamily: F.slab, fontSize: 26, paddingVertical: 2 },
  meta: { color: C.textDim, fontFamily: F.semi, fontSize: 14 },
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatar: { width: '22%', flexGrow: 1, aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  rowTitle: { color: '#FFE7C6', fontFamily: F.bold, fontSize: 18 },
  rowSub: { color: C.textDim, fontFamily: F.medium, fontSize: 13.5, lineHeight: 18 },
  track: { width: 70, height: 38, borderRadius: 19, padding: 4, justifyContent: 'center' },
  knob: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', boxShadow: '0px 3px 4px rgba(0,0,0,0.3)' },
  credits: { color: C.muted, fontFamily: F.medium, fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: 4 },
});
