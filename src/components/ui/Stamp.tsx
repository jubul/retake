import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { rot } from '@/lib/utils/css';

type StampProps = {
  color?: 'pink' | 'cyan' | 'ink';
  r?: number;
  className?: string;
  children: ReactNode;
};

export function Stamp({ color = 'pink', r, className, children }: StampProps) {
  return (
    <span
      className={cn('stamp', color !== 'pink' && color, className)}
      style={r === undefined ? undefined : rot(r)}
    >
      {children}
    </span>
  );
}
