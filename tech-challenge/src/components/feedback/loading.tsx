import { ActivityIndicator, Animated, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { colors } from '@/theme';

export function Loading() {
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
  <Animated.View className="flex-1 items-center justify-center" style={{ opacity }} > 
  <ActivityIndicator color={colors.primary[500]} /> 
  </Animated.View>);
}
