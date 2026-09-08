import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';
import { cx } from '@/utils/cx';

import { Modal } from './modal';
import { Typography } from './typography';

type SelectOption<T extends string | number> = { value: T; label: string };

type SelectProps<T extends string | number> = {
  label?: string;
  placeholder?: string;
  value?: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
};

export function Select<T extends string | number>({
  label,
  placeholder = 'Selecione',
  value,
  options,
  onChange,
  error,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        className={cx(
          'flex-row items-center justify-between rounded-xl border bg-white px-4 py-3 dark:bg-neutral-900',
          error ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700'
        )}>
        <Text
          className={cx(
            'text-body',
            selected ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
          )}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.neutral[400]} />
      </Pressable>
      {error ? <Text className="text-small text-danger-500">{error}</Text> : null}

      <Modal visible={open} onRequestClose={() => setOpen(false)} className="max-h-[70%] gap-2">
        {label ? (
          <Typography variant="subtitle" className="px-2 pb-2">
            {label}
          </Typography>
        ) : null}
        <FlatList
          data={options}
          keyExtractor={(option) => String(option.value)}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className="flex-row items-center justify-between rounded-xl px-4 py-3 active:bg-neutral-100 dark:active:bg-neutral-800">
              <Text className="text-body text-neutral-900 dark:text-white">{item.label}</Text>
              {item.value === value ? (
                <Ionicons name="checkmark" size={20} color={colors.primary[500]} />
              ) : null}
            </Pressable>
          )}
        />
      </Modal>
    </View>
  );
}
