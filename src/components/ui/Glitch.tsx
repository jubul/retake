import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type GlitchProps = {
  as?: 'h1' | 'h2';
  className?: string;
  children: ReactNode;
};

export function Glitch({ as: Tag = 'h1', className, children }: GlitchProps) {
  return (
    <div className={cn('glitch-wrap hero-glitch', className)}>
      <Tag className="h1">{children}</Tag>
      <span className="h1 slice a" aria-hidden="true">
        {children}
      </span>
      <span className="h1 slice b" aria-hidden="true">
        {children}
      </span>
    </div>
  );
}
