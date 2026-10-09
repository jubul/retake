# Retake — mockup estética DedSec

Mockup estático de una tienda de consolas retro importadas de Japón, con la estética
de DedSec (Watch Dogs 2): zine fotocopiado, collage, tintas planas y glitch en pulsos.

## Cómo verlo

Abrí `index.html` en el navegador. Necesita internet la primera vez para bajar las
tipografías de Google Fonts. Todo lo demás es CSS, SVG y un poco de JS inline.

Capturas de referencia: `preview-desktop.png` y `preview-mobile.png`.

## Tokens

| Rol        | Valor     |
|------------|-----------|
| Fondo      | `#0a0a0a` |
| Papel      | `#f2efe6` |
| Magenta    | `#ff2d8a` |
| Cian       | `#2de2ff` |
| Verde ácido| `#d9ff2d` |
| Amarillo   | `#facc15` |

| Uso            | Tipografía        |
|----------------|-------------------|
| Titulares      | Anton             |
| Stickers, botones, marquee | Bungee |
| Labels pixel   | Silkscreen        |
| Anotaciones    | Permanent Marker  |
| Cuerpo         | Archivo           |

## Piezas reutilizables

- `.cut` — palabra recortada tipo nota de secuestro. Variantes `.pink`, `.cyan`, `.acid`, `.sm`.
  Rotación con `style="--r:-2deg"`.
- `.polaroid` + `.photo` — foto pegada con borde blanco. `.photo` aplica halftone y scanlines
  con un pseudo-elemento, así que sirve con imágenes reales también.
- `.tape` — cinta de papel. Posicionar con `left/top` y rotar con `--r`.
- `.sticker` — sticker con borde blanco y sombra dura. Variantes `.pink`, `.cyan`.
- `.burst` — sticker estrella. El JS calcula el `clip-path`.
- `.stamp` — sello de goma desgastado con máscara de ruido. Variantes `.cyan`, `.ink`.
- `.btn` — botón brutalista. Variantes `.btn-pink`, `.btn-ink`, `.btn-sm`.
- `.marquee` — cinta que corre. Variantes `.cyan`, `.acid`, `.diag` (cruzada en el hero).
- `.paper-sec.torn` — página de papel con bordes rasgados. El JS genera el polígono.
- `.hazard` — cinta de peligro amarilla y negra.
- `.glitch-wrap` + `#h1` — el JS clona el titular dos veces y los anima en pulsos
  cada 7 segundos. Respeta `prefers-reduced-motion`.
- `.boot` — pantalla de arranque tipo BIOS. Se va sola en 1.5 s o con un clic.
- `.px[data-icon]` y `.skull` — íconos pixel dibujados desde grillas de texto en el JS.
  Para agregar uno, sumá una grilla a `GRIDS`.

## Para pasarlo al proyecto real

El sitio actual es Next.js con Tailwind 4 y shadcn. Los tokens entran directo en el
`@theme` de Tailwind, y las piezas de arriba se convierten en componentes.
Las fotos reales de productos van dentro de `.photo` y heredan el halftone.
Reemplazar el número de WhatsApp placeholder `5491100000000`.

Ojo con la marca: la estética se copia, el logo y los assets de Ubisoft no.
La calavera pixel es propia.
