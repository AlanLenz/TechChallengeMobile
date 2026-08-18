import {
  type FirebaseApp,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

import { env, isEnvValid } from '@/config/env';

let app: FirebaseApp | undefined;

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

  if (!app) {
    app = getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
          authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
        });
  }

  return app;
}