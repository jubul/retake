import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type SectionHeadProps = {
  label: string;
  title: ReactNode;
  sub?: string;
  hand?: string;
  id?: string;
  as?: 'h1' | 'h2';
  className?: string;
};

export function SectionHead({ label, title, sub, hand, id, as: Tag = 'h2', className }: SectionHeadProps) {
  return (
    <div className={cn('sec-head', className)} id={id}>
      <div className="sec-label pixel">{label}</div>
      <Tag className="h2">{title}</Tag>
      {sub ? <p className="sub">{sub}</p> : null}
      {hand ? <span className="hand rot">{hand}</span> : null}
    </div>
  );
}
