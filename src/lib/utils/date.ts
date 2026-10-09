const pad = (n: number): string => String(n).padStart(2, '0');

/** Date -> "09.10.26" (dd.mm.yy). */
export function formatStampDate(d: Date): string {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${pad(d.getFullYear() % 100)}`;
}

/** Date -> "9 de octubre de 2026" (para admin; Intl es-AR está bien acá). */
export function formatLongDate(d: Date): string {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
