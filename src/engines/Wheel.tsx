import { useRef, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { playSound, tap } from '../lib/sound';
import { rand, randInt } from '../lib/utils';
import { C, F, PALETTE } from '../theme';
import { Btn } from '../ui';

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Flat spinning wheel. Slice 0 starts at 12 o'clock, clockwise. */
export function Wheel({
  items,
  onResult,
  size = 290,
  colors = PALETTE,
  label = 'SPIN',
  color = C.teal,
}: {
  items: string[];
  onResult: (item: string, index: number) => void;
  size?: number;
  colors?: string[];
  label?: string;
  color?: string;
}) {
  const [rot] = useState(() => new Animated.Value(0));
  const total = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const n = Math.max(1, items.length);
  const r = size / 2;
  const seg = 360 / n;

  const spin = () => {
    if (spinning || items.length === 0) return;
    setSpinning(true);
    tap('heavy');
    const w = randInt(0, n - 1);
    const theta = w * seg + seg / 2 + (rand() - 0.5) * seg * 0.6;
    const want = (360 - theta + 360) % 360;
    const cur = total.current % 360;
    const delta = (want - cur + 360) % 360;
    total.current += 360 * 5 + delta;
    Animated.timing(rot, {
      toValue: total.current,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setSpinning(false);
      tap('success');
      playSound('rimshot');
      onResult(items[w] ?? '', w);
    });
  };

  const pt = (deg: number, rr: number) => ({ x: r + rr * Math.sin(rad(deg)), y: r - rr * Math.cos(rad(deg)) });
  const fontSize = n > 14 ? 9 : n > 9 ? 11 : 13;
  const maxChars = n > 14 ? 9 : 13;

  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <View style={{ width: size, height: size + 14 }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 14,
            width: size,
            height: size,
            transform: [{ rotate: rot.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }],
          }}
        >
          <Svg width={size} height={size}>
            {n === 1 ? (
              <Circle cx={r} cy={r} r={r - 1} fill={colors[0] ?? C.teal} />
            ) : (
              items.map((it, i) => {
                const a0 = i * seg;
                const a1 = (i + 1) * seg;
                const p0 = pt(a0, r - 1);
                const p1 = pt(a1, r - 1);
                const large = seg > 180 ? 1 : 0;
                const mid = a0 + seg / 2;
                const lp = pt(mid, r * 0.6);
                const fill = colors[i % colors.length] ?? C.teal;
                return (
                  <G key={`${it}-${i}`}>
                    <Path d={`M ${r} ${r} L ${p0.x} ${p0.y} A ${r - 1} ${r - 1} 0 ${large} 1 ${p1.x} ${p1.y} Z`} fill={fill} stroke={C.bg} strokeWidth={2} />
                    <SvgText
                      x={lp.x}
                      y={lp.y + fontSize / 3}
                      fill={C.text}
                      fontSize={fontSize}
                      fontFamily={F.semi}
                      fontWeight="600"
                      textAnchor="middle"
                      transform={`rotate(${mid > 180 ? mid + 90 : mid - 90} ${lp.x} ${lp.y})`}
                    >
                      {it.length > maxChars ? `${it.slice(0, maxChars - 1)}…` : it}
                    </SvgText>
                  </G>
                );
              })
            )}
            <Circle cx={r} cy={r} r={r * 0.13} fill={C.bg} stroke={C.border} strokeWidth={2} />
          </Svg>
        </Animated.View>
        {/* pointer */}
        <View style={{ position: 'absolute', top: 0, left: r - 12, width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.text }} />
      </View>
      <Btn title={spinning ? 'Spinning…' : label} onPress={spin} disabled={spinning || items.length === 0} color={color} style={{ minWidth: 180 }} />
    </View>
  );
}
