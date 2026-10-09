import { seededRandom } from './random';

/** Igual al JS del mockup: 14 puntas, radio interno .8. Determinista, seguro en SSR. */
export function burstClipPath(points = 14, inner = 0.8): string {
  const p: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 ? 50 * inner : 50;
    p.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`);
  }
  return `polygon(${p.join(',')})`;
}

/** Bordes rasgados del mockup con PRNG sembrado: SSR y cliente generan el mismo polígono. */
export function tornClipPath(seed: string | number, step = 2.5, amp = 16): string {
  const rnd = seededRandom(seed);
  const pts: string[] = [];
  for (let x = 0; x <= 100; x += step) pts.push(`${x}% ${(rnd() * amp).toFixed(1)}px`);
  for (let x = 100; x >= 0; x -= step) pts.push(`${x}% calc(100% - ${(rnd() * amp).toFixed(1)}px)`);
  return `polygon(${pts.join(',')})`;
}
