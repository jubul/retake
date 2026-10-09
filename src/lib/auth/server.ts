import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken, type Session } from './session';

export async function getSession(): Promise<Session | null> {
  const secret = process.env.SESSION_SECRET ?? '';
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !secret) return null;
  return verifySessionToken(token, secret);
}

/** redirect('/admin/login') si no hay sesión válida. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
