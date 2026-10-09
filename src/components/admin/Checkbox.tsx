import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { invalid?: boolean };

export function Checkbox({ invalid, className, ...rest }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-6 w-6 shrink-0 cursor-pointer appearance-none border-[3px] bg-white checked:bg-pink focus:outline-none focus-visible:shadow-[4px_4px_0_var(--color-pink)]',
        invalid ? 'border-pink' : 'border-ink',
        className,
      )}
      {...rest}
    />
  );
}
