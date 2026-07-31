import { COLLECTIONS } from '@/constants/api';

/**
 * Dados e credenciais de desenvolvimento usados por src/mocks/firebase/*.
 * Ponto único para editar/estender o "banco de dados" mockado — para remover os mocks
 * completamente basta apagar a pasta src/mocks (ver src/config/mock-mode.ts).
 */

export const MOCK_UID = 'mock-user-dev';

/** Credenciais para login no modo mock — exibidas também em src/modules/auth/constants.ts. */
export const MOCK_CREDENTIALS = {
  email: 'dev@techchallenge.com',
  password: 'Dev@1234',
};

export type MockAuthAccount = {
  uid: string;
  email: string;
  password: string;
  displayName: string | null;
  photoURL: string | null;
};

export const MOCK_AUTH_ACCOUNTS: MockAuthAccount[] = [
  {
    uid: MOCK_UID,
    email: MOCK_CREDENTIALS.email,
    password: MOCK_CREDENTIALS.password,
    displayName: 'Usuário Dev',
    photoURL: null,
  },
];

const DAY_MS = 1000 * 60 * 60 * 24;

/** Seed do "Firestore" mockado, indexado por nome de coleção (ver src/constants/api.ts). */
export const MOCK_FIRESTORE_SEED: Record<string, Record<string, Record<string, unknown>>> = {
  [COLLECTIONS.ACCOUNTS]: {
    'mock-account-checking': {
      ownerId: MOCK_UID,
      label: 'Conta Corrente',
      type: 'checking',
      balance: 4230.55,
    },
    'mock-account-savings': {
      ownerId: MOCK_UID,
      label: 'Conta Poupança',
      type: 'savings',
      balance: 12500,
    },
  },
  [COLLECTIONS.TRANSFERS]: {
    'mock-transfer-1': {
      fromAccountId: 'mock-account-checking',
      toAccountId: 'mock-account-savings',
      amount: 250,
      createdAt: Date.now() - DAY_MS * 2,
    },
    'mock-transfer-2': {
      fromAccountId: 'mock-account-checking',
      toAccountId: 'mock-account-savings',
      amount: 80.9,
      createdAt: Date.now() - DAY_MS,
    },
  },
  [COLLECTIONS.USERS]: {
    [MOCK_UID]: {
      name: 'Usuário Dev',
      email: MOCK_CREDENTIALS.email,
    },
  },
};
