'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

type NavItem = { label: string; href: string; match: 'home' | 'botin' | 'consolas' | 'cartuchos' | 'none' };

const LINKS: readonly NavItem[] = [
  { label: 'Inicio', href: '/', match: 'home' },
  { label: 'Botín', href: '/botin', match: 'botin' },
  { label: 'Consolas', href: '/botin?categoria=consolas', match: 'consolas' },
  { label: 'Cartuchos', href: '/botin?categoria=cartuchos', match: 'cartuchos' },
  { label: 'Reseñas', href: '/#dicen', match: 'none' },
];

export function NavLinks() {
  const pathname = usePathname();
  const categoria = useSearchParams().get('categoria');
  const inCatalog = pathname === '/botin';
  const special = categoria === 'consolas' || categoria === 'cartuchos';

  function isActive(match: NavItem['match']): boolean {
    switch (match) {
      case 'home':
        return pathname === '/';
      case 'botin':
        return pathname.startsWith('/botin') && !(inCatalog && special);
      case 'consolas':
      case 'cartuchos':
        return inCatalog && categoria === match;
      case 'none':
        return false;
    }
  }

  return (
    <nav className="nav pixel" aria-label="Principal">
      {LINKS.map((l) => {
        const active = isActive(l.match);
        return (
          <Link
            key={l.label}
            href={l.href}
            className={cn(active && 'on')}
            aria-current={active ? 'page' : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
