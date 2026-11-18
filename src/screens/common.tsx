import { Search, X } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';
import type { ArtKey } from '../lib/art';
import { C, F, ledge } from '../theme';
import { Art, Float, Plaque } from '../ui';

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search games & tools…',
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<TextInputInstance>(null);
  return (
    <Pressable style={styles.search} onPress={() => ref.current?.focus()}>
      <View>
        <Search size={20} color={C.stoneText} strokeWidth={2.6} />
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor="#A39E90"
        style={styles.input}
        returnKeyType="search"
        autoFocus={autoFocus}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <View>
            <X size={18} color={C.stoneText} />
          </View>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/** Section header on earth panels: 3D art + cream title + optional count. */
export function SectionHead({ title, art, count }: { title: string; art?: ArtKey; count?: number }) {
  return (
    <View style={styles.head}>
      {art ? <Art name={art} size={34} /> : null}
      <Text style={styles.headTitle} numberOfLines={1}>
        {title}
      </Text>
      {count !== undefined ? (
        <View style={styles.count}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Stone title plaque that sits across the sky band at the top of each tab. */
export function TabTitle({ title, sub, art }: { title: string; sub: string; art: ArtKey }) {
  return (
    <View style={{ marginTop: 34 }}>
      <Plaque pad={18} style={{ paddingRight: 120 }}>
        <Text style={styles.ttl}>{title}</Text>
        <Text style={styles.ttlSub}>{sub}</Text>
      </Plaque>
      <Float amp={6} duration={3000} sway={3} style={styles.ttlArt}>
        <Art name={art} size={112} />
      </Float>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, borderRadius: 18, paddingHorizontal: 16, backgroundColor: C.stone, boxShadow: `${ledge(C.stone, 5)}, 0px 8px 14px rgba(20,10,4,0.28)` },
  input: { flex: 1, color: '#4A473F', fontFamily: F.semi, fontSize: 16, height: '100%' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  headTitle: { color: C.text, fontFamily: F.slabBold, fontSize: 20, flexShrink: 1, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 },
  count: { backgroundColor: C.orange, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 1, boxShadow: ledge(C.orange, 3) },
  countText: { color: '#fff', fontFamily: F.bold, fontSize: 13 },
  ttl: { color: C.stoneText, fontFamily: F.slab, fontSize: 34, lineHeight: 40 },
  ttlSub: { color: '#6E6B60', fontFamily: F.semi, fontSize: 14.5, lineHeight: 19 },
  ttlArt: { position: 'absolute', right: 4, top: -40 },
});
