# DESIGN.md

El sistema visual de Retake. Para que cualquier pantalla nueva parezca salida del mismo zine.

## Concepto

Pop art punk, no cyberpunk de neón. La referencia es la estética DedSec de Watch Dogs 2: un fanzine fotocopiado tres veces, pegado con cinta, con stickers encima y una transmisión que a veces se corta. Todo parece hecho a mano y reproducido mal a propósito.

Cuatro ideas lo sostienen:

1. **Collage.** Las cosas están pegadas, no alineadas. Polaroids con cinta, stickers superpuestos, sellos de goma, anotaciones a marcador. Rotaciones chicas, entre -3° y 3°, nunca más.
2. **Tintas planas.** Negro, papel sucio y tres colores chillones. Sin degradados, sin brillos difusos, sin esquinas redondeadas. Las sombras son duras y desplazadas, como una impresión mal registrada.
3. **Textura de fotocopia.** Grano sobre toda la página, halftone y scanlines sobre las fotos, sellos desgastados con máscara de ruido.
4. **Glitch en pulsos.** La señal se corta un instante cada siete segundos y vuelve. Nunca es constante: el caos tiene que sorprender, no cansar.

### Qué sí y qué no

| Sí                                           | No                                        |
| -------------------------------------------- | ----------------------------------------- |
| Sombras duras `6px 6px 0` en color           | `box-shadow` difusas                      |
| Bordes de 3 px en tinta                      | Bordes de 1 px grises                     |
| Rotaciones de -3° a 3° vía `--r`             | Rotaciones grandes o animadas             |
| Un color chillón por elemento                | Degradados y neones con glow              |
| Tipografías mezcladas a propósito en títulos | Mezclar tipografías en el cuerpo de texto |
| Humor seco en el copy                        | Exclamaciones de marketing                |
| Caos en títulos, stickers y fondos           | Caos en precios, botones y formularios    |

## Tokens

### Color

| Token            | Hex       | Rol                                                |
| ---------------- | --------- | -------------------------------------------------- |
| `--color-ink`    | `#0a0a0a` | Fondo y tinta                                      |
| `--color-paper`  | `#f2efe6` | Papel: polaroids, cards, páginas del zine          |
| `--color-pink`   | `#ff2d8a` | Grito principal: CTAs, bursts, resaltador          |
| `--color-cyan`   | `#2de2ff` | Grito secundario: labels, marquee diagonal, sellos |
| `--color-acid`   | `#d9ff2d` | Anotaciones a mano, focus, marquee de ediciones    |
| `--color-yellow` | `#facc15` | Stickers, estrellas, cinta de peligro              |

En `globals.css` existen los alias cortos `--ink`, `--paper`, `--pink`, `--cyan`, `--acid`, `--yellow` para el CSS portado del mockup. En Tailwind: `bg-paper`, `text-ink`, `border-pink`, etc.

Regla de contraste: texto de cuerpo siempre papel sobre tinta o tinta sobre papel. Los colores chillones van en bloques con texto en tinta, nunca como color de texto sobre tinta salvo labels cortos en pixel.

### Tipografía

| Token            | Fuente           | Rol                                                      | Ejemplo                            |
| ---------------- | ---------------- | -------------------------------------------------------- | ---------------------------------- |
| `--font-shout`   | Anton            | Titulares, nombres de producto, números grandes          | TU INFANCIA, REIMPORTADA.          |
| `--font-sticker` | Bungee           | Stickers, bursts, botones, marquees, logo                | ¡RECIÉN LLEGADA!                   |
| `--font-pixel`   | Silkscreen       | Labels, kickers, specs, sellos, nav                      | // 02 — ÚLTIMOS INGRESOS           |
| `--font-hand`    | Permanent Marker | Notas al margen, epígrafes, la "nota corta" del producto | pantalla sin rayones, con cargador |
| `--font-body`    | Archivo          | Cuerpo de texto, descripciones, formularios              |                                    |

Las fuentes se cargan con `next/font/google` en `src/app/fonts.ts` y se exponen como variables en `<html>`. Tailwind: `font-shout`, `font-sticker`, `font-pixel`, `font-hand`, `font-body`.

### Texturas

- `--noise`: ruido SVG (feTurbulence) que `body::after` pinta sobre toda la página a opacidad 0.11 con `mix-blend-mode: screen`. El admin lo apaga con la clase `admin-root`.
- `--noise-soft`: ruido más suave, usado como `mask-image` de los sellos para que parezcan gastados.
- `.photo::after`: halftone (puntos cada 5 px) más scanlines (2 px) con `multiply`. Toda foto o sprite dentro de `.photo` lo hereda.
- `.paper-sec::before`: el mismo ruido invertido sobre las páginas de papel.

## Catálogo de piezas

Cada pieza es una clase CSS del mockup y un componente en `src/components/ui/`. Si existe la pieza, usala; no inventes otra.

| Pieza                 | Clase                                   | Componente                    | Cuándo                                                                                          |
| --------------------- | --------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Palabra recortada     | `.cut` (+ `.pink .cyan .acid .sm`)      | `Cut`                         | Titulares tipo nota de secuestro. Una o dos palabras por bloque, rotación distinta en cada uno. |
| Glitch                | `.glitch-wrap .slice`                   | `Glitch`                      | Envuelve el h1 del hero. Dos copias `aria-hidden` que se recortan en pulsos.                    |
| Resaltador            | `.hi`                                   | `Hi`                          | Una palabra del h2 con marcador detrás.                                                         |
| Encabezado de sección | `.sec-head .sec-label .h2 .sub`         | `SectionHead`                 | Label pixel numerado, h2 en Anton, bajada en cuerpo, nota a mano opcional.                      |
| Polaroid              | `.polaroid .caption`                    | `Polaroid`                    | Foto con marco de papel y epígrafe a mano. Hero y galería.                                      |
| Foto                  | `.photo` (+ `.paper .cyan .acid .pink`) | `Photo`                       | Contenedor con halftone. Variante por categoría (`photoVariantFor`).                            |
| Cinta                 | `.tape`                                 | `Tape`                        | Pegada torcida en el borde superior de polaroids, cards y notas.                                |
| Sticker               | `.sticker` (+ `.pink .cyan`)            | `Sticker`                     | Rectángulo con borde blanco y sombra. "Importado de Japón".                                     |
| Burst                 | `.burst` (+ colores)                    | `Burst`                       | Estrella de 14 puntas. Precios y "¡Recién llegada!".                                            |
| Sello                 | `.stamp` (+ `.cyan .ink`)               | `Stamp`, `StatusStamp`        | Borde doble, pixel, máscara de desgaste. Categorías, estados, fechas.                           |
| Botón                 | `.btn .btn-pink .btn-ink .btn-sm`       | `Button`, `SubmitButton`      | Borde 3 px, sombra dura. Al hover se desplaza y el texto se "imprime mal".                      |
| Marquee               | `.marquee` (+ `.cyan .acid .diag`)      | `Marquee`                     | Cinta que corre. Los ítems van duplicados exactamente dos veces.                                |
| Cinta de peligro      | `.hazard`                               | `Hazard`                      | Franjas amarillas y negras entre secciones.                                                     |
| Página rasgada        | `.paper-sec.torn`                       | `TornSection`                 | Sección en papel con bordes rasgados deterministas por semilla.                                 |
| Pantalla de arranque  | `.boot .cur`                            | `BootScreen`                  | Overlay BIOS que tipea seis líneas y se va. Una vez por sesión.                                 |
| Ícono pixel           | `.px`                                   | `PixelIcon`, `Skull`, `Stars` | Grillas de texto a SVG `crispEdges`. Nueve íconos en `grids.ts`.                                |
| Sprite                |                                         | `Sprite`, `ProductArt`        | Consola y cartucho en pixel art, paletas en `palettes.ts`. Fallback cuando no hay foto.         |
| Tarjeta de producto   | `.card .meta .note .row` (+ `.sold`)    | `ProductCard`                 | Polaroid con burst de precio, sello de categoría, nota a mano, botón. `.sold` estampa VENDIDA.  |
| Nota de reseña        | `.note-card .who`                       | `Reviews`                     | Papel con texto a marcador y estrellas pixel.                                                   |
| Etiqueta de categoría | `.tag`                                  | `Categories`                  | Cartel pegado que se endereza al hover.                                                         |

Rotaciones: siempre `style={rot(deg)}` sobre una clase que lea `var(--r)`. Las listas de rotaciones del mockup son `[-1.5, 1, -0.8, 1.4]` para cards, `[-1.5, 1, -0.5, 1.5]` para tags, `[-1.2, 1.5, -0.6]` para notas.

Colores de burst por posición: `pink, cyan, acid, yellow`, en ese orden, ciclando.

## Movimiento

| Efecto         | Duración                                          | Regla                                                                     |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| Glitch del h1  | ciclo de 7 s, activo ~0.3 s en dos pulsos         | `steps(1)`, desplazamientos de 5 a 9 px, un pulso con `hue-rotate`.       |
| Marquee        | 30 s por vuelta, lineal                           | `translateX(-50%)` sobre la lista duplicada.                              |
| Boot screen    | 150 ms por línea, 450 ms de pausa, 500 ms de fade | Se puede saltar con un clic. Guarda en `sessionStorage` que ya se mostró. |
| Hover de botón | 80 ms                                             | Desplazamiento de 3 px y sombra que cambia a cian.                        |
| Hover de card  | 120 ms                                            | Se endereza, escala 1.02 y la foto hace RGB split con `drop-shadow`.      |

`prefers-reduced-motion: reduce` apaga todas las animaciones y transiciones, oculta las copias del glitch y no muestra el boot screen. Es obligatorio en toda pieza nueva con movimiento.

## Backoffice

Mismo papel y tinta, mismos tokens, misma pixel para labels y mismos botones brutalistas. Pero **sin collage:** nada de rotaciones, ruido, marquees, stickers ni animaciones. Tablas con bordes de 3 px, inputs blancos con sombra dura al focus, errores en magenta con `role="alert"`.

Por qué: el admin se usa veinte veces por día para cargar fotos y cambiar precios. El caos es para quien visita una vez; quien trabaja ahí necesita calma.

## Voz

Rioplatense, voseo, frases cortas, humor seco. La tienda habla en primera persona del plural y se ríe un poco de sí misma. Nunca grita con signos de admiración de marketing.

| Sí                                                     | No                                     |
| ------------------------------------------------------ | -------------------------------------- |
| No es stock, es botín.                                 | ¡Los mejores precios del mercado!      |
| Soplar el cartucho no hace falta.                      | Tecnología de punta para tu colección. |
| Te acompañamos después de la compra, no desaparecemos. | Soporte 24/7 garantizado.              |
| Ya se fue. Escribinos y te avisamos si entra otra.     | Producto agotado.                      |
| la consola se colgó                                    | Error 404: página no encontrada        |

Las notas a mano van en minúscula y entre paréntesis cuando acotan: "(sí, también a Ushuaia)". Los labels pixel van en mayúscula con `//` como separador: `JP // 2009`.

## Responsive

- Hasta 900 px: el hero pasa a una columna, la nav se oculta y queda el botón de WhatsApp, los beneficios van en una columna, las categorías en dos.
- Hasta 480 px: categorías y cards en una columna; los stickers del hero se acercan al borde.
- Las piezas rotadas y absolutas viven dentro de contenedores con `overflow: hidden` o `position: relative` para no generar scroll horizontal.

## Accesibilidad

- Un `h1` por página, `h2` por sección, `h3` en cards.
- Todo lo decorativo (`Tape`, `Marquee`, `Hazard`, copias del glitch, boot) lleva `aria-hidden`.
- `Stars` expone `role="img"` con "4 de 5 estrellas". El WhatsApp flotante tiene `aria-label`.
- Focus visible de 3 px en todo elemento interactivo: ácido sobre tinta, tinta sobre papel (el ácido no se ve sobre papel).
- Errores de formulario sobre papel en `#c2005c`, no en magenta: el magenta puro no llega a 4.5:1 sobre papel.
- Contraste mínimo 4.5:1 en texto de lectura. Los labels pixel sobre tinta usan papel al 60 % o más.

## Referencias

- `design/mockup.html`: el mockup original, autocontenido. Abrilo en el navegador.
- `design/mockup-desktop.png`, `design/mockup-mobile.png`: cómo tiene que verse.
- `design/MOCKUP-NOTES.md`: notas de las piezas del mockup.
- `/dev/ui` con `pnpm dev`: el mockup rehecho con componentes.
