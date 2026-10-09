import { Button, Stamp } from '@/components/ui';
import type { Product } from '@/lib/products/types';
import { publicEnv } from '@/lib/public-env';
import { productWhatsappMessage, whatsappUrl } from '@/lib/utils/whatsapp';

export function ProductCta({ product }: { product: Product }) {
  if (product.status === 'sold') {
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <Stamp color="ink" r={-3} className="text-3xl">
          VENDIDA
        </Stamp>
        <p className="hand" style={{ fontSize: 22 }}>
          Ya se fue. Escribinos y te avisamos si entra otra.
        </p>
        <Button
          variant="pink"
          external
          href={whatsappUrl(
            publicEnv.whatsappNumber,
            `Hola Retake! Se vendió "${product.name}", ¿me avisás si entra otra?`,
          )}
        >
          Avisame por WhatsApp
        </Button>
      </div>
    );
  }
  return (
    <div className="cta">
      <Button
        variant="pink"
        external
        href={whatsappUrl(publicEnv.whatsappNumber, productWhatsappMessage(product, publicEnv.siteUrl))}
      >
        Lo quiero por WhatsApp
      </Button>
      <Button href="/botin">Volver al botín</Button>
    </div>
  );
}
