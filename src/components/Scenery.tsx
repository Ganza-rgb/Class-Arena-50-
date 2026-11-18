import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { C } from '../theme';
import { Grad, useCalm } from '../ui';

/** A soft cloud built from overlapping circles, drifting slowly across the sky. */
function Cloud({ top, size, duration, delay, opacity = 0.95 }: { top: number; size: number; duration: number; delay: number; opacity?: number }) {
  const { width } = useWindowDimensions();
  const calm = useCalm();
  const [x] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (calm) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(x, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [calm, x, duration, delay]);
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-size * 1.6, width + size * 0.4] });
  const start = calm ? { left: width * 0.6 } : null;
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top, width: size * 1.6, height: size * 0.7, opacity }, start, { transform: [{ translateX: calm ? 0 : translateX }] }]}>
      <View style={[styles.puff, { width: size * 0.7, height: size * 0.7, left: 0, top: size * 0.12 }]} />
      <View style={[styles.puff, { width: size * 0.9, height: size * 0.9, left: size * 0.38, top: -size * 0.12 }]} />
      <View style={[styles.puff, { width: size * 0.62, height: size * 0.62, left: size * 0.95, top: size * 0.14 }]} />
      <View style={[styles.base, { width: size * 1.45, height: size * 0.36, left: size * 0.08, top: size * 0.42 }]} />
    </Animated.View>
  );
}

/** Outdoor = sky + rolling grass (the map). Indoor = sky band over a warm earth panel. */
export function Scenery({ variant }: { variant: 'outdoor' | 'indoor' }) {
  const { width } = useWindowDimensions();
  if (variant === 'indoor') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ height: 190 }}>
          <Grad colors={[C.sky2, C.sky]} angle="down" />
          <Cloud top={40} size={90} duration={70000} delay={0} />
          <Cloud top={120} size={70} duration={90000} delay={20000} opacity={0.8} />
        </View>
        <View style={{ flex: 1, marginTop: -40, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
          <Grad colors={['#5A3524', C.earth, '#2E1A10']} angle="down" />
        </View>
        <View style={[styles.grassLip, { width: width + 40 }]} />
      </View>
    );
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Grad colors={[C.sky2, C.sky, '#DDF3FB']} angle="down" />
      <View style={{ position: 'absolute', left: -60, right: -60, top: 300, bottom: -40, borderTopLeftRadius: 400, borderTopRightRadius: 320, overflow: 'hidden' }}>
        <Grad colors={['#86CF64', C.grass, C.grass2, '#3F8530']} angle="down" />
      </View>
      <View style={{ position: 'absolute', left: width * 0.35, right: -120, top: 270, height: 260, borderTopLeftRadius: 300, borderTopRightRadius: 200, overflow: 'hidden', opacity: 0.9 }}>
        <Grad colors={['#97D873', C.grass]} angle="down" />
      </View>
      <Cloud top={70} size={100} duration={80000} delay={0} />
      <Cloud top={180} size={70} duration={100000} delay={25000} opacity={0.85} />
      <Cloud top={20} size={60} duration={120000} delay={50000} opacity={0.7} />
    </View>
  );
}

const styles = StyleSheet.create({
  puff: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  base: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  grassLip: { position: 'absolute', left: -20, top: 180, height: 26, borderRadius: 20, backgroundColor: C.grass, opacity: 0 },
});
