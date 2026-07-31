import { isMockModeEnabled } from '@/config/mock-mode';
import * as mockStorage from '@/mocks/firebase/storage.mock';

import * as realStorage from './storage.real';

/**
 * Escolhe a implementação real ou mockada uma única vez, no carregamento do módulo (ver
 * src/firebase/auth.ts para a mesma ideia, com mais comentários). Para voltar a usar sempre o
 * Firebase real, apague este arquivo e renomeie storage.real.ts de volta para storage.ts.
 */
const impl = isMockModeEnabled ? mockStorage : realStorage;

export const uploadFile = impl.uploadFile;
export const getFileUrl = impl.getFileUrl;
export const deleteFile = impl.deleteFile;
