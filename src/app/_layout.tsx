import { Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { RobotoSlab_800ExtraBold, RobotoSlab_900Black } from '@expo-google-fonts/roboto-slab';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SoundboardProvider } from '../components/Soundboard';
import { usePrefs } from '../lib/prefs';
import { setEffects } from '../lib/sound';
import { C } from '../theme';

function EffectsSync() {
  const [prefs] = usePrefs();
  useEffect(() => {
    setEffects(prefs.sound, prefs.haptics);
  }, [prefs.sound, prefs.haptics]);
  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, RobotoSlab_800ExtraBold, RobotoSlab_900Black });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  return (
    <SafeAreaProvider style={{ backgroundColor: C.bg }}>
      <SoundboardProvider>
        <EffectsSync />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.sky }, animation: 'slide_from_right' }} />
      </SoundboardProvider>
    </SafeAreaProvider>
  );
}
