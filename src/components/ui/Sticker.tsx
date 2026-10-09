import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { rot } from '@/lib/utils/css';

type StickerProps = {
  color?: 'yellow' | 'pink' | 'cyan';
  r?: number;
  className?: string;
  children: ReactNode;
};

export function Sticker({ color = 'yellow', r, className, children }: StickerProps) {
  return (
    <div
      className={cn('sticker', color !== 'yellow' && color, className)}
      style={r === undefined ? undefined : rot(r)}
    >
      {children}
    </div>
  );
}
