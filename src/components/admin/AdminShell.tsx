import type { ReactNode } from 'react';
import { logout } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { Skull } from '@/components/ui/Skull';

const NAV = [
  { href: '/admin', label: 'Panel', external: false },
  { href: '/admin/productos', label: 'Productos', external: false },
  { href: '/admin/productos/nuevo', label: 'Nuevo', external: false },
  { href: '/', label: 'Ver sitio', external: true },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root min-h-screen bg-paper text-ink font-body">
      <header className="bg-ink text-paper">
        <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <div className="flex items-center gap-3">
            <Skull className="block h-8 w-8 text-paper" />
            <span className="pixel">RETAKE // BACKOFFICE</span>
          </div>
          <nav aria-label="Backoffice" className="pixel flex flex-wrap items-center gap-x-5 gap-y-2">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="underline-offset-4 hover:underline"
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <form action={logout} className="ml-auto">
            <Button type="submit" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </header>
      <main className="wrap py-10">{children}</main>
    </div>
  );
}
