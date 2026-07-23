import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { cx } from '@/utils/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-800 dark:active:bg-neutral-700',
  ghost: 'bg-transparent active:bg-neutral-100 dark:active:bg-neutral-800',
  danger: 'bg-danger-500 active:bg-danger-600',
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-neutral-900 dark:text-white',
  ghost: 'text-primary-500',
  danger: 'text-white',
};

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading, disabled, className, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      className={cx(
        'flex-row items-center justify-center rounded-xl px-4 py-3',
        VARIANT_CONTAINER[variant],
        isDisabled && 'opacity-50',
        className
      )}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : undefined} />
      ) : (
        <Text className={cx('text-body font-semibold', VARIANT_TEXT[variant])}>{label}</Text>
      )}
    </Pressable>
  );
}
