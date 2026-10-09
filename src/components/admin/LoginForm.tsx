'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { login, type LoginState } from '@/lib/auth/actions';
import { Input } from './Input';

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="pixel">
          Contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          invalid={Boolean(state.error)}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'password-error' : undefined}
        />
        {state.error ? (
          <p id="password-error" role="alert" className="text-sm font-bold text-[#c2005c]">
            {state.error}
          </p>
        ) : null}
      </div>
      <SubmitButton variant="pink" pendingLabel="Entrando...">
        Entrar
      </SubmitButton>
    </form>
  );
}
