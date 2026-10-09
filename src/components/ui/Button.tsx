import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonProps = {
  href?: string;
  variant?: 'default' | 'pink' | 'ink';
  size?: 'md' | 'sm';
  type?: 'button' | 'submit';
  disabled?: boolean;
  external?: boolean;
  className?: string;
  children: ReactNode;
};

export function buttonClass(
  variant: ButtonProps['variant'] = 'default',
  size: ButtonProps['size'] = 'md',
  className?: string,
): string {
  return cn(
    'btn',
    variant === 'pink' && 'btn-pink',
    variant === 'ink' && 'btn-ink',
    size === 'sm' && 'btn-sm',
    className,
  );
}

export function Button({
  href,
  variant = 'default',
  size = 'md',
  type = 'button',
  disabled,
  external,
  className,
  children,
}: ButtonProps) {
  const cls = buttonClass(variant, size, className);
  if (href === undefined) {
    return (
      <button type={type} disabled={disabled} className={cls}>
        {children}
      </button>
    );
  }
  if (external || !(href.startsWith('/') || href.startsWith('#'))) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
