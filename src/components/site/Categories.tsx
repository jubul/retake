import Link from 'next/link';
import { Hi, PixelIcon, SectionHead, Tape, Wrap } from '@/components/ui';
import { CATEGORIES } from '@/lib/products/constants';
import { rot } from '@/lib/utils/css';

const ROTATIONS = [-1.5, 1, -0.5, 1.5] as const;

export function Categories() {
  return (
    <section className="sec" id="cat">
      <Wrap>
        <SectionHead
          label="// 01 — Categorías"
          title={
            <>
              Buscá por <Hi>tipo</Hi>
            </>
          }
          sub="Cuatro cajones. Todos importados, todos revisados."
        />
        <div className="tags">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.value}
              className="tag"
              href={`/botin?categoria=${c.value}`}
              style={rot(ROTATIONS[i % 4]!)}
            >
              <Tape />
              <span className="n pixel">{String(i + 1).padStart(2, '0')}</span>
              <div className="px">
                <PixelIcon name={c.icon} />
              </div>
              <h3>{c.plural}</h3>
              <span className="hand">{c.hint}</span>
            </Link>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
