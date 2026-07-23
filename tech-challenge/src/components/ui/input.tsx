import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { cx } from '@/utils/cx';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, ...rest },
  ref
) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#9AA0AC"
        className={cx(
          'rounded-xl border bg-white px-4 py-3 text-body text-neutral-900 dark:bg-neutral-900 dark:text-white',
          error ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700',
          className
        )}
        {...rest}
      />
      {error ? <Text className="text-small text-danger-500">{error}</Text> : null}
    </View>
  );
});
