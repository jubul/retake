import { cn } from '@/lib/utils/cn';
import { PixelIcon } from './PixelIcon';

export function Skull({ className }: { className?: string }) {
  return (
    <span className={cn('skull', className)}>
      <PixelIcon name="skull" />
    </span>
  );
}
