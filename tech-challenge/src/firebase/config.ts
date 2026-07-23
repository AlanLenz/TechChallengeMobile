import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';

import { env, isEnvValid } from '@/config/env';

let app: FirebaseApp | undefined;

/**
 * Inicialização lazy: importar este módulo nunca lança erro (o app precisa subir mesmo sem
 * credenciais reais ainda). O erro só acontece quando algo em src/firebase/* é efetivamente
 * chamado sem as variáveis EXPO_PUBLIC_FIREBASE_* configuradas.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isEnvValid) {
    throw new Error(
      'Firebase não configurado: preencha as variáveis EXPO_PUBLIC_FIREBASE_* em um arquivo .env na raiz do projeto (veja .env.example).'
    );
  }

  if (!app) {
    app = getApps().length
      ? getApps()[0]
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
