export type WithId<T> = T & { id: string };

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
