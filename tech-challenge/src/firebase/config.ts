import {
  type FirebaseApp,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';
import { Platform } from 'react-native';

import { env, isEnvValid } from '@/config/env';

let app: FirebaseApp | undefined;

export const useFirebaseEmulators = env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

export function getFirebaseEmulatorHost(): string {
  const host =
    env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ||
    (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');

  if (!['localhost', '127.0.0.1', '10.0.2.2'].includes(host)) {
    throw new Error('O host dos emuladores Firebase deve ser local.');
  }

  return host;
}

/**
 * Inicialização lazy: importar este módulo nunca lança erro.
 * O Firebase só é inicializado quando alguma operação realmente precisa dele.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isEnvValid) {
    throw new Error(
      'Firebase não configurado: preencha as variáveis EXPO_PUBLIC_FIREBASE_* em um arquivo .env na raiz do projeto (veja .env.example).'
    );
  }

  const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (typeof projectId !== 'string') {
    throw new Error('O project ID do Firebase não está configurado.');
  }

  if (useFirebaseEmulators && !projectId.startsWith('demo-')) {
    throw new Error('Os emuladores Firebase exigem um project ID iniciado por "demo-".');
  }

  if (!app) {
    app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
            authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId,
            storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
          });
  }

  if (app.options.projectId !== projectId) {
    throw new Error('O project ID do Firebase já inicializado não corresponde ao ambiente atual.');
  }

  return app;
}