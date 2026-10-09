import { cn } from '@/lib/utils/cn';

type StatCardProps = { label: string; value: number; tone?: 'cyan' | 'pink' | 'acid' | 'paper' };

const TONES = { cyan: 'bg-cyan', pink: 'bg-pink', acid: 'bg-acid', paper: 'bg-paper' } as const;

export function StatCard({ label, value, tone = 'paper' }: StatCardProps) {
  return (
    <div className={cn('border-[3px] border-ink p-4 shadow-[4px_4px_0_var(--color-ink)]', TONES[tone])}>
      <p className="font-shout text-5xl">{value}</p>
      <p className="pixel mt-1">{label}</p>
    </div>
  );
}
