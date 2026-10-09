import { beforeEach, describe, expect, it } from 'vitest';
import {
  MAX_FAILURES,
  WINDOW_MS,
  _resetForTests,
  clearFailures,
  isBlocked,
  registerFailure,
} from '@/lib/auth/rate-limit';

beforeEach(() => _resetForTests());

describe('login rate limit', () => {
  it('bloquea recién al llegar a 5 fallos', () => {
    for (let i = 0; i < MAX_FAILURES - 1; i++) registerFailure('1.1.1.1', 0);
    expect(isBlocked('1.1.1.1', 0)).toBe(false);
    registerFailure('1.1.1.1', 0);
    expect(isBlocked('1.1.1.1', 0)).toBe(true);
  });

  it('es por IP', () => {
    for (let i = 0; i < MAX_FAILURES; i++) registerFailure('1.1.1.1', 0);
    expect(isBlocked('2.2.2.2', 0)).toBe(false);
  });

  it('se libera cuando pasa la ventana de 15 minutos', () => {
    for (let i = 0; i < MAX_FAILURES; i++) registerFailure('a', 0);
    expect(isBlocked('a', WINDOW_MS - 1)).toBe(true);
    expect(isBlocked('a', WINDOW_MS)).toBe(false);
    registerFailure('a', WINDOW_MS);
    expect(isBlocked('a', WINDOW_MS)).toBe(false);
  });

  it('clearFailures resetea el contador', () => {
    for (let i = 0; i < MAX_FAILURES; i++) registerFailure('a', 0);
    clearFailures('a');
    expect(isBlocked('a', 0)).toBe(false);
  });
});
