import { cn } from '@/lib/utils/cn';
import { PixelIcon } from './PixelIcon';

type StarsProps = {
  /** 0..5 */
  value: number;
  label?: string;
  className?: string;
};

export function Stars({ value, label, className }: StarsProps) {
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className={cn('stars', className)} role="img" aria-label={label ?? `${n} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn('px', i > n && 'off')}>
          <PixelIcon name="star" />
        </span>
      ))}
    </span>
  );
}
