import type { CSSProperties } from 'react';

/** Permite custom properties en style sin castear en cada uso: cssVars({ '--r': '-2deg' }) */
export function cssVars(vars: Record<`--${string}`, string | number>, base?: CSSProperties): CSSProperties {
  return { ...base, ...vars } as CSSProperties;
}

/** Atajo: rot(-2) -> cssVars({ '--r': '-2deg' }) */
export function rot(deg: number, base?: CSSProperties): CSSProperties {
  return cssVars({ '--r': `${deg}deg` }, base);
}
