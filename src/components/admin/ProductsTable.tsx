import Link from 'next/link';
import { ProductArt } from '@/components/ui/ProductArt';
import { StatusStamp } from '@/components/ui/StatusStamp';
import { categoryLabel } from '@/lib/products/constants';
import type { ProductWithImages } from '@/lib/products/types';
import { formatLongDate } from '@/lib/utils/date';
import { formatPrice } from '@/lib/utils/format';

export function ProductsTable({ products }: { products: ProductWithImages[] }) {
  if (products.length === 0) {
    return (
      <p className="border-[3px] border-ink bg-white p-6 shadow-[4px_4px_0_var(--color-ink)]">
        Todavía no hay productos. Creá el primero.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto border-[3px] border-ink bg-white shadow-[4px_4px_0_var(--color-ink)]">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead className="bg-ink text-paper">
          <tr className="pixel">
            <th scope="col" className="p-3">
              <span className="sr">Foto</span>
            </th>
            <th scope="col" className="p-3">
              Producto
            </th>
            <th scope="col" className="p-3">
              Categoría
            </th>
            <th scope="col" className="p-3">
              Precio
            </th>
            <th scope="col" className="p-3">
              Estado
            </th>
            <th scope="col" className="p-3">
              Actualizado
            </th>
            <th scope="col" className="p-3">
              <span className="sr">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const thumb = p.images[0];
            return (
              <tr key={p.id} className="border-t-[3px] border-ink align-middle">
                <td className="p-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden border-[3px] border-ink bg-paper">
                    {thumb ? (
                      <img
                        src={`/uploads/${thumb.thumbPath}`}
                        alt={thumb.alt}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ProductArt category={p.category} seed={p.id} className="w-[80%]" />
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <p className="font-bold">{p.name}</p>
                  <p className="pixel text-ink/60">{p.slug}</p>
                </td>
                <td className="p-3">{categoryLabel(p.category)}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">
                  <StatusStamp status={p.status} />
                </td>
                <td className="p-3 text-sm">{formatLongDate(p.updatedAt)}</td>
                <td className="p-3">
                  <Link href={`/admin/productos/${p.id}`} className="pixel underline underline-offset-4">
                    Editar
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
