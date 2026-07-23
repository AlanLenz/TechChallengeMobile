import { Text, type TextProps } from 'react-native';

import { cx } from '@/utils/cx';

export type TypographyVariant = 'display' | 'title' | 'subtitle' | 'body' | 'small';

const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  display: 'text-display font-bold text-neutral-900 dark:text-white',
  title: 'text-title font-bold text-neutral-900 dark:text-white',
  subtitle: 'text-subtitle font-semibold text-neutral-900 dark:text-white',
  body: 'text-body text-neutral-900 dark:text-white',
  small: 'text-small text-neutral-500 dark:text-neutral-400',
};

type TypographyProps = TextProps & { variant?: TypographyVariant };

export function Typography({ variant = 'body', className, ...rest }: TypographyProps) {
  return <Text className={cx(VARIANT_CLASSES[variant], className)} {...rest} />;
}
