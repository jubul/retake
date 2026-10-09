import Link from 'next/link';
import { Button, buttonClass } from '@/components/ui';
import { CATEGORIES } from '@/lib/products/constants';
import type { CatalogFilters as Filters } from '@/lib/products/schemas';

export function CatalogFilters({ current, total }: { current: Filters; total: number }) {
  return (
    <form method="get" action="/botin" style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
      <div className="cta">
        <Link href="/botin" className={buttonClass(current.categoria ? 'default' : 'pink', 'sm')}>
          Todas
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/botin?categoria=${c.value}`}
            className={buttonClass(current.categoria === c.value ? 'pink' : 'default', 'sm')}
          >
            {c.plural}
          </Link>
        ))}
      </div>
      <div className="cta">
        <label className="pixel" htmlFor="catalog-q">
          Buscar
        </label>
        <input
          id="catalog-q"
          type="search"
          name="q"
          defaultValue={current.q ?? ''}
          maxLength={60}
          placeholder="DS Lite, Pokémon..."
          style={{
            background: 'var(--paper)',
            color: 'var(--ink)',
            border: '3px solid var(--ink)',
            padding: '10px 12px',
            minWidth: 220,
          }}
        />
        {current.categoria ? <input type="hidden" name="categoria" value={current.categoria} /> : null}
        <Button variant="ink" size="sm" type="submit">
          Buscar
        </Button>
        <span className="pixel">{total} piezas</span>
      </div>
    </form>
  );
}
