import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { rot } from '@/lib/utils/css';
import { Tape } from './Tape';

type PolaroidProps = {
  r?: number;
  caption?: string;
  tapes?: 'none' | 'corners' | 'top';
  className?: string;
  children: ReactNode;
};

export function Polaroid({ r, caption, tapes = 'none', className, children }: PolaroidProps) {
  return (
    <div className={cn('polaroid', className)} style={r === undefined ? undefined : rot(r)}>
      {tapes === 'corners' ? (
        <>
          <Tape className="t1" />
          <Tape className="t2" />
        </>
      ) : null}
      {tapes === 'top' ? <Tape r={-4} style={{ left: '50%', top: -12, marginLeft: -48 }} /> : null}
      {children}
      {caption ? <div className="caption hand">{caption}</div> : null}
    </div>
  );
}
