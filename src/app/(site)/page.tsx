import { BootScreen, Hazard, Marquee } from '@/components/ui';
import { Categories } from '@/components/site/Categories';
import { Hero } from '@/components/site/Hero';
import { LatestLoot } from '@/components/site/LatestLoot';
import { LimitedEditions } from '@/components/site/LimitedEditions';
import { Reviews } from '@/components/site/Reviews';
import { WhySection } from '@/components/site/WhySection';
import { getReviews } from '@/content/reviews';
import { latestProducts, limitedProducts } from '@/lib/products/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [latest, limited] = await Promise.all([latestProducts(4), limitedProducts(4)]);
  const reviews = getReviews();

  return (
    <main>
      <BootScreen />
      <Marquee
        items={[
          'Envíos a todo el país',
          'Importado de Japón',
          'No es stock, es botín',
          'Soporte real, no solo venta',
          'Probadas una por una',
        ]}
      />
      <Hero latest={latest[0] ?? null} />
      <WhySection />
      <Categories />
      <Hazard>⚠ Stock limitado // cuando se va, se va ⚠</Hazard>
      <LatestLoot products={latest} />
      <LimitedEditions products={limited} />
      <Reviews reviews={reviews} />
    </main>
  );
}
