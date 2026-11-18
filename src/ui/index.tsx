import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { X } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Classmate } from '../data/seed';
import { ART, type ArtKey } from '../lib/art';
import { tap } from '../lib/sound';
import { firstName } from '../lib/utils';
import { C, F, R, S, glow, grad, ledge, shade } from '../theme';

// ---------- 3D art & gradients ----------
export function Art({ name, size = 48, style }: { name: ArtKey; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Image source={ART[name]} style={{ width: size, height: size }} contentFit="contain" />
    </View>
  );
}

/** Absolute gradient fill for the parent (parent needs overflow hidden + radius). */
export function Grad({ color, colors, angle = 'diag' }: { color?: string; colors?: readonly [string, string, ...string[]]; angle?: 'diag' | 'down' | 'right' }) {
  const c = colors ?? grad(color ?? C.violet);
  const end = angle === 'down' ? { x: 0, y: 1 } : angle === 'right' ? { x: 1, y: 0 } : { x: 1, y: 1 };
  return <LinearGradient colors={c} start={{ x: 0, y: 0 }} end={end} style={StyleSheet.absoluteFill} pointerEvents="none" />;
}

// ---------- Text ----------
type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'big';
const variantStyle: Record<Variant, TextStyle> = {
  big: { fontFamily: F.display, fontSize: 54, lineHeight: 60, letterSpacing: -1.6 },
  display: { fontFamily: F.display, fontSize: 29, lineHeight: 34, letterSpacing: -0.8 },
  h1: { fontFamily: F.bold, fontSize: 22, lineHeight: 27 },
  h2: { fontFamily: F.bold, fontSize: 18, lineHeight: 23 },
  h3: { fontFamily: F.semi, fontSize: 16, lineHeight: 21 },
  body: { fontFamily: F.medium, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: F.medium, fontSize: 13.5, lineHeight: 18 },
  label: { fontFamily: F.bold, fontSize: 12, lineHeight: 15, letterSpacing: 0.8, textTransform: 'uppercase' },
};

export function Txt({
  v = 'body',
  color = C.text,
  center,
  style,
  children,
  numberOfLines,
}: {
  v?: Variant;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} style={[variantStyle[v], { color }, center && { textAlign: 'center' }, style]}>
      {children}
    </Text>
  );
}

// ---------- Layout ----------
export function Row({ children, gap = S.sm, style, wrap }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle>; wrap?: boolean }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, wrap && { flexWrap: 'wrap' }, style]}>{children}</View>;
}

export function Col({ children, gap = S.md, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

/** Glass card; pass `color` for a glowing gradient card. */
export function Card({
  children,
  color,
  style,
  onPress,
  pad = S.lg,
}: {
  children: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  pad?: number;
}) {
  const base: StyleProp<ViewStyle> = [styles.card, { padding: pad }, color ? { borderColor: 'rgba(255,255,255,0.16)', boxShadow: glow(color, 0.35, 26) } : null, style];
  const body = (
    <>
      {color ? <Grad color={color} /> : null}
      {children}
    </>
  );
  if (!onPress) return <View style={base}>{body}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}>
      {body}
    </Pressable>
  );
}

// ---------- Buttons ----------
export function Btn({
  title,
  onPress,
  color = C.primary,
  variant = 'solid',
  icon: Icon,
  art,
  small,
  disabled,
  flex,
  style,
  textColor,
}: {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  icon?: LucideIcon;
  art?: ArtKey;
  small?: boolean;
  disabled?: boolean;
  flex?: boolean;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}) {
  const solid = variant === 'solid';
  const fg = textColor ?? (solid ? '#FFFFFF' : color === C.slate ? C.textDim : color);
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        solid && { borderColor: 'rgba(255,255,255,0.22)', boxShadow: disabled ? undefined : `${ledge(color)}, ${glow(color)}` },
        variant === 'outline' && { borderColor: color === C.slate ? C.borderStrong : color, backgroundColor: C.glass },
        variant === 'ghost' && { borderColor: 'transparent' },
        flex && { flex: 1 },
        pressed && { transform: [{ translateY: 3 }], boxShadow: solid ? ledge(color, 2) : undefined },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {solid ? <Grad color={color} angle="right" /> : null}
      {art ? <Art name={art} size={small ? 18 : 22} /> : null}
      {Icon ? (
        <View>
          <Icon size={small ? 15 : 18} color={fg} strokeWidth={2.4} />
        </View>
      ) : null}
      <Text style={[styles.btnText, small && { fontSize: 14 }, { color: fg }, solid && styles.btnShadow]} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}

export function IconBtn({
  icon: Icon,
  onPress,
  color = C.text,
  bg,
  size = 40,
  label,
}: {
  icon: LucideIcon;
  onPress: () => void;
  color?: string;
  bg?: string;
  size?: number;
  label?: string;
}) {
  const gradient = bg && bg !== C.card && bg !== C.card2 && bg.startsWith('#');
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      hitSlop={6}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: gradient ? undefined : (bg ?? C.glass) },
        gradient && bg ? { boxShadow: glow(bg, 0.4, 14), borderColor: 'rgba(255,255,255,0.18)' } : null,
        pressed && { opacity: 0.75 },
      ]}
    >
      {gradient && bg ? <Grad color={bg} /> : null}
      <View>
        <Icon size={size * 0.46} color={color} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color = C.primary,
  small,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={
        onPress
          ? () => {
              tap();
              onPress();
            }
          : undefined
      }
      style={({ pressed }) => [
        styles.chip,
        small && { paddingVertical: 6, paddingHorizontal: 11 },
        active && { borderColor: 'rgba(255,255,255,0.2)', boxShadow: glow(color, 0.35, 12) },
        pressed && { opacity: 0.8 },
      ]}
    >
      {active ? <Grad color={color} angle="right" /> : null}
      <Text style={[styles.chipText, small && { fontSize: 12 }, { color: active ? '#FFFFFF' : C.textDim }]}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, color, textColor = C.text, art }: { label: string; color?: string; textColor?: string; art?: ArtKey }) {
  const solid = !!color && color.startsWith('#') && color !== C.bg && color !== C.card && color !== C.card2;
  return (
    <View style={[styles.tag, !solid && { backgroundColor: color ?? 'rgba(10,6,18,0.45)', borderColor: C.border }, solid && { borderColor: 'rgba(255,255,255,0.18)' }]}>
      {solid && color ? <Grad color={color} angle="right" /> : null}
      {art ? <Art name={art} size={14} /> : null}
      <Text style={[styles.tagText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// ---------- Inputs ----------
export function Field({ label, style, ...rest }: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Txt v="label" color={C.muted}>
          {label}
        </Txt>
      ) : null}
      <TextInput placeholderTextColor={C.muted} style={[styles.input, rest.multiline && { minHeight: 90, textAlignVertical: 'top' }, style]} {...rest} />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  color = C.primary,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  color?: string;
}) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              tap();
              onChange(o.value);
            }}
            style={[styles.segItem, on && { boxShadow: glow(color, 0.4, 12) }]}
          >
            {on ? <Grad color={color} angle="right" /> : null}
            <Text style={[styles.segText, { color: on ? '#FFFFFF' : C.muted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99, color = C.primary }: { value: number; onChange: (n: number) => void; min?: number; max?: number; color?: string }) {
  return (
    <Row gap={6}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={[styles.step, { borderColor: C.border, backgroundColor: C.glass }]}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Txt v="h1" style={{ minWidth: 34, textAlign: 'center' }}>
        {value}
      </Txt>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={[styles.step, { borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', boxShadow: glow(color, 0.4, 10) }]}>
        <Grad color={color} />
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </Row>
  );
}

// ---------- Display ----------
export function Stat({ label, value, color = C.text }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.stat}>
      <Txt v="h1" color={color}>
        {value}
      </Txt>
      <Txt v="label" color={C.muted}>
        {label}
      </Txt>
    </View>
  );
}

export function Bar({ pct, color = C.primary, height = 8, track = 'rgba(255,255,255,0.08)' }: { pct: number; color?: string; height?: number; track?: string }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', borderRadius: height, overflow: 'hidden' }}>
        <Grad color={color} angle="right" />
      </View>
    </View>
  );
}

export function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: S.sm }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="label" color={C.muted}>
          {title}
        </Txt>
        {right}
      </Row>
      {children}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Txt v="small" color={C.muted} center>
        {text}
      </Txt>
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: C.border }} />;
}

// ---------- Sheet ----------
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap} pointerEvents="box-none">
        <View style={[styles.sheet, { paddingBottom: insets.bottom + S.lg }]}>
          <View style={styles.grabber} />
          <Row style={{ justifyContent: 'space-between', marginBottom: S.md }}>
            <Txt v="h1">{title}</Txt>
            <IconBtn icon={X} onPress={onClose} size={34} label="Close" />
          </Row>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 520 }} contentContainerStyle={{ gap: S.md }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- Roster pickers ----------
export function PeoplePicker({
  people,
  selected,
  onToggle,
  color = C.primary,
}: {
  people: Classmate[];
  selected: string[];
  onToggle: (name: string) => void;
  color?: string;
}) {
  return (
    <Row wrap gap={6}>
      {people.map((p) => (
        <Chip key={p.id} small label={firstName(p.name)} active={selected.includes(firstName(p.name))} onPress={() => onToggle(firstName(p.name))} color={color} />
      ))}
    </Row>
  );
}

export function shareText(message: string): void {
  Share.share({ message }).catch(() => undefined);
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.glass, borderColor: C.border, borderWidth: 1, borderRadius: R.lg, overflow: 'hidden' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 13 },
  btnText: { fontFamily: F.bold, fontSize: 17 },
  btnShadow: { textShadowColor: 'rgba(60,25,0,0.35)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 0 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, backgroundColor: C.glass, overflow: 'hidden' },
  chipText: { fontFamily: F.semi, fontSize: 13 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: R.pill, borderWidth: 1, overflow: 'hidden' },
  tagText: { fontFamily: F.bold, fontSize: 10, letterSpacing: 0.7 },
  input: {
    backgroundColor: C.glass,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: R.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontFamily: F.medium,
    fontSize: 15,
  },
  seg: { flexDirection: 'row', backgroundColor: C.glass, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, padding: 4 },
  segItem: { flex: 1, paddingVertical: 9, borderRadius: R.pill, alignItems: 'center', overflow: 'hidden' },
  segText: { fontFamily: F.bold, fontSize: 13 },
  step: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: C.text, fontSize: 20, fontFamily: F.bold, lineHeight: 22 },
  stat: { flex: 1, backgroundColor: C.glass, borderColor: C.border, borderWidth: 1, borderRadius: R.md, padding: S.md, alignItems: 'center', gap: 2 },
  empty: { padding: S.xl, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.02)' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,2,12,0.75)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.bg2,
    borderTopLeftRadius: R.xl + 4,
    borderTopRightRadius: R.xl + 4,
    borderWidth: 1,
    borderColor: C.borderStrong,
    padding: S.lg,
    paddingTop: 10,
    boxShadow: '0px -10px 40px rgba(168,85,247,0.25)',
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 10 },
});


// ================================================================ Campus Quest blocks
/** Respect the OS "reduce motion" setting for idle animations. */
export function useCalm(): boolean {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (alive) setCalm(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setCalm);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return calm;
}

/** Gentle idle bob (and optional sway) so the world feels alive. */
export function Float({ children, amp = 5, duration = 2600, delay = 0, sway = 0, style }: { children: ReactNode; amp?: number; duration?: number; delay?: number; sway?: number; style?: StyleProp<ViewStyle> }) {
  const calm = useCalm();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (calm) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [calm, v, duration, delay]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -amp] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: [`${-sway}deg`, `${sway}deg`] });
  return <Animated.View style={[style, { transform: [{ translateY }, { rotate }] }]}>{children}</Animated.View>;
}

/** Light stone plaque with a carved bottom edge (Campus Quest signature). */
export function Plaque({ children, style, pad = 16, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; pad?: number; onPress?: () => void }) {
  const base: StyleProp<ViewStyle> = [qs.plaque, { padding: pad }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [base, pressed && { transform: [{ translateY: 3 }], boxShadow: ledge(C.stone, 3) }]}
    >
      {children}
    </Pressable>
  );
}

/** Round stone button holding a 3D icon or a lucide icon. */
export function StoneBtn({ art, icon: Icon, onPress, size = 50, label, badge, active }: { art?: ArtKey; icon?: LucideIcon; onPress: () => void; size?: number; label?: string; badge?: number; active?: boolean }) {
  const bg = active ? C.orange : C.stone;
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      hitSlop={6}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size * 0.36, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, boxShadow: `${ledge(bg, 5)}, 0px 6px 12px rgba(30,15,5,0.28)` },
        pressed && { transform: [{ translateY: 3 }], boxShadow: ledge(bg, 2) },
      ]}
    >
      {art ? <Art name={art} size={size * 0.68} /> : null}
      {Icon ? (
        <View>
          <Icon size={size * 0.44} color={active ? '#fff' : C.stoneText} strokeWidth={2.8} />
        </View>
      ) : null}
      {badge ? (
        <View style={qs.badge}>
          <Text style={qs.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Brown coin counter pill with a 3D gold coin. */
export function Coins({ value }: { value: number }) {
  return (
    <View style={qs.coins}>
      <Text style={qs.coinsText}>{value.toLocaleString()}</Text>
      <View style={qs.coin}>
        <Text style={qs.coinC}>C</Text>
      </View>
    </View>
  );
}

/** Big chunky orange/gold CTA in the Campus Quest style. */
export function Chunky({ title, onPress, color = C.orange, art, style, small }: { title: string; onPress: () => void; color?: string; art?: ArtKey; style?: StyleProp<ViewStyle>; small?: boolean }) {
  return (
    <Pressable
      onPress={() => {
        tap('heavy');
        onPress();
      }}
      style={({ pressed }) => [
        qs.chunky,
        small && { paddingVertical: 10, borderRadius: 16 },
        { boxShadow: `${ledge(color, 7)}, 0px 10px 18px rgba(30,15,5,0.3)` },
        pressed && { transform: [{ translateY: 4 }], boxShadow: ledge(color, 3) },
        style,
      ]}
    >
      <Grad colors={[shade(color, 0.25), color]} angle="down" />
      {art ? <Art name={art} size={small ? 24 : 30} /> : null}
      <Text style={[qs.chunkyText, small && { fontSize: 18 }, color === C.gold && { color: '#6B3F00', textShadowColor: 'rgba(255,255,255,0.35)' }]}>{title}</Text>
    </Pressable>
  );
}

const qs = StyleSheet.create({
  plaque: {
    backgroundColor: C.stone,
    borderRadius: 26,
    boxShadow: `inset 0px -7px 0px ${C.stone2}, 0px 12px 22px rgba(30,15,5,0.3)`,
  },
  badge: { position: 'absolute', top: -5, right: -5, minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: 10, backgroundColor: C.live, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontFamily: F.bold, fontSize: 11 },
  coins: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#8E3A14', borderRadius: 14, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, boxShadow: `inset 0px -4px 0px #6A2A0C, 0px 6px 12px rgba(30,15,5,0.3)` },
  coinsText: { color: '#FFE7B8', fontFamily: F.bold, fontSize: 18 },
  coin: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.gold, borderWidth: 2, borderColor: '#B37800', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0px -3px 0px #C98A00' },
  coinC: { color: '#8A5A00', fontFamily: F.bold, fontSize: 15 },
  chunky: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 20, overflow: 'hidden' },
  chunkyText: { color: '#FFF3DF', fontFamily: F.slabBold, fontSize: 24, textShadowColor: 'rgba(90,40,0,0.35)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 },
});
