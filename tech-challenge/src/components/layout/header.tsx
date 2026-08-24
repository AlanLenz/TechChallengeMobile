import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';

type HeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function Header({ title, onBack, right }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between bg-primary-500 px-screen-x py-3">
      <View className="w-8">
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
      <Typography variant="subtitle" className="text-white dark:text-white">
        {title}
      </Typography>
      <View className="w-8 items-end">{right}</View>
    </View>
  );
}
