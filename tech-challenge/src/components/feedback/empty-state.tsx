import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { colors } from '@/theme';

type EmptyStateProps = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description?: string;
};

export function EmptyState({ icon = 'file-tray-outline', title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8 py-12">
      <Ionicons name={icon} size={40} color={colors.neutral[400]} />
      <Typography variant="subtitle" className="text-center">
        {title}
      </Typography>
      {description ? (
        <Typography variant="small" className="text-center">
          {description}
        </Typography>
      ) : null}
    </View>
  );
}
