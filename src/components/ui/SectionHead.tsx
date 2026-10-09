import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type SectionHeadProps = {
  label: string;
  title: ReactNode;
  sub?: string;
  hand?: string;
  id?: string;
  className?: string;
};

export function SectionHead({ label, title, sub, hand, id, className }: SectionHeadProps) {
  return (
    <div className={cn('sec-head', className)} id={id}>
      <div className="sec-label pixel">{label}</div>
      <h2 className="h2">{title}</h2>
      {sub ? <p className="sub">{sub}</p> : null}
      {hand ? <span className="hand rot">{hand}</span> : null}
    </div>
  );
}
