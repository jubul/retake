# CLAUDE.md

Guía para trabajar en este repo con Claude Code. Leela entera antes de tocar código.

## Qué es

Retake: tienda de consolas retro importadas de Japón. Sitio público con estética de zine fotocopiado y un backoffice simple para el ABM de productos. Venta por WhatsApp, sin carrito. Un solo admin.

## Stack (versiones pineadas, sin `^`)

- Next.js 16.4 (App Router, Turbopack, Server Actions, `src/proxy.ts` en lugar de middleware), React 19.3, TypeScript 5.9 estricto.
- Tailwind CSS 4 vía `@tailwindcss/postcss`. Tokens en `@theme` dentro de `src/app/globals.css`. Sin shadcn ni librerías de UI.
- Drizzle ORM + `@libsql/client`. SQLite en archivo local o Turso con la misma conexión.
- zod 4 para validar env, formularios y archivos. jose para la sesión JWT. sharp para procesar fotos.
- Vitest 5. Prettier. ESLint 9 con `eslint-config-next` (flat config).
- **pnpm 12 es el único gestor.** `pnpm-workspace.yaml` existe solo por `allowBuilds`: sin eso pnpm 12 rechaza los scripts de build de esbuild, sharp y unrs-resolver.

## Comandos

```bash
pnpm dev                 # desarrollo (un solo `next dev` por proyecto: tiene lock en .next/dev)
pnpm check               # lint + typecheck + test + build. Tiene que pasar antes de cada commit.
pnpm test                # vitest, ~1 s
pnpm db:generate         # nueva migración tras cambiar src/lib/db/schema.ts
pnpm db:migrate          # aplica drizzle/ a DATABASE_URL
pnpm db:seed [--reset]   # 4 productos de ejemplo
pnpm db:setup            # migrate + seed
pnpm format
```

Primera vez: `pnpm install && cp .env.example .env.local && pnpm db:setup`. En `.env.local` completá `SESSION_SECRET` (`openssl rand -hex 32`) y `ADMIN_PASSWORD`.

## Mapa

```
src/app/(site)/            home, /botin, /botin/[slug]        (RSC, force-dynamic)
src/app/admin/(auth)/      /admin/login                        (público)
src/app/admin/(panel)/     /admin, /admin/productos/...        (requireSession en el layout, error.tsx propio)
src/app/uploads/[...path]/ route handler que sirve data/uploads
src/app/dev/ui/            galería de primitivas con datos fijos (404 en producción)
src/proxy.ts               protege /admin con la cookie de sesión
src/components/ui/         primitivas del mockup (Cut, Polaroid, Burst, Stamp, Marquee, Glitch, BootScreen...)
src/components/site/       secciones públicas (Hero, LatestLoot, ProductCard, Reviews...)
src/components/admin/      shell, tabla, filtros, formularios del backoffice
src/lib/env.ts             getEnv(): valida process.env con zod, lazy y memoizado
src/lib/public-env.ts      NEXT_PUBLIC_* para cliente y servidor
src/lib/db/                schema.ts, client.ts (getDb singleton), migrate.ts
src/lib/products/          constants (categorías/estados), types, schemas (zod), queries (lecturas), repo (escrituras), actions (Server Actions), cached (React cache() por request)
src/lib/auth/              session (JWT puro), password (timing-safe), server (cookies), actions (login/logout), rate-limit (intentos por IP, en memoria)
src/lib/storage/           interfaz Storage, LocalStorage, images (sharp), upload
src/lib/utils/             slugify, formatPrice, whatsappUrl, rot/cssVars, seededRandom, burstClipPath/tornClipPath
src/lib/pixel/             grillas de pixel art y paletas de los sprites
src/content/reviews.json   reseñas estáticas (v1)
design/                    mockup.html original, capturas, MOCKUP-NOTES.md
docs/PLAN.md               plan de implementación con los contratos originales
tests/                     vitest; helpers/db.ts da una DB :memory: migrada
```

## Convenciones

- Código, identificadores, commits y comentarios en inglés. Copy de UI en español rioplatense con voseo ("Elegí una categoría", "Escribinos").
- Server Components por defecto. `'use client'` solo donde hay estado o eventos: `BootScreen`, `NavLinks`, `ProductGallery`, `ProductForm`, `ImageManager`, `DeleteProductButton`, `LoginForm`, `SubmitButton`.
- Un componente por archivo, `PascalCase.tsx`, export nombrado. `page`, `layout` y `route` usan export default.
- Lecturas en `queries.ts`, escrituras en `repo.ts`: funciones puras sobre `Db`, sin imports de `next/*`, testeables con `:memory:`. Las Server Actions en `actions.ts` validan sesión, parsean `FormData`, llaman al repo y revalidan.
- Las actions devuelven `ActionResult` (`{ ok: true, id } | { ok: false, errors }`); nunca un stack trace. `redirect()` siempre fuera de `try/catch`.
- Páginas que leen la DB exportan `const dynamic = 'force-dynamic'`.
- Estilos: las clases del mockup viven en `globals.css` (`@layer components`) con sus nombres originales. Tailwind solo para layout nuevo (admin). Rotaciones con `style={rot(-2)}` y una clase que lea `var(--r)`.

## Reglas de oro

1. Nada de `any`. `strict` y `noUncheckedIndexedAccess` están activos.
2. Nada aleatorio en render. Bordes rasgados y bursts usan helpers deterministas con semilla. Si rompés esto, aparecen errores de hidratación.
3. Env solo a través de `getEnv()` en servidor y `publicEnv` en cliente. Nunca `process.env.X` suelto.
4. Toda mutación pasa por una Server Action que llama `await requireSession()` en la primera línea, aunque el proxy ya proteja la ruta.
5. No edites `drizzle/` a mano. Cambiá el schema y corré `pnpm db:generate`.
6. No agregues `server-only`: rompe scripts y tests en Node plano. La separación es por convención.
7. Respetá `prefers-reduced-motion`: sin glitch, marquee ni boot screen.
8. `pnpm check` verde antes de commitear. Los commits no se pushean sin que el dueño lo pida.

## Recetas

**Agregar un campo a producto.** `src/lib/db/schema.ts` → `pnpm db:generate` → `pnpm db:migrate` → `productInputSchema` en `schemas.ts` → `ProductForm` (campo + label + error) → donde se muestre (`ProductCard`, `ProductSpecs`, `ProductsTable`) → test en `products.schemas.test.ts`.

**Cambiar el storage a Cloudinary o Blob.** Implementá `Storage` (`src/lib/storage/types.ts`) en un archivo nuevo y cambiá el singleton de `src/lib/storage/index.ts`. `saveProductImage` y el route handler no cambian. Si el CDN sirve las fotos, `publicUrl` devuelve la URL absoluta y las cards la usan tal cual.

**Agregar una sección al sitio.** Componente RSC en `src/components/site/`, datos desde `queries.ts`, markup con primitivas de `@/components/ui`, copy en `DESIGN.md` → voz. Sumala a `src/app/(site)/page.tsx`.

**Agregar un ícono pixel.** Grilla de texto en `src/lib/pixel/grids.ts` (`X` = píxel) y el nombre al tipo `IconName`. `PixelIcon` lo renderiza como SVG.

**Verificar visualmente.** `pnpm dev` y abrí `/dev/ui`: es el mockup rehecho con componentes y datos fijos. Compará con `design/mockup-desktop.png`.

## Lo que no está (a propósito)

Reseñas en DB, multi-admin, rate limit persistente (el actual es en memoria y por proceso), storage remoto, i18n. Está todo en el roadmap del README. No lo agregues sin que el dueño lo pida.
