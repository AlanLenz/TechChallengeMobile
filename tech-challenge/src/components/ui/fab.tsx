import { Ionicons } from '@expo/vector-icons';
import { Pressable, type AccessibilityRole } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

type FloatingActionButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
};

const SIZE = 56;

export function FloatingActionButton({ onPress, accessibilityLabel }: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="absolute right-5 items-center justify-center rounded-full bg-primary-500 active:bg-primary-600"
      style={{
        width: SIZE,
        height: SIZE,
        bottom: insets.bottom,
        shadowColor: colors.neutral[1000],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      }}>
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}
