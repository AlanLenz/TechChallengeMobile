import { colors } from '@/theme';

/** Config presentacional do menu inferior — consumida por src/app/(tabs)/_layout.tsx. */
export const tabBarScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary[500],
  tabBarInactiveTintColor: colors.neutral[500],
  tabBarStyle: {
    borderTopColor: colors.neutral[200],
  },
} as const;
