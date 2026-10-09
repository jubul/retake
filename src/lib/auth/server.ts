import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, sessionFromCookie, type Session } from './session';

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return sessionFromCookie(token, process.env.SESSION_SECRET);
}

/** redirect('/admin/login') si no hay sesión válida. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
