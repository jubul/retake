import { PixelIcon, WhatsAppLink } from '@/components/ui';
import { GENERIC_WHATSAPP_MESSAGE } from '@/lib/utils/whatsapp';

export function WhatsAppFloat() {
  return (
    <WhatsAppLink className="wa" message={GENERIC_WHATSAPP_MESSAGE} aria-label="Escribinos por WhatsApp">
      <PixelIcon name="chat" />
    </WhatsAppLink>
  );
}
