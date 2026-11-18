import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toneOf } from '../../components/ModuleCard';
import { Scenery } from '../../components/Scenery';
import { useSoundboard } from '../../components/Soundboard';
import { useCoins, usePlays } from '../../lib/prefs';
import { CATEGORIES, MODULE_MAP, artOf } from '../../modules/registry';
import { C, F } from '../../theme';
import { Art, Chunky, Coins, Float, Plaque, StoneBtn } from '../../ui';

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { open } = useSoundboard();
  const coins = useCoins();
  const [, setPlays] = usePlays();
  const counted = useRef<string | null>(null);
  const def = id ? MODULE_MAP[id] : undefined;

  useEffect(() => {
    if (!def || counted.current === def.id) return;
    counted.current = def.id;
    setPlays((p) => ({ ...p, [def.id]: (p[def.id] ?? 0) + 1 }));
  }, [def, setPlays]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!def) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 80, alignItems: 'center', gap: 16, padding: 24 }]}>
        <Scenery variant="outdoor" />
        <Art name="eyes" size={110} />
        <Plaque>
          <Text style={styles.lost}>This island isn’t on the map</Text>
        </Plaque>
        <Chunky title="Back to the map" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const cat = CATEGORIES[def.cat];
  const tone = toneOf(def.id);
  const Body = def.Component;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Scenery variant="indoor" />
      <View style={styles.header}>
        <StoneBtn icon={ChevronLeft} onPress={back} size={46} label="Back" />
        <View style={{ flex: 1 }} />
        <StoneBtn art="speaker" onPress={open} size={46} label="Soundboard" />
        <Coins value={coins} />
      </View>
      {def.fullscreen ? (
        <>
          <Plaque pad={10} style={styles.fullTitle}>
            <Text style={styles.fullTitleText} numberOfLines={1}>
              {def.title}
            </Text>
          </Plaque>
          <View style={[styles.fullBody, { marginBottom: insets.bottom + 8 }]}>
            <Body color={cat.color} />
          </View>
        </>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingTop: 34, paddingBottom: insets.bottom + 40, width: '100%', maxWidth: 560, alignSelf: 'center', gap: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Plaque pad={18} style={{ paddingRight: 118 }}>
                <View style={[styles.catPill, { backgroundColor: tone }]}>
                  <Text style={styles.catText}>{cat.short.toUpperCase()}</Text>
                </View>
                <Text style={styles.title}>{def.title}</Text>
                <Text style={styles.blurb}>{def.blurb}</Text>
              </Plaque>
              <Float amp={6} duration={3000} sway={3} style={styles.art}>
                <Art name={artOf(def.id)} size={112} />
              </Float>
            </View>
            <Body color={cat.color} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.sky },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8 },
  catPill: { alignSelf: 'flex-start', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  catText: { color: '#fff', fontFamily: F.bold, fontSize: 11, letterSpacing: 0.7 },
  title: { color: C.stoneText, fontFamily: F.slab, fontSize: 28, lineHeight: 33 },
  blurb: { color: '#6E6B60', fontFamily: F.semi, fontSize: 14.5, lineHeight: 19, marginTop: 2 },
  art: { position: 'absolute', right: 2, top: -34 },
  fullTitle: { alignSelf: 'center', marginTop: 10, marginBottom: 10, paddingHorizontal: 22, borderRadius: 18 },
  fullTitleText: { color: C.stoneText, fontFamily: F.slab, fontSize: 22 },
  fullBody: { flex: 1, marginHorizontal: 10, borderRadius: 28, overflow: 'hidden' },
  lost: { color: C.stoneText, fontFamily: F.slab, fontSize: 22, textAlign: 'center' },
});
