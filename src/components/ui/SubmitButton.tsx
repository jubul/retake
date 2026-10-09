'use client';

import { useFormStatus } from 'react-dom';
import { buttonClass, type ButtonProps } from './Button';

type SubmitButtonProps = Omit<ButtonProps, 'href' | 'external' | 'type'> & { pendingLabel?: string };

export function SubmitButton({
  pendingLabel,
  variant,
  size,
  disabled,
  className,
  children,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={buttonClass(variant, size, className)}
      disabled={disabled || pending}
      aria-busy={pending}
    >
      {pending ? (pendingLabel ?? 'Un segundo...') : children}
    </button>
  );
}
