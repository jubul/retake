import { GRIDS, gridToRects, type IconName } from '@/lib/pixel/grids';

type PixelIconProps = {
  name: IconName;
  color?: string;
  title?: string;
  className?: string;
};

export function PixelIcon({ name, color = 'currentColor', title, className }: PixelIconProps) {
  const grid = GRIDS[name];
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      fill={color}
      className={className}
      {...(title ? { role: 'img' } : { 'aria-hidden': true })}
    >
      {title ? <title>{title}</title> : null}
      {gridToRects(grid).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} />
      ))}
    </svg>
  );
}
