import { STATUSES, statusLabel, type Status } from '@/lib/products/constants';
import { Stamp } from './Stamp';

export function StatusStamp({ status, r, className }: { status: Status; r?: number; className?: string }) {
  const color = STATUSES.find((s) => s.value === status)?.stamp ?? 'ink';
  return (
    <Stamp color={color} r={r} className={className}>
      {statusLabel(status)}
    </Stamp>
  );
}
