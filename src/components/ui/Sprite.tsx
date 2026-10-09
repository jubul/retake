import type { CartPalette, ConsolePalette } from '@/lib/pixel/palettes';

type SpriteProps = { className?: string } & (
  { kind: 'ds'; palette: ConsolePalette } | { kind: 'cart'; palette: CartPalette }
);

/** Consola y cartucho en pixel art (los dos <symbol> del mockup), con colores por props. */
export function Sprite(props: SpriteProps) {
  if (props.kind === 'ds') {
    const { shell, screen, screen2 } = props.palette;
    return (
      <svg viewBox="0 0 40 36" shapeRendering="crispEdges" aria-hidden="true" className={props.className}>
        <rect x="4" y="1" width="32" height="15" fill={shell} />
        <rect x="9" y="3" width="22" height="11" fill="#111" />
        <rect x="10" y="4" width="20" height="9" fill={screen} />
        <rect x="12" y="9" width="4" height="3" fill="#111" />
        <rect x="24" y="7" width="3" height="5" fill="#111" />
        <rect x="18" y="10" width="3" height="2" fill="#ff2d8a" />
        <rect x="21" y="5" width="2" height="2" fill="#f2efe6" />
        <rect x="4" y="16" width="32" height="2" fill="rgba(0,0,0,.35)" />
        <rect x="4" y="18" width="32" height="17" fill={shell} />
        <rect x="13" y="20" width="14" height="11" fill="#111" />
        <rect x="14" y="21" width="12" height="9" fill={screen2} />
        <rect x="16" y="23" width="3" height="3" fill="#111" />
        <rect x="21" y="25" width="3" height="3" fill="#111" />
        <rect x="6" y="19" width="4" height="3" fill="#333" />
        <rect x="7" y="23" width="2" height="6" fill="#222" />
        <rect x="5" y="25" width="6" height="2" fill="#222" />
        <rect x="32" y="21" width="2" height="2" fill="#222" />
        <rect x="34" y="23" width="2" height="2" fill="#222" />
        <rect x="30" y="23" width="2" height="2" fill="#222" />
        <rect x="32" y="25" width="2" height="2" fill="#222" />
        <rect x="29" y="31" width="3" height="1" fill="#222" />
        <rect x="33" y="31" width="3" height="1" fill="#222" />
      </svg>
    );
  }
  const { shell, label } = props.palette;
  return (
    <svg viewBox="0 0 24 28" shapeRendering="crispEdges" aria-hidden="true" className={props.className}>
      <rect x="2" y="1" width="20" height="25" fill={shell} />
      <rect x="2" y="1" width="20" height="2" fill="rgba(0,0,0,.3)" />
      <rect x="4" y="5" width="16" height="14" fill={label} />
      <rect x="6" y="7" width="12" height="2" fill="#111" />
      <rect x="6" y="11" width="8" height="2" fill="#111" />
      <rect x="6" y="15" width="10" height="2" fill="#ff2d8a" />
      <rect x="4" y="21" width="16" height="5" fill="rgba(0,0,0,.45)" />
      {[5, 7, 9, 11, 13, 15, 17].map((x) => (
        <rect key={x} x={x} y="22" width="1" height="3" fill={shell} />
      ))}
    </svg>
  );
}
