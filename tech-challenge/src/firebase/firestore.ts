import { isMockModeEnabled } from '@/config/mock-mode';
import * as mockFirestore from '@/mocks/firebase/firestore.mock';

import * as realFirestore from './firestore.real';

export type { DocumentData, WhereClause } from './firestore.types';

/**
 * Escolhe a implementação real ou mockada uma única vez, no carregamento do módulo (ver
 * src/firebase/auth.ts para a mesma ideia, com mais comentários). Para voltar a usar sempre o
 * Firebase real, apague este arquivo e renomeie firestore.real.ts de volta para firestore.ts.
 */
const impl = isMockModeEnabled ? mockFirestore : realFirestore;

export const getDocument = impl.getDocument;
export const setDocument = impl.setDocument;
export const queryCollection = impl.queryCollection;
export const subscribeToDocument = impl.subscribeToDocument;
