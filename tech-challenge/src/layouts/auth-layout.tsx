import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ScreenContainer } from '@/components/layout/screen-container';
import { Typography } from '@/components/ui/typography';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <ScreenContainer className="justify-center gap-8">
      <View className="gap-2">
        <Typography variant="display">{title}</Typography>
        {subtitle ? <Typography variant="small">{subtitle}</Typography> : null}
      </View>
      <View className="gap-4">{children}</View>
    </ScreenContainer>
  );
}
