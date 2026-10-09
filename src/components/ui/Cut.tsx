import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { rot } from '@/lib/utils/css';

type CutProps = {
  color?: 'paper' | 'pink' | 'cyan' | 'acid';
  size?: 'lg' | 'sm';
  r?: number;
  className?: string;
  children: ReactNode;
};

export function Cut({ color = 'paper', size = 'lg', r, className, children }: CutProps) {
  return (
    <span
      className={cn('cut', color !== 'paper' && color, size === 'sm' && 'sm', className)}
      style={r === undefined ? undefined : rot(r)}
    >
      {children}
    </span>
  );
}
