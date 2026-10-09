import type { ReactNode } from 'react';

type FieldProps = {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: ReactNode;
};

/** Props de accesibilidad para el control hijo de <Field> (id, name, aria-*, invalid). */
export function fieldProps(name: string, error?: string[]) {
  const hasError = Boolean(error && error.length > 0);
  return {
    id: name,
    name,
    'aria-invalid': hasError || undefined,
    'aria-describedby': hasError ? `${name}-error` : undefined,
    invalid: hasError,
  };
}

export function Field({ label, name, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="pixel">
        {label}
      </label>
      {hint ? <p className="pixel text-ink/75">{hint}</p> : null}
      {children}
      {error && error.length > 0 ? (
        <p id={`${name}-error`} role="alert" className="text-sm font-bold text-[#c2005c]">
          {error.join(' ')}
        </p>
      ) : null}
    </div>
  );
}
