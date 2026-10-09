import type { SelectHTMLAttributes } from 'react';
import { controlClass } from './Input';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <select className={controlClass(invalid, className)} {...rest}>
      {children}
    </select>
  );
}
