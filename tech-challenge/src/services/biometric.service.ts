import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { preferencesStorage, secureStorage } from './storage.service';

const BIOMETRICS_ENABLED_KEY = 'security_biometrics_enabled';

export type BiometricSupport = {
  isAvailable: boolean;
  label: string;
};

/**
 * Verifica se o dispositivo possui hardware biométrico (Face ID, Touch ID ou Impressão Digital)
 * e se há biometria cadastrada pelo usuário no sistema operacional.
 */
export async function getBiometricSupport(): Promise<BiometricSupport> {
  if (Platform.OS === 'web') {
    return { isAvailable: false, label: 'Biometria' };
  }

  try {
    const [hasHardware, isEnrolled, supportedTypes] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);

    if (!hasHardware || !isEnrolled) {
      return { isAvailable: false, label: 'Biometria' };
    }

    const hasFacial = supportedTypes.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
    );
    const hasFingerprint = supportedTypes.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT
    );

    let label = 'Biometria';
    if (Platform.OS === 'ios' && hasFacial) {
      label = 'Face ID';
    } else if (Platform.OS === 'ios' && hasFingerprint) {
      label = 'Touch ID';
    } else if (hasFacial && hasFingerprint) {
      label = 'Biometria ou Reconhecimento Facial';
    } else if (hasFingerprint) {
      label = 'Impressão Digital';
    } else if (hasFacial) {
      label = 'Reconhecimento Facial';
    }

    return { isAvailable: true, label };
  } catch {
    return { isAvailable: false, label: 'Biometria' };
  }
}

/**
 * Lê a preferência de bloqueio biométrico armazenada de forma criptografada no SecureStore
 * (com fallback em preferencesStorage). Por padrão, quando o dispositivo suporta biometria e o
 * usuário ainda não alterou a opção, retorna `true` (proteção ativa por padrão — secure by default).
 */
export async function isBiometricLockEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const stored =
      (await secureStorage.getItem(BIOMETRICS_ENABLED_KEY)) ??
      (await preferencesStorage.getItem(BIOMETRICS_ENABLED_KEY));

    if (stored === 'false') return false;
    if (stored === 'true') return true;

    // Secure by default: ativo automaticamente quando o aparelho possui biometria cadastrada
    return true;
  } catch {
    return true;
  }
}

/**
 * Salva a preferência de bloqueio biométrico no armazenamento seguro (SecureStore).
 */
export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS === 'web') return;

  const value = enabled ? 'true' : 'false';
  try {
    await secureStorage.setItem(BIOMETRICS_ENABLED_KEY, value);
  } catch {
    await preferencesStorage.setItem(BIOMETRICS_ENABLED_KEY, value);
  }
}

/**
 * Solicita a autenticação biométrica nativa do sistema operacional.
 */
export async function authenticateWithBiometrics(
  promptMessage = 'Confirme sua identidade para acessar sua conta'
): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Usar senha',
      fallbackLabel: 'Usar senha do dispositivo',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch {
    return false;
  }
}
