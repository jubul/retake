import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import { rot } from '@/lib/utils/css';

export function Tape({ r, style, className }: { r?: number; style?: CSSProperties; className?: string }) {
  return (
    <span
      className={cn('tape', className)}
      style={r === undefined ? style : rot(r, style)}
      aria-hidden="true"
    />
  );
}
