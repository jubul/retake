import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/** Clases compartidas por Input, Select y Textarea. */
export function controlClass(invalid?: boolean, className?: string): string {
  return cn(
    'w-full border-[3px] bg-white px-3 py-2 font-body focus:outline-none focus-visible:shadow-[4px_4px_0_var(--color-pink)]',
    invalid ? 'border-pink' : 'border-ink',
    className,
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ invalid, className, ...rest }: InputProps) {
  return <input className={controlClass(invalid, className)} {...rest} />;
}
