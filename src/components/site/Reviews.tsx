import { Button, Hi, SectionHead, Stars, Tape, Wrap } from '@/components/ui';
import { reviewsSummary, type Review } from '@/content/reviews';
import { publicEnv } from '@/lib/public-env';
import { rot } from '@/lib/utils/css';
import { whatsappUrl } from '@/lib/utils/whatsapp';

const ROTATIONS = [-1.2, 1.5, -0.6] as const;

/** "2026-09-30" -> "30.09.26" (sin pasar por Date: evita corrimientos de zona horaria). */
function stampDate(iso: string): string {
  const [y = '', m = '', d = ''] = iso.split('-');
  return `${d}.${m}.${y.slice(2)}`;
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  const summary = reviewsSummary(reviews);
  return (
    <section className="sec" id="dicen">
      <Wrap>
        <SectionHead
          label="// 03 — Reseñas"
          title={
            <>
              Lo que <Hi color="acid">dicen</Hi>
            </>
          }
          hand="(gente real, lo juramos)"
        />
        <div className="notes">
          {reviews.map((r, i) => (
            <div key={r.id} className="note-card" style={rot(ROTATIONS[i % 3]!)}>
              <Tape />
              <blockquote>&quot;{r.text}&quot;</blockquote>
              <div className="who">
                <span className="pixel">
                  {r.author} {'//'} {stampDate(r.date)}
                </span>
                <Stars value={r.stars} />
              </div>
            </div>
          ))}
        </div>
        {summary.count > 0 ? (
          <div className="rating">
            <span className="big">{summary.averageLabel}</span>
            <Stars value={summary.average} />
            <span className="pixel">
              Basado en {summary.count} reseñas. Las publicamos después de leerlas.
            </span>
            <Button
              size="sm"
              href={whatsappUrl(publicEnv.whatsappNumber, 'Hola! Quiero dejar una reseña de Retake')}
              external
            >
              Dejá la tuya
            </Button>
          </div>
        ) : null}
      </Wrap>
    </section>
  );
}
