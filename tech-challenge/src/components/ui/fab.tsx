import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, type AccessibilityRole } from 'react-native';

import { colors } from '@/theme';

type FloatingActionButtonProps = {
  onPress: () => void;
  onPressIn?: () => void;
  accessibilityLabel: string;
};

const SIZE = 56;

export function FloatingActionButton({ onPress, onPressIn, accessibilityLabel }: FloatingActionButtonProps) {
  return (
    <Pressable
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel}
      onPressIn={onPressIn}
      onPress={onPress}
      className="items-center justify-center rounded-full bg-primary-500 active:bg-primary-600"
      style={[
        {
          width: SIZE,
          height: SIZE,
        },
        Platform.select({
          web: { boxShadow: `0px 4px 8px ${colors.neutral[1000]}` },
          default: {
            shadowColor: colors.neutral[1000],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          },
        }),
      ]}>
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}
