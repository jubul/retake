import { createHash, timingSafeEqual } from 'node:crypto';

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

/** Compara en tiempo constante: sha256(input) vs sha256(expected) con crypto.timingSafeEqual. */
export function verifyPassword(input: string, expected: string): boolean {
  return timingSafeEqual(sha256(input), sha256(expected));
}
