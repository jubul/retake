import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Hi({
  color,
  className,
  children,
}: {
  color?: 'pink' | 'cyan' | 'acid';
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn('hi', color, className)}>{children}</span>;
}
