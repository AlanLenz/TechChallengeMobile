import { View, type ViewProps } from 'react-native';

import { cx } from '@/utils/cx';

export function Card({ className, ...rest }: ViewProps) {
  return (
    <View
      className={cx(
        'rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
      {...rest}
    />
  );
}
