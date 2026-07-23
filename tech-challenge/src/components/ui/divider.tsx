import { View, type ViewProps } from 'react-native';

import { cx } from '@/utils/cx';

export function Divider({ className, ...rest }: ViewProps) {
  return <View className={cx('h-px w-full bg-neutral-100 dark:bg-neutral-800', className)} {...rest} />;
}
