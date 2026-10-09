import { Fragment } from 'react';
import { cn } from '@/lib/utils/cn';
import { Skull } from './Skull';

type MarqueeProps = {
  items: string[];
  color?: 'pink' | 'cyan' | 'acid';
  separator?: 'skull' | 'star';
  diagonal?: boolean;
  className?: string;
};

export function Marquee({ items, color = 'pink', separator = 'skull', diagonal, className }: MarqueeProps) {
  // El keyframe mueve -50%: la lista va duplicada exactamente dos veces.
  const doubled = [...items, ...items];
  return (
    <div
      className={cn('marquee', color !== 'pink' && color, diagonal && 'diag', className)}
      aria-hidden="true"
    >
      <div className="track">
        {doubled.map((text, i) => (
          <Fragment key={i}>
            <span>{text}</span>
            {separator === 'skull' ? <Skull /> : <span>★</span>}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
