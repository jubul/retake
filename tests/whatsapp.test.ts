import { describe, expect, it } from 'vitest';
import { GENERIC_WHATSAPP_MESSAGE, productWhatsappMessage, whatsappUrl } from '@/lib/utils/whatsapp';

describe('whatsapp', () => {
  it('whatsappUrl strips non-digits and encodes the message', () => {
    expect(whatsappUrl('+54 9 11 0000-0000', 'Hola Retake')).toBe(
      'https://wa.me/5491100000000?text=Hola%20Retake',
    );
  });
  it('whatsappUrl without message has no query', () => {
    expect(whatsappUrl('5491100000000')).toBe('https://wa.me/5491100000000');
  });
  it('productWhatsappMessage builds the product message', () => {
    expect(
      productWhatsappMessage({ name: 'DS Lite', slug: 'ds-lite', price: 180000 }, 'https://retake.ar'),
    ).toBe('Hola Retake! Me interesa "DS Lite" ($180.000). https://retake.ar/botin/ds-lite');
    expect(GENERIC_WHATSAPP_MESSAGE).toBe('Hola Retake');
  });
});
