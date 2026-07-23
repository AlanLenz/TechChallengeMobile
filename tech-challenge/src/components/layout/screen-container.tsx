import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cx } from '@/utils/cx';

type ScreenContainerProps = ViewProps & {
  children: ReactNode;
  edges?: Edge[];
};

export function ScreenContainer({ children, edges = ['top', 'bottom'], className, ...rest }: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-white dark:bg-black">
      <View className={cx('flex-1 px-screen-x', className)} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
