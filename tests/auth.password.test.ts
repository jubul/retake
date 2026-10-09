import { describe, expect, it } from 'vitest';
import { verifyPassword } from '@/lib/auth/password';

describe('verifyPassword', () => {
  it('igual → true', () => {
    expect(verifyPassword('cambiame-ya', 'cambiame-ya')).toBe(true);
  });
  it('distinto → false', () => {
    expect(verifyPassword('cambiame-yo', 'cambiame-ya')).toBe(false);
  });
  it('distinta longitud → false (sin lanzar)', () => {
    expect(verifyPassword('corta', 'una-contraseña-mucho-más-larga')).toBe(false);
  });
  it('vacío → false', () => {
    expect(verifyPassword('', 'cambiame-ya')).toBe(false);
  });
});
