/** FNV-1a 32 bits. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: devuelve valores en [0,1). */
export function seededRandom(seed: string | number): () => number {
  let a = (typeof seed === 'number' ? seed : hashString(seed)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(seed: string | number, list: readonly T[]): T {
  if (list.length === 0) throw new Error('pick: empty list');
  return list[Math.floor(seededRandom(seed)() * list.length)] as T;
}
