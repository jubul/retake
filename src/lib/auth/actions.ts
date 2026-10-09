'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getEnv } from '@/lib/env';
import { verifyPassword } from './password';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from './session';

export type LoginState = { error?: string };

/** Valida la contraseña contra ADMIN_PASSWORD; error → { error: 'Contraseña incorrecta' } (con 400 ms de espera); ok → set cookie + redirect('/admin'). */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = formData.get('password');
  // Equivale a loginSchema (products/schemas.ts, T02): string no vacío.
  if (typeof raw !== 'string' || raw.length === 0) {
    return { error: 'Escribí la contraseña' };
  }

  const env = getEnv();
  if (!verifyPassword(raw, env.ADMIN_PASSWORD)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { error: 'Contraseña incorrecta' };
  }

  const token = await signSession(env.SESSION_SECRET);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect('/admin');
}

/** Borra la cookie y redirect('/admin/login'). */
export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/admin/login');
}
