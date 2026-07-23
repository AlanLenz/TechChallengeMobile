import { Modal as RNModal, Pressable, type ModalProps as RNModalProps } from 'react-native';

import { cx } from '@/utils/cx';

type ModalProps = Omit<RNModalProps, 'transparent' | 'animationType'> & {
  onRequestClose: () => void;
};

/**
 * Sheet modal para confirmações rápidas dentro de uma tela (ex.: "cancelar transferência?").
 * Diferente dos modais de navegação em src/app/(modals)/, que são fluxos completos de rota.
 */
export function Modal({ children, onRequestClose, visible, className, ...rest }: ModalProps) {
  return (
    <RNModal transparent animationType="fade" visible={visible} onRequestClose={onRequestClose} {...rest}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onRequestClose}>
        <Pressable className={cx('rounded-t-3xl bg-white p-6 dark:bg-neutral-900', className)}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
