import { Button, Cut, Glitch, Marquee, Wrap } from '@/components/ui';
import type { ProductWithImages } from '@/lib/products/types';
import { publicEnv } from '@/lib/public-env';
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from '@/lib/utils/whatsapp';
import { HeroArt } from './HeroArt';

export function Hero({ product }: { product: ProductWithImages | null }) {
  return (
    <section className="hero dots">
      <Wrap className="hero-grid">
        <div className="hero-copy">
          <div className="kicker pixel">
            Nintendo DS <b>{'//'}</b> 3DS <b>{'//'}</b> Importado de Japón
          </div>
          <Glitch>
            <Cut r={-2}>Tu</Cut> <Cut r={1}>infancia,</Cut>
            <br />
            <Cut color="pink" r={-1}>
              reimportada.
            </Cut>
          </Glitch>
          <p className="lead">
            Nintendo DS, 3DS, cartuchos y rarezas rescatadas de Akihabara. Elegidas una por una, probadas, y
            enviadas a cualquier punto del país.
          </p>
          <p className="hand rot">→ retomá lo que era tuyo</p>
          <div className="cta">
            <Button variant="pink" href="/botin">
              Ver el botín
            </Button>
            <Button href={whatsappUrl(publicEnv.whatsappNumber, GENERIC_WHATSAPP_MESSAGE)} external>
              Escribinos por WhatsApp
            </Button>
          </div>
        </div>
        <HeroArt product={product} />
      </Wrap>
      <Marquee
        diagonal
        color="cyan"
        separator="star"
        items={[
          'Retomá lo que era tuyo',
          'Región Japón, idioma nostalgia',
          'Soplar el cartucho no hace falta',
        ]}
      />
    </section>
  );
}
