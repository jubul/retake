import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';
import { Skull } from '@/components/ui/Skull';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="w-full max-w-sm border-[3px] border-ink bg-paper p-8 shadow-[4px_4px_0_var(--color-ink)]">
      <div className="mb-6 flex items-center gap-3">
        <Skull className="block h-10 w-10 text-ink" />
        <h1 className="pixel">RETAKE // BACKOFFICE</h1>
      </div>
      <LoginForm />
    </main>
  );
}
