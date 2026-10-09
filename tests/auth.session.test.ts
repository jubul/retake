import { SignJWT } from 'jose';
import { describe, expect, it } from 'vitest';
import {
  SESSION_TTL_SECONDS,
  sessionCookieOptions,
  signSession,
  verifySessionToken,
} from '@/lib/auth/session';

const SECRET = 'test-secret-test-secret-test-secret-1234';

describe('session', () => {
  it('roundtrip: firma y verifica', async () => {
    const now = Date.now();
    const token = await signSession(SECRET, now);
    const session = await verifySessionToken(token, SECRET);
    expect(session).not.toBeNull();
    expect(session?.sub).toBe('admin');
    expect(session?.iat).toBe(Math.floor(now / 1000));
    expect(session?.exp).toBe(Math.floor(now / 1000) + SESSION_TTL_SECONDS);
  });

  it('otro secret → null', async () => {
    const token = await signSession(SECRET);
    expect(await verifySessionToken(token, 'otro-secret-otro-secret-otro-secret-99')).toBeNull();
  });

  it('token emitido hace 8 días → null', async () => {
    const token = await signSession(SECRET, Date.now() - 8 * 24 * 60 * 60 * 1000);
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it('token manipulado → null', async () => {
    const token = await signSession(SECRET);
    const [h, p, s] = token.split('.');
    const tampered = `${h}.${p}x.${s}`;
    expect(await verifySessionToken(tampered, SECRET)).toBeNull();
    expect(await verifySessionToken('basura', SECRET)).toBeNull();
  });

  it('sub distinto de admin → null', async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('otro')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(SECRET));
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it('cookie options: httpOnly, lax, path /, maxAge TTL', () => {
    const o = sessionCookieOptions();
    expect(o).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });
  });
});
