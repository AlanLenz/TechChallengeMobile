/** Combina classes NativeWind condicionalmente, ignorando valores falsy. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
