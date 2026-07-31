/**
 * Subconjunto de `firebase/auth`'s `User` realmente usado pelo app. auth.real.ts (Firebase de
 * verdade) e src/mocks/firebase/auth.mock.ts implementam o mesmo contrato — o `User` real
 * satisfaz este tipo estruturalmente, então nenhuma conversão é necessária.
 */
export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  reload: () => Promise<void>;
};
