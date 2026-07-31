import { isMockModeEnabled } from '@/config/mock-mode';
import * as mockAuth from '@/mocks/firebase/auth.mock';

import * as realAuth from './auth.real';

export type { AuthUser as User } from './auth.types';

/**
 * Escolhe a implementação real ou mockada uma única vez, no carregamento do módulo — nenhum
 * outro arquivo do app precisa saber que este "switch" existe (ver src/config/mock-mode.ts e
 * src/mocks/firebase/auth.mock.ts). Para voltar a usar sempre o Firebase real, apague este
 * arquivo e renomeie auth.real.ts de volta para auth.ts.
 */
const impl = isMockModeEnabled ? mockAuth : realAuth;

export const getAuthErrorMessage = impl.getAuthErrorMessage;
export const signIn = impl.signIn;
export const signUp = impl.signUp;
export const signOut = impl.signOut;
export const resetPassword = impl.resetPassword;
export const getCurrentUser = impl.getCurrentUser;
export const updateCurrentUserProfile = impl.updateCurrentUserProfile;
export const reloadCurrentUser = impl.reloadCurrentUser;
export const subscribeToAuthChanges = impl.subscribeToAuthChanges;
