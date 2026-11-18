import { type ReactNode } from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Multi-touch friendly tap area. Pressable only allows one responder at a time,
 * which breaks same-screen 2-player games, so native uses raw touch events.
 */
export function TapZone({
  onTap,
  style,
  children,
  disabled,
}: {
  onTap: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  disabled?: boolean;
}) {
  if (Platform.OS === 'web') {
    return (
      <Pressable style={style} onPressIn={disabled ? undefined : onTap}>
        {children}
      </Pressable>
    );
  }
  return (
    <View
      style={style}
      onTouchStart={(e) => {
        if (disabled) return;
        const count = Math.max(1, e.nativeEvent.changedTouches?.length ?? 1);
        for (let i = 0; i < count; i++) onTap();
      }}
    >
      {children}
    </View>
  );
}
