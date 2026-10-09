import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root flex min-h-screen items-center justify-center bg-paper px-5 py-10 text-ink font-body">
      {children}
    </div>
  );
}
