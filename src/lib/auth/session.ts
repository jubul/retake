import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'retake_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

export type Session = { sub: 'admin'; iat: number; exp: number };

/** JWT HS256 con jose: sub 'admin', iat = now, exp = now + TTL. `now` en ms (inyectable para tests). */
export async function signSession(secret: string, now: number = Date.now()): Promise<string> {
  const iat = Math.floor(now / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuedAt(iat)
    .setExpirationTime(iat + SESSION_TTL_SECONDS)
    .sign(new TextEncoder().encode(secret));
}

/** Verifica firma, alg HS256 y expiración. null si inválido/expirado. */
export async function verifySessionToken(token: string, secret: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    if (payload.sub !== 'admin') return null;
    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null;
    return { sub: 'admin', iat: payload.iat, exp: payload.exp };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(): {
  httpOnly: true;
  sameSite: 'lax';
  secure: boolean;
  path: '/';
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
