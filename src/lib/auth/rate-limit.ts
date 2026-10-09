/**
 * Limitador de intentos de login en memoria, por IP. Es por proceso: alcanza para un solo VPS;
 * con varias instancias hay que moverlo a un store compartido (roadmap).
 */
export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

type Entry = { count: number; resetAt: number };
const attempts = new Map<string, Entry>();

function live(ip: string, now: number): Entry | undefined {
  const entry = attempts.get(ip);
  if (entry && entry.resetAt <= now) {
    attempts.delete(ip);
    return undefined;
  }
  return entry;
}

/** true si la IP ya agotó sus intentos fallidos dentro de la ventana. */
export function isBlocked(ip: string, now: number = Date.now()): boolean {
  return (live(ip, now)?.count ?? 0) >= MAX_FAILURES;
}

/** Suma un intento fallido (la ventana arranca en el primero). */
export function registerFailure(ip: string, now: number = Date.now()): void {
  const entry = live(ip, now);
  if (entry) entry.count += 1;
  else attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
}

export function clearFailures(ip: string): void {
  attempts.delete(ip);
}

export function _resetForTests(): void {
  attempts.clear();
}
