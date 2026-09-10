import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useState } from 'react';

import { RECEIPT_ALLOWED_MIME_TYPES, RECEIPT_MAX_SIZE_BYTES } from '../constants';
import { isAllowedReceiptType, type ReceiptFileInput } from '../utils';

type UseReceiptPickerParams = {
  onPick: (file: ReceiptFileInput) => void;
};

type UseReceiptPickerResult = {
  pickReceipt: () => Promise<void>;
  isPicking: boolean;
  /** Mensagem de validação da seleção (tipo/tamanho) — `undefined` quando não há erro. */
  error?: string;
  clearError: () => void;
};

/**
 * Abre o seletor de arquivos do sistema (imagens ou PDF), valida o arquivo escolhido e
 * entrega-o normalizado via `onPick`. Não fala com o Firebase — só seleção + validação.
 */
export function useReceiptPicker({ onPick }: UseReceiptPickerParams): UseReceiptPickerResult {
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const clearError = useCallback(() => setError(undefined), []);

  const pickReceipt = useCallback(async () => {
    if (isPicking) return;

    setIsPicking(true);
    setError(undefined);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...RECEIPT_ALLOWED_MIME_TYPES],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const file: ReceiptFileInput = {
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      };

      if (!isAllowedReceiptType(file)) {
        setError('Formato não suportado. Envie JPG, PNG, WEBP ou PDF.');
        return;
      }
      if (file.size !== undefined && file.size <= 0) {
        setError('O arquivo está vazio.');
        return;
      }
      if (file.size !== undefined && file.size > RECEIPT_MAX_SIZE_BYTES) {
        setError('Arquivo muito grande. O tamanho máximo é 5 MB.');
        return;
      }

      onPick(file);
    } catch {
      setError('Não foi possível abrir o arquivo. Tente novamente.');
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, onPick]);

  return { pickReceipt, isPicking, error, clearError };
}
