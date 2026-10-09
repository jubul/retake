import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return <AdminShell>{children}</AdminShell>;
}
