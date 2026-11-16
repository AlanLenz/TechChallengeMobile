
import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import { HeroCard } from './hero-card';

type AnimatedHeroCardProps = {
  firstName: string;
  balance: number;
};

export function AnimatedHeroCard({
  firstName,
  balance,
}: AnimatedHeroCardProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <HeroCard
        firstName={firstName}
        balance={balance}
      />
    </Animated.View>
  );
}

