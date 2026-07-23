import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/theme';

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color={colors.primary[500]} />
    </View>
  );
}
