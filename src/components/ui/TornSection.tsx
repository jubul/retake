import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { tornClipPath } from '@/lib/utils/shapes';

type TornSectionProps = {
  seed: string | number;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function TornSection({ seed, id, className, children }: TornSectionProps) {
  return (
    <section id={id} className={cn('paper-sec torn', className)} style={{ clipPath: tornClipPath(seed) }}>
      {children}
    </section>
  );
}
