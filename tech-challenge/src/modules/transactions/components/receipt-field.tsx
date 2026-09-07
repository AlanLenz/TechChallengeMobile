import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { colors } from '@/theme';

import { useReceiptPicker } from '../hooks/use-receipt-picker';
import type { TransactionReceipt } from '../types';
import { formatFileSize, type ReceiptFileInput } from '../utils';

type ReceiptFieldProps = {
  /** Arquivo recém-selecionado, ainda não enviado. */
  receiptFile?: ReceiptFileInput;
  /** Comprovante já enviado (tela de edição). */
  receipt?: TransactionReceipt;
  onPickFile: (file: ReceiptFileInput) => void;
  onRemove: () => void;
  /** Erro vindo da validação do formulário. */
  error?: string;
  isUploading?: boolean;
  disabled?: boolean;
};

function isPdf(nameOrType: string): boolean {
  return nameOrType.toLowerCase().includes('pdf');
}

export function ReceiptField({
  receiptFile,
  receipt,
  onPickFile,
  onRemove,
  error,
  isUploading,
  disabled,
}: ReceiptFieldProps) {
  const { pickReceipt, isPicking, error: pickError, clearError } = useReceiptPicker({ onPick: onPickFile });

  const actionsDisabled = disabled || isUploading || isPicking;
  const message = error ?? pickError;

  const handlePick = () => {
    clearError();
    void pickReceipt();
  };

  const handleRemove = () => {
    clearError();
    onRemove();
  };

  const renderRow = (iconName: keyof typeof Ionicons.glyphMap, title: string, subtitle?: ReactNode) => (
    <View className="flex-row items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <Ionicons name={iconName} size={22} color={colors.primary[500]} />
      <View className="flex-1">
        <Typography variant="small" className="font-medium text-neutral-900 dark:text-white" numberOfLines={1}>
          {title}
        </Typography>
        {subtitle}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remover comprovante"
        onPress={handleRemove}
        disabled={actionsDisabled}
        hitSlop={8}>
        <Ionicons name="close-circle" size={22} color={colors.neutral[400]} />
      </Pressable>
    </View>
  );

  return (
    <View className="gap-1.5">
      <Typography variant="small" className="font-medium text-neutral-700 dark:text-neutral-200">
        Comprovante (opcional)
      </Typography>

      {isUploading ? (
        <View className="flex-row items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <ActivityIndicator color={colors.primary[500]} />
          <Typography variant="small" className="text-neutral-600 dark:text-neutral-300">
            Enviando comprovante…
          </Typography>
        </View>
      ) : receiptFile ? (
        <>
          {renderRow(
            isPdf(receiptFile.mimeType ?? receiptFile.name) ? 'document-text-outline' : 'image-outline',
            receiptFile.name,
            receiptFile.size !== undefined ? (
              <Typography variant="small" className="text-neutral-500">
                {formatFileSize(receiptFile.size)}
              </Typography>
            ) : undefined
          )}
          <Pressable accessibilityRole="button" onPress={handlePick} disabled={actionsDisabled} hitSlop={8}>
            <Typography variant="small" className="text-primary-500">
              Trocar comprovante
            </Typography>
          </Pressable>
        </>
      ) : receipt ? (
        <>
          {renderRow(
            isPdf(receipt.contentType) ? 'document-text-outline' : 'image-outline',
            receipt.name,
            <Pressable
              accessibilityRole="link"
              onPress={() => void WebBrowser.openBrowserAsync(receipt.url)}
              hitSlop={4}>
              <Typography variant="small" className="text-primary-500">
                Ver comprovante
              </Typography>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" onPress={handlePick} disabled={actionsDisabled} hitSlop={8}>
            <Typography variant="small" className="text-primary-500">
              Trocar comprovante
            </Typography>
          </Pressable>
        </>
      ) : (
        <Button
          label="Anexar comprovante"
          variant="secondary"
          onPress={handlePick}
          loading={isPicking}
          disabled={actionsDisabled}
        />
      )}

      <Typography variant="small" className="text-neutral-400">
        JPG, PNG, WEBP ou PDF · até 5 MB
      </Typography>

      {message ? (
        <Typography variant="small" className="text-danger-500">
          {message}
        </Typography>
      ) : null}
    </View>
  );
}
