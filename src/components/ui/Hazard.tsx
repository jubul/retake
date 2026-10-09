import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Hazard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('hazard', className)} aria-hidden="true">
      <span>{children}</span>
    </div>
  );
}
