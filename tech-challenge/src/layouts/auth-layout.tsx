import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/screen-container';
import { Typography } from '@/components/ui/typography';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <ScreenContainer className="px-screen-x">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            gap: 32,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            <Typography variant="display">{title}</Typography>
            {subtitle ? <Typography variant="small">{subtitle}</Typography> : null}
          </View>
          <View className="gap-4">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
