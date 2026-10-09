/** 350000 -> "$350.000"; 0 -> "$0"; 1234567 -> "$1.234.567". Sin Intl (determinista). Redondea a entero; negativos -> abs. */
export function formatPrice(ars: number): string {
  const n = Math.abs(Math.round(Number.isFinite(ars) ? ars : 0));
  const digits = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${digits}`;
}
