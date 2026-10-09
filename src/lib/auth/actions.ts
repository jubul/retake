'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getEnv } from '@/lib/env';
import { loginSchema } from '@/lib/products/schemas';
import { verifyPassword } from './password';
import { clearFailures, isBlocked, registerFailure } from './rate-limit';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from './session';

export type LoginState = { error?: string };

/** Valida la contraseña contra ADMIN_PASSWORD; error → { error: 'Contraseña incorrecta' } (con 400 ms de espera); ok → set cookie + redirect('/admin'). */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ password: formData.get('password') });
  if (!parsed.success) return { error: 'Escribí la contraseña' };

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (isBlocked(ip)) return { error: 'Demasiados intentos. Esperá 15 minutos.' };

  const env = getEnv();
  if (!verifyPassword(parsed.data.password, env.ADMIN_PASSWORD)) {
    registerFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { error: 'Contraseña incorrecta' };
  }
  clearFailures(ip);

  const token = await signSession(env.SESSION_SECRET);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect('/admin');
}

/** Borra la cookie y redirect('/admin/login'). */
export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/admin/login');
}
