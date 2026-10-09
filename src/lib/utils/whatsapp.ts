import { formatPrice } from './format';

/** 'https://wa.me/<solo dígitos>' + (message ? '?text=' + encodeURIComponent(message) : '') */
export function whatsappUrl(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function productWhatsappMessage(
  p: { name: string; slug: string; price: number },
  siteUrl: string,
): string {
  return `Hola Retake! Me interesa "${p.name}" (${formatPrice(p.price)}). ${siteUrl}/botin/${p.slug}`;
}

export const GENERIC_WHATSAPP_MESSAGE = 'Hola Retake';
