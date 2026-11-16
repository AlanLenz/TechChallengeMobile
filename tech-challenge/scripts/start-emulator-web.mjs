import { spawn } from 'node:child_process';

const env = {
  ...process.env,
  EXPO_PUBLIC_FIREBASE_API_KEY: 'emulator-only',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'localhost',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'demo-tech-challenge',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-tech-challenge.appspot.com',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:000000000000:web:emulator',
  EXPO_PUBLIC_USE_FIREBASE_EMULATORS: 'true',
  EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: '127.0.0.1',
};

const port = process.env.EXPO_EMULATOR_WEB_PORT || '8082';
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) {
  throw new Error('EXPO_EMULATOR_WEB_PORT deve ser uma porta entre 1024 e 65535.');
}

const child = spawn('npx', ['expo', 'start', '--web', '--port', port], {
  cwd: new URL('..', import.meta.url),
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.error('Não foi possível iniciar o Expo Web para os emuladores:', error);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
