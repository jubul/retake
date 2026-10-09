import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, STATUSES } from '@/lib/products/constants';
import type { CatalogFilters } from '@/lib/products/schemas';
import { Field } from './Field';
import { Input } from './Input';
import { Select } from './Select';

export function ProductFilters({ current }: { current: CatalogFilters }) {
  return (
    <form method="get" action="/admin/productos" className="mb-6 flex flex-wrap items-end gap-4">
      <div className="min-w-48 flex-1">
        <Field label="Buscar" name="q">
          <Input id="q" name="q" type="search" defaultValue={current.q ?? ''} placeholder="Nombre o nota" />
        </Field>
      </div>
      <div className="min-w-40">
        <Field label="Categoría" name="categoria">
          <Select id="categoria" name="categoria" defaultValue={current.categoria ?? ''}>
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.plural}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="min-w-40">
        <Field label="Estado" name="estado">
          <Select id="estado" name="estado" defaultValue={current.estado ?? ''}>
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex items-center gap-4 pb-2">
        <Button type="submit" variant="ink" size="sm">
          Filtrar
        </Button>
        <Link href="/admin/productos" className="pixel underline underline-offset-4">
          Limpiar
        </Link>
      </div>
    </form>
  );
}
