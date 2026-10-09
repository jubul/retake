import type { AnchorHTMLAttributes } from 'react';
import { publicEnv } from '@/lib/public-env';
import { whatsappUrl } from '@/lib/utils/whatsapp';

type WhatsAppLinkProps = { message?: string } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel'
>;

export function WhatsAppLink({ message, children, ...rest }: WhatsAppLinkProps) {
  return (
    <a
      {...rest}
      href={whatsappUrl(publicEnv.whatsappNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
