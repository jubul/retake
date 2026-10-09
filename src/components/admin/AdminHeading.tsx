import type { ReactNode } from 'react';

type AdminHeadingProps = { title: string; hint?: string; actions?: ReactNode };

export function AdminHeading({ title, hint, actions }: AdminHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-shout text-4xl uppercase">{title}</h1>
        {hint ? <p className="pixel mt-2">{hint}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
