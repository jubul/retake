import type { Metadata } from 'next';
import { fontClassName } from './fonts';
import { publicEnv } from '@/lib/public-env';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: 'RETAKE // Retomá lo que era tuyo', template: '%s // RETAKE' },
  description:
    'Nintendo DS, 3DS, cartuchos y rarezas importadas de Japón. Elegidas una por una. Envíos a todo el país.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontClassName}>
      <body id="top">{children}</body>
    </html>
  );
}
