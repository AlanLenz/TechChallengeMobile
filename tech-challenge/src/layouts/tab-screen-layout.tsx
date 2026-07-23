import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';

type TabScreenLayoutProps = {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

export function TabScreenLayout({ title, headerRight, children }: TabScreenLayoutProps) {
  return (
    <ScreenContainer edges={['top']} className="gap-4 px-0">
      <Header title={title} right={headerRight} />
      <View className="flex-1 px-screen-x">{children}</View>
    </ScreenContainer>
  );
}
