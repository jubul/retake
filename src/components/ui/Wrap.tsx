import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('wrap', className)}>{children}</div>;
}
