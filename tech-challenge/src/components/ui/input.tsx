import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cx } from '@/utils/cx';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, secureTextEntry, ...rest },
  ref
) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
      ) : null}
      <View className="relative justify-center">
        <TextInput
          ref={ref}
          placeholderTextColor="#9AA0AC"
          secureTextEntry={secureTextEntry ? !isPasswordVisible : false}
          className={cx(
            'rounded-xl border bg-white px-4 py-3 text-body text-neutral-900 dark:bg-neutral-900 dark:text-white',
            secureTextEntry ? 'pr-12' : '',
            error ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700',
            className
          )}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsPasswordVisible((v) => !v)}
            hitSlop={12}
            className="absolute right-3.5 top-0 bottom-0 justify-center items-center"
            accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9AA0AC"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-small text-danger-500">{error}</Text> : null}
    </View>
  );
});
