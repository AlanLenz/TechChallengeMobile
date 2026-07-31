import { isEnvValid } from './env';

const override = process.env.EXPO_PUBLIC_USE_MOCKS;

/**
 * Modo mock: ativado automaticamente quando as variáveis EXPO_PUBLIC_FIREBASE_* não estão
 * configuradas (sem .env), permitindo rodar o app inteiro — login incluído — sem depender do
 * Firebase real. Pode ser forçado com EXPO_PUBLIC_USE_MOCKS=true|false (ex.: testar os mocks
 * mesmo com um .env válido, ou forçar o Firebase real mesmo sem um .env preenchido).
 *
 * Único ponto de decisão do modo mock — src/firebase/*.ts leem esta flag para escolher entre a
 * implementação real e a mockada. Ver src/mocks/ para a implementação e dados mockados.
 */
export const isMockModeEnabled: boolean =
  override === 'true' ? true : override === 'false' ? false : !isEnvValid;
