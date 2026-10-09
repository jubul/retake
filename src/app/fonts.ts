// src/app/fonts.ts
import { Anton, Archivo, Bungee, Permanent_Marker, Silkscreen } from 'next/font/google';

export const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-anton' });
export const bungee = Bungee({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bungee',
});
export const silkscreen = Silkscreen({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-silkscreen',
});
export const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-permanent-marker',
});
export const archivo = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-archivo' }); // variable font (si el tipo exige weight: 'variable')

export const fontClassName = [anton, bungee, silkscreen, permanentMarker, archivo]
  .map((f) => f.variable)
  .join(' ');
