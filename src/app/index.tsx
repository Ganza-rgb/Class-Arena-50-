import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { Scenery } from '../components/Scenery';
import { BottomNav, NAV_H, TABS, type TabId } from '../components/Nav';
import { SoundboardPill } from '../components/Soundboard';
import { usePersisted } from '../lib/store';
import type { CategoryId } from '../modules/registry';
import { GamesTab } from '../screens/GamesTab';
import { HomeTab, type Go } from '../screens/HomeTab';
import { PartyTab } from '../screens/PartyTab';
import { RankingTab } from '../screens/RankingTab';
import { SettingsTab } from '../screens/SettingsTab';
import { C } from '../theme';

const MAX_W = 560;

export default function Shell() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentW = Math.min(width, MAX_W) - 32;
  const params = useLocalSearchParams<{ tab?: string }>();
  const [stored, setTab] = usePersisted<TabId>('meta:tab2', 'home');
  // Deep link (/?tab=ranking) wins until the user switches tabs.
  const [linked, setLinked] = useState<TabId | null>(() => TABS.find((t) => t.id === params.tab)?.id ?? null);
  const tab = linked ?? stored;
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [epoch, setEpoch] = useState(0);
  const scrollRef = useRef<ScrollViewInstance>(null);

  const switchTab = (t: TabId) => {
    setLinked(null);
    setTab(t);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const go: Go = (t, opts) => {
    if (opts?.cat) setCat(opts.cat);
    if (opts?.query !== undefined) setQuery(opts.query);
    switchTab(t);
  };

  return (
    <View key={epoch} style={[styles.root, { paddingTop: insets.top }]}>
      <Scenery variant={tab === 'home' ? 'outdoor' : 'indoor'} />
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: NAV_H + insets.bottom + 90, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={{ width: contentW }}>
          {tab === 'home' ? <Header onAvatar={() => switchTab('settings')} onSearch={() => go('games', { cat: 'all', query: '' })} /> : <View style={{ height: 4 }} />}
          {tab === 'home' ? <HomeTab width={contentW} go={go} /> : null}
          {tab === 'games' ? <GamesTab width={contentW} query={query} setQuery={setQuery} cat={cat} setCat={setCat} /> : null}
          {tab === 'ranking' ? <RankingTab /> : null}
          {tab === 'party' ? <PartyTab width={contentW} /> : null}
          {tab === 'settings' ? (
            <SettingsTab
              onReset={() => {
                setTab('home');
                setEpoch((e) => e + 1);
              }}
            />
          ) : null}
        </View>
      </ScrollView>
      <SoundboardPill bottom={NAV_H + Math.max(10, insets.bottom) + 14} />
      <BottomNav tab={tab} onChange={switchTab} bottom={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.sky },
});
