import { useEffect } from 'react';
import type { ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { cx } from '@/utils/cx';

export function Skeleton({ className, style, ...rest }: ViewProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[animatedStyle, style]}
      className={cx('rounded-lg bg-neutral-200 dark:bg-neutral-800', className)}
      {...rest}
    />
  );
}
