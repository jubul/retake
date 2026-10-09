import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { rot } from '@/lib/utils/css';
import { burstClipPath } from '@/lib/utils/shapes';

type BurstProps = {
  color?: 'cyan' | 'pink' | 'acid' | 'yellow';
  r?: number;
  size?: number;
  points?: number;
  inner?: number;
  className?: string;
  children: ReactNode;
};

export function Burst({ color = 'cyan', r, size, points, inner, className, children }: BurstProps) {
  const base: CSSProperties = { clipPath: burstClipPath(points, inner) };
  if (size !== undefined) {
    base.width = size;
    base.height = size;
  }
  return (
    <div
      className={cn('burst', color !== 'cyan' && color, className)}
      style={r === undefined ? base : rot(r, base)}
    >
      {children}
    </div>
  );
}
