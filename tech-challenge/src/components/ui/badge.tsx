import { Text, View } from 'react-native';

import { cx } from '@/utils/cx';

export type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning';

const TONE_CONTAINER: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 dark:bg-neutral-800',
  success: 'bg-success-50 dark:bg-success-500/20',
  danger: 'bg-danger-50 dark:bg-danger-500/20',
  warning: 'bg-warning-50 dark:bg-warning-500/20',
};

const TONE_TEXT: Record<BadgeTone, string> = {
  neutral: 'text-neutral-700 dark:text-neutral-200',
  success: 'text-success-700 dark:text-success-100',
  danger: 'text-danger-700 dark:text-danger-100',
  warning: 'text-warning-600 dark:text-warning-100',
};

type BadgeProps = { label: string; tone?: BadgeTone };

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View className={cx('self-start rounded-full px-2.5 py-1', TONE_CONTAINER[tone])}>
      <Text className={cx('text-small font-medium', TONE_TEXT[tone])}>{label}</Text>
    </View>
  );
}
