export type IconName = 'skull' | 'truck' | 'star' | 'headset' | 'chat' | 'ds' | 'cart' | 'plug' | 'box';

/** Los 9 grids del mockup, tal cual. 'X' = pixel lleno. */
export const GRIDS: Record<IconName, readonly string[]> = {
  skull: [
    '..XXXXXX..',
    '.XXXXXXXX.',
    'XXXXXXXXXX',
    'XX..XX..XX',
    'XX..XX..XX',
    'XXXXXXXXXX',
    'XXXX..XXXX',
    '.XXXXXXXX.',
    '..X.XX.X..',
    '..X.XX.X..',
  ],
  truck: [
    '..........',
    '.XXXXXX...',
    '.XXXXXXXX.',
    '.XXXXXX.XX',
    '.XXXXXXXXX',
    'XXXXXXXXXX',
    '..XX...XX.',
    '..........',
  ],
  star: ['....X....', '...XXX...', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '.XXX.XXX.', 'XX.....XX'],
  headset: [
    '...XXXX...',
    '..X....X..',
    '.X......X.',
    '.X......X.',
    'XXX....XXX',
    'XXX....XXX',
    'XXX....XXX',
    '.X......X.',
  ],
  chat: ['.XXXXXXXX.', 'XXXXXXXXXX', 'XX.XX.X.XX', 'XXXXXXXXXX', '.XXXXXXXX.', '...XX.....', '..XX......'],
  ds: [
    'XXXXXXXXXX',
    'X.XXXXXX.X',
    'X.X....X.X',
    'X.XXXXXX.X',
    'XXXXXXXXXX',
    'XXXXXXXXXX',
    'X.X.XX.X.X',
    'XXX.XX.XXX',
    'X.XXXXXX.X',
    'XXXXXXXXXX',
  ],
  cart: [
    '.XXXXXXXX.',
    '.X......X.',
    '.X.XXXX.X.',
    '.X.X..X.X.',
    '.X.XXXX.X.',
    '.X......X.',
    '.XXXXXXXX.',
    '.X.X.X.XX.',
    '.XXXXXXXX.',
  ],
  plug: [
    '..X....X..',
    '..X....X..',
    '.XXXXXXXX.',
    '.XXXXXXXX.',
    '.XXXXXXXX.',
    '..XXXXXX..',
    '....XX....',
    '....XX....',
    '....XX....',
  ],
  box: [
    '....XX....',
    '..XXXXXX..',
    'XXXXXXXXXX',
    'X..XXXX..X',
    'X..XXXX..X',
    'XXXXXXXXXX',
    '.XXXXXXXX.',
    '..XXXXXX..',
  ],
};

/** Comprime cada fila en runs: [{ x, y, w }] para menos <rect>. */
export function gridToRects(grid: readonly string[]): Array<{ x: number; y: number; w: number }> {
  const rects: Array<{ x: number; y: number; w: number }> = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === 'X') {
        const start = x;
        while (x < row.length && row[x] === 'X') x++;
        rects.push({ x: start, y, w: x - start });
      } else {
        x++;
      }
    }
  });
  return rects;
}
