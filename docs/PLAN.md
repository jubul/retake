# RETAKE — Plan de implementación (v1)

> Fuente única de verdad para implementar el sitio + backoffice de **Retake** ("Retomá lo que era tuyo").
> Escrito el 2026-10-09. Los agentes que implementan **no ven el brief original**: todo lo que necesitan está acá.
> Código, identificadores, commits y comentarios en inglés. Copy de UI en español rioplatense (voseo).
> Mockup de referencia: `design/mockup.html` (+ `design/mockup-desktop.png`, `design/mockup-mobile.png`, `design/MOCKUP-NOTES.md`), ya commiteado en el repo. Leelo antes de tocar UI.

---

## 1. Overview y objetivos

1. Tienda de consolas Nintendo DS/3DS, cartuchos, accesorios y estuches usados, importados de Japón. Venta solo por WhatsApp (sin carrito ni checkout).
2. Sitio público que reproduce **fielmente** el mockup estático (estética DedSec / Watch Dogs 2: zine fotocopiado, collage, tintas planas, glitch en pulsos) como componentes React.
3. Backoffice "tranqui": un admin, login con contraseña, ABM de productos con fotos. Mismos tokens, sin el caos del collage.
4. Stack: Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, TypeScript strict, Tailwind 4 (`@theme`), Drizzle + libsql (archivo local o Turso), zod, jose, sharp. Sin shadcn ni librerías de UI.
5. Rutas públicas: `/`, `/botin`, `/botin/[slug]`, `not-found`. Admin: `/admin/login`, `/admin`, `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/[id]`.
6. Uploads al filesystem local (`data/uploads/`) detrás de una interfaz `Storage` para cambiar a Cloudinary/Blob después.
7. Reseñas estáticas en JSON (v1). Moderación queda en el roadmap.
8. Calidad: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` deben pasar al final de **cada** tarea.
9. Accesibilidad: `prefers-reduced-motion` desactiva glitch/marquee/boot; headings semánticos; labels en todos los campos; focus visible.
10. El repo se regala a un amigo (el dueño de la tienda): todo debe ser simple de leer, correr y deployar (Vercel + Turso o un VPS con el archivo sqlite).

---

## 2. Versiones a pinear (verificadas con `npm view` el 2026-10-09) y hechos de Next.js

### 2.1 Versiones exactas (sin `^`)

| Paquete | Versión | Tipo | Nota |
|---|---|---|---|
| `next` | `16.4.0` | dep | latest estable |
| `react` | `19.3.0` | dep | |
| `react-dom` | `19.3.0` | dep | |
| `drizzle-orm` | `0.45.4` | dep | exporta `drizzle-orm/libsql` y `drizzle-orm/libsql/migrator` |
| `@libsql/client` | `0.18.0` | dep | soporta `:memory:`, `file:` y `libsql://` |
| `zod` | `4.6.5` | dep | API v4: `z.flattenError`, `z.url()`, opción `error:` |
| `jose` | `6.2.12` | dep | `SignJWT` / `jwtVerify` HS256 |
| `sharp` | `0.35.5` | dep | binarios prebuilt vía optionalDependencies, sin install script |
| `@paralleldrive/cuid2` | `3.3.0` | dep | `createId()` para ids |
| `typescript` | `5.9.3` | dev | **NO 7.x** (ver 2.2 punto 8) |
| `@types/node` | `22.20.5` | dev | Node 22 |
| `@types/react` | `19.3.0` | dev | |
| `@types/react-dom` | `19.3.0` | dev | |
| `tailwindcss` | `4.3.3` | dev | |
| `@tailwindcss/postcss` | `4.3.3` | dev | |
| `postcss` | `8.5.29` | dev | |
| `drizzle-kit` | `0.31.11` | dev | solo `generate`; trae esbuild (script de build, ver 2.2 punto 9) |
| `tsx` | `4.23.15` | dev | para `scripts/*.ts` vía `node --import=tsx` |
| `vitest` | `5.0.3` | dev | sin `@vitejs/plugin-react` (no hay tests de componentes) |
| `eslint` | `9.39.5` | dev | `eslint-config-next@16` requiere ESLint ≥ 9; 9.x es la combinación más probada |
| `eslint-config-next` | `16.4.0` | dev | flat config |
| `prettier` | `3.9.9` | dev | |

No instalar: `@vitejs/plugin-react`, `nanoid`, `dotenv`, `server-only` (ver gotchas: `server-only` rompe scripts y tests en Node plano).

Entorno: Node `22.23.2`, pnpm `12.4.2`. `next` y `sharp` exigen Node ≥ 20.9.

### 2.2 Hechos de Next.js 16.4 verificados en nextjs.org (no adivinar)

1. **`proxy.ts` reemplaza a `middleware.ts`** (deprecado en 16). Va en `src/proxy.ts` (mismo nivel que `src/app`). Exporta `export function proxy(request: NextRequest)` (o default) y `export const config = { matcher: [...] }`. Corre **solo en runtime Node.js** (no se puede configurar `runtime`). El matcher `'/admin/:path*'` matchea también `/admin`.
2. **`params` y `searchParams` son `Promise`** en `page.tsx`, `layout.tsx` y `route.ts`. `cookies()` y `headers()` también son async. El acceso síncrono fue eliminado en 16. Tipar a mano: `{ params: Promise<{ slug: string }> }`. **No usar** los helpers globales `PageProps`/`RouteContext` (se generan en `.next/types` y no existen hasta correr `next typegen`/`build`; evitamos esa dependencia).
3. **`next.config.ts`** soportado. Server Actions estables; el límite de body se configura en `experimental.serverActions.bodySizeLimit` (string tipo `'32mb'`; default 1 MB; incluye overhead multipart).
4. **`next lint` fue eliminado.** `pnpm lint` = `eslint .`. `eslint-config-next@16` usa flat config (`eslint.config.mjs` con `defineConfig` de `eslint/config`). La key `eslint` en `next.config` ya no existe. `next build` no lintea.
5. **Turbopack es default** en `dev` y `build` (no hace falta `--turbopack`). `next dev` escribe en `.next/dev`; hay lockfile: no se pueden correr dos `next dev` a la vez.
6. **`next/font/google`**: las fuentes no variables (Anton, Bungee, Silkscreen, Permanent Marker) requieren `weight`; se usa `variable: '--font-x'` y se aplican las clases `.variable` al `<html>`. Con Tailwind 4 se mapean en `@theme inline { --font-shout: var(--font-anton) }`. El loader se llama en scope de módulo (`src/app/fonts.ts`). Necesita internet en `build`.
7. **React 19.3** (`next@16.4.0` peer `^19.0.0`).
8. **TypeScript 7** es soportado por `next build` vía el CLI `tsc` local, pero TS 7 **no provee la API JS del compilador**, que `typescript-eslint` (usado por `eslint-config-next`) necesita. Se pinea **5.9.3**.
9. **pnpm 12 falla `pnpm install` con `ERR_PNPM_IGNORED_BUILDS`** si alguna dependencia tiene scripts de build no aprobados (`esbuild` vía drizzle-kit/tsx/vitest, `unrs-resolver` vía eslint-config-next). Verificado empíricamente. Solución: `pnpm-workspace.yaml` con `allowBuilds` **antes** de instalar. `onlyBuiltDependencies` fue removido en pnpm 11.
10. `revalidateTag` ahora exige 2.º argumento; usamos solo `revalidatePath` (sin cambios).
11. Route handlers: `export async function GET(request: Request, ctx: { params: Promise<{ path: string[] }> })`.
12. `create-next-app@16.4.0` flags útiles: `--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install --disable-git --no-agent-feedback`. Genera `AGENTS.md` (`--agents-md` es default; dejarlo).
13. `@libsql/client`: `createClient({ url: ':memory:' })`, `createClient({ url: 'file:./data/retake.db' })`, `createClient({ url: 'libsql://...', authToken })`. Usar el entry de Node (no `/web`).

---

## 3. Estructura de carpetas

```
retake/
├── AGENTS.md                      # generado por create-next-app (dejar)
├── CLAUDE.md  DESIGN.md  README.md   # los escribe Juan después (NO crear)
├── .env.example
├── .gitignore
├── .prettierrc  .prettierignore
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── package.json  pnpm-lock.yaml  pnpm-workspace.yaml
├── tsconfig.json
├── vitest.config.ts
├── drizzle.config.ts
├── drizzle/                       # migraciones generadas (commiteadas)
│   ├── 0000_*.sql
│   └── meta/_journal.json, 0000_snapshot.json
├── data/                          # gitignored salvo .gitkeep
│   ├── .gitkeep
│   ├── retake.db                  # sqlite local (dev)
│   └── uploads/.gitkeep           # fotos procesadas
├── design/                        # ya existe en el repo (commit inicial)
│   ├── mockup.html                # el mockup estático: CSS, sprites SVG, JS inline
│   ├── mockup-desktop.png  mockup-mobile.png
│   └── MOCKUP-NOTES.md            # tokens y piezas reutilizables
├── docs/
│   └── PLAN.md                    # este archivo
├── scripts/
│   ├── migrate.ts
│   └── seed.ts
├── tests/                         # vitest (solo *.test.ts)
└── src/
    ├── instrumentation.ts         # valida env al arrancar el server
    ├── proxy.ts                   # protege /admin
    ├── app/
    │   ├── layout.tsx  fonts.ts  globals.css  icon.svg  not-found.tsx
    │   ├── robots.ts  sitemap.ts
    │   ├── (site)/
    │   │   ├── layout.tsx         # TopBar + Footer + WhatsAppFloat
    │   │   ├── page.tsx           # home
    │   │   └── botin/
    │   │       ├── page.tsx       # catálogo
    │   │       └── [slug]/page.tsx
    │   ├── admin/
    │   │   ├── (auth)/login/page.tsx
    │   │   └── (panel)/
    │   │       ├── layout.tsx     # requireSession + AdminShell
    │   │       ├── page.tsx       # dashboard
    │   │       └── productos/
    │   │           ├── page.tsx
    │   │           ├── nuevo/page.tsx
    │   │           └── [id]/page.tsx
    │   ├── dev/ui/page.tsx        # galería de primitivas (404 en producción)
    │   └── uploads/[...path]/route.ts
    ├── components/
    │   ├── ui/                    # primitivas del mockup (Cut, Polaroid, Burst, ...)
    │   ├── site/                  # secciones del sitio público
    │   └── admin/                 # shell, tablas, forms del backoffice
    ├── content/
    │   ├── reviews.json
    │   └── reviews.ts
    └── lib/
        ├── env.ts  public-env.ts
        ├── db/        schema.ts  client.ts  migrate.ts
        ├── products/  constants.ts  types.ts  schemas.ts  queries.ts  repo.ts  actions.ts
        ├── auth/      session.ts  password.ts  server.ts  actions.ts
        ├── storage/   types.ts  local.ts  index.ts  images.ts  upload.ts
        ├── pixel/     grids.ts  palettes.ts
        └── utils/     slugify.ts  format.ts  whatsapp.ts  cn.ts  css.ts  random.ts  shapes.ts  date.ts  form.ts
```

Convenciones:
- Alias `@/*` → `src/*`.
- Server Components por default. `'use client'` solo en: `BootScreen`, `NavLinks`, `ProductGallery`, `ProductForm`, `ImageManager`, `DeleteProductButton`, `LoginForm`, `SubmitButton`.
- Nada de `any`. `strict: true`. Sin `// eslint-disable` salvo justificado en comentario.
- Un componente por archivo, `PascalCase.tsx`, export nombrado (no default) salvo `page/layout/route`.

---

## 4. Contratos compartidos (copiar textual)

Todo lo de esta sección se implementa **exactamente así** (nombres, firmas, rutas). Si una tarea necesita cambiar un contrato, lo anota en su reporte y se resuelve en la ola de integración; no lo cambia por su cuenta.

### 4.1 Variables de entorno — `src/lib/env.ts` y `src/lib/public-env.ts`

`.env.example` (copiar a `.env.local` para desarrollar):

```dotenv
# Base de datos: archivo local (dev) o Turso (prod: libsql://<db>.turso.io + token)
DATABASE_URL=file:./data/retake.db
DATABASE_AUTH_TOKEN=

# Admin (un solo usuario). Mínimo 8 caracteres.
ADMIN_PASSWORD=cambiame-ya-por-favor
# Secreto para firmar la sesión (JWT HS256). Mínimo 32 chars: openssl rand -hex 32
SESSION_SECRET=

# Dónde se guardan las fotos procesadas (relativo al root del proyecto)
UPLOADS_DIR=data/uploads

# Públicas (se inyectan en el cliente)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=5491100000000
NEXT_PUBLIC_INSTAGRAM=retake.ar
```

```ts
// src/lib/env.ts  (SOLO importar desde código de servidor, scripts y tests)
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD: mínimo 8 caracteres'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET: mínimo 32 caracteres'),
  UPLOADS_DIR: z.string().min(1).default('data/uploads'),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().regex(/^\d{8,15}$/, 'Solo dígitos, con código de país (ej. 549...)'),
  NEXT_PUBLIC_INSTAGRAM: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Parsea process.env una sola vez. Lanza un Error legible si falta algo. */
export function getEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(result.error)}`);
  }
  cached = result.data;
  return cached;
}
```

```ts
// src/lib/public-env.ts  (usable en cliente y servidor; referencias literales para que Next las inyecte)
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? '',
} as const;
```

```ts
// src/instrumentation.ts  — valida env al arrancar el server (fail fast)
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getEnv } = await import('./lib/env');
    getEnv();
  }
}
```

### 4.2 Base de datos — `src/lib/db/*`

```ts
// src/lib/products/constants.ts  (sin dependencias: se importa desde cliente, servidor y schema; lo crea T01)
export const CATEGORY_VALUES = ['consolas', 'cartuchos', 'accesorios', 'estuches'] as const;
export const STATUS_VALUES = ['available', 'reserved', 'sold'] as const;

export type Category = (typeof CATEGORY_VALUES)[number];
export type Status = (typeof STATUS_VALUES)[number];

export const CATEGORIES: ReadonlyArray<{
  value: Category;
  label: string;      // singular, para stamps y admin
  plural: string;     // para títulos y nav
  hint: string;       // línea "hand" del mockup
  icon: 'ds' | 'cart' | 'plug' | 'box';
}> = [
  { value: 'consolas',   label: 'Consola',   plural: 'Consolas',   hint: 'DS, DS Lite, 3DS, New 3DS', icon: 'ds' },
  { value: 'cartuchos',  label: 'Cartucho',  plural: 'Cartuchos',  hint: 'originales, en japonés',    icon: 'cart' },
  { value: 'accesorios', label: 'Accesorio', plural: 'Accesorios', hint: 'cargadores, stylus, R4',    icon: 'plug' },
  { value: 'estuches',   label: 'Estuche',   plural: 'Estuches',   hint: 'para que no se raye',       icon: 'box' },
];

export const STATUSES: ReadonlyArray<{ value: Status; label: string; stamp: 'cyan' | 'pink' | 'ink' }> = [
  { value: 'available', label: 'Disponible', stamp: 'cyan' },
  { value: 'reserved',  label: 'Reservada',  stamp: 'pink' },
  { value: 'sold',      label: 'Vendida',    stamp: 'ink' },
];

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;   // 8 MB por archivo
export const IMAGES_MAX_PER_PRODUCT = 8;
export const IMAGE_MAX_SIZE = 1600;                // px, lado mayor
export const IMAGE_THUMB_SIZE = 480;

/** Imagen procesada lista para insertar. La produce storage/upload.ts (T03) y la consume products/repo.ts (T02). Vive acá para no cruzar tareas. */
export type NewImageData = { path: string; thumbPath: string; width: number; height: number; alt: string };

export function categoryLabel(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
export function statusLabel(value: Status): string {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}
```

```ts
// src/lib/db/schema.ts
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { CATEGORY_VALUES, STATUS_VALUES } from '@/lib/products/constants';

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),                                   // cuid2
    slug: text('slug').notNull(),                                  // único (índice abajo)
    name: text('name').notNull(),
    category: text('category', { enum: CATEGORY_VALUES }).notNull(),
    price: integer('price').notNull(),                             // ARS enteros
    status: text('status', { enum: STATUS_VALUES }).notNull().default('available'),
    note: text('note').notNull().default(''),                      // "pantalla sin rayones, con cargador"
    description: text('description'),                              // opcional, largo
    year: integer('year'),                                         // opcional
    origin: text('origin').notNull().default('JP'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    limited: integer('limited', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('products_slug_uq').on(t.slug),
    index('products_status_idx').on(t.status),
    index('products_category_idx').on(t.category),
    index('products_created_at_idx').on(t.createdAt),
  ],
);

export const productImages = sqliteTable(
  'product_images',
  {
    id: text('id').primaryKey(),                                   // cuid2
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    path: text('path').notNull(),                                  // key en Storage: products/<productId>/<id>.webp
    thumbPath: text('thumb_path').notNull(),                       // products/<productId>/<id>-thumb.webp
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    alt: text('alt').notNull().default(''),
    position: integer('position').notNull().default(0),           // 0 = imagen principal
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index('product_images_product_position_idx').on(t.productId, t.position)],
);

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
```

```ts
// src/lib/db/client.ts
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { getEnv } from '@/lib/env';
import * as schema from './schema';

export type Db = LibSQLDatabase<typeof schema>;

/** Crea un cliente nuevo. Usado por getDb(), scripts y tests (url ':memory:'). */
export function createDb(url: string, authToken?: string): { db: Db; client: Client } {
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });
  return { db, client };
}

declare global {
  // eslint-disable-next-line no-var -- singleton que sobrevive al HMR de next dev
  var __retakeDb: Db | undefined;
}

/** Singleton del proceso (lazy: no toca env al importar). */
export function getDb(): Db {
  if (!globalThis.__retakeDb) {
    const env = getEnv();
    globalThis.__retakeDb = createDb(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN).db;
  }
  return globalThis.__retakeDb;
}
```

```ts
// src/lib/db/migrate.ts
import path from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { Db } from './client';

export const MIGRATIONS_FOLDER = path.join(process.cwd(), 'drizzle');

/** Aplica las migraciones de ./drizzle (idempotente). */
export async function runMigrations(db: Db, migrationsFolder: string = MIGRATIONS_FOLDER): Promise<void> {
  await migrate(db, { migrationsFolder });
}
```

```ts
// drizzle.config.ts  (solo se usa para `drizzle-kit generate`; no necesita conexión)
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'file:./data/retake.db' },
  strict: true,
  verbose: true,
});
```

Estrategia de migraciones (la más simple y robusta con libsql):
- `pnpm db:generate` → `drizzle-kit generate` escribe SQL en `drizzle/` (commiteado).
- `pnpm db:migrate` → `scripts/migrate.ts` aplica `drizzle/` con el migrator de drizzle contra `DATABASE_URL` (archivo local o Turso). Se corre a mano en dev y en cada deploy (`pnpm db:migrate` con el env de prod antes de `next build`, o desde la máquina de Juan apuntando a Turso).
- **No** se migra automáticamente al arrancar el server (evita carreras en serverless y dependencias de `drizzle/` en el bundle).
- `pnpm db:seed` → `scripts/seed.ts` idempotente (no duplica si ya hay productos; `--reset` borra todo y vuelve a sembrar).
- `pnpm db:setup` = migrate + seed.

### 4.3 Tipos y validación — `src/lib/products/types.ts`, `schemas.ts`

```ts
// src/lib/products/types.ts
import type { products, productImages } from '@/lib/db/schema';
import type { Category, Status } from './constants';

export type { Category, Status };
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductWithImages = Product & { images: ProductImage[] };   // images ordenadas por position asc

export type ListFilters = {
  category?: Category;
  status?: Status;
  q?: string;       // busca en name y note (LIKE, case-insensitive)
  limit?: number;
};

export type StatusCounts = Record<Status, number> & { total: number };

export type FieldErrors = {
  form?: string[];                   // errores generales
  fields?: Record<string, string[]>; // por nombre de campo del form
};

export type ActionResult = { ok: true; id: string } | { ok: false; errors: FieldErrors };
```

```ts
// src/lib/products/schemas.ts  (zod 4)
import { z } from 'zod';
import { CATEGORY_VALUES, IMAGE_MAX_BYTES, IMAGE_MIME_TYPES, IMAGES_MAX_PER_PRODUCT, STATUS_VALUES } from './constants';

// Helpers para FormData: '' → null, checkbox ausente → false
const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);
const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());
const optionalInt = (min: number, max: number) =>
  z.preprocess(emptyToNull, z.coerce.number().int('Sin decimales').min(min).max(max).nullable());
const optionalText = (max: number) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable());

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Solo minúsculas, números y guiones' });

export const productInputSchema = z.object({
  name: z.string().trim().min(2, { error: 'Poné un nombre (mínimo 2 letras)' }).max(120, { error: 'Máximo 120 caracteres' }),
  // vacío = se genera desde name
  slug: z.preprocess(emptyToNull, slugSchema.nullable()).transform((v) => v ?? undefined),
  category: z.enum(CATEGORY_VALUES, { error: 'Elegí una categoría' }),
  price: z.coerce.number({ error: 'Poné un precio' }).int({ error: 'Sin decimales' }).min(0).max(99_999_999),
  status: z.enum(STATUS_VALUES, { error: 'Elegí un estado' }).default('available'),
  note: z.string().trim().max(120, { error: 'Máximo 120 caracteres' }).default(''),
  description: optionalText(2000),
  year: optionalInt(1980, 2035),
  origin: z.string().trim().min(1).max(10).default('JP'),
  featured: checkbox.default(false),
  limited: checkbox.default(false),
  sortOrder: z.preprocess(emptyToNull, z.coerce.number().int().min(-9999).max(9999).nullable()).transform((v) => v ?? 0),
});

export type ProductInput = z.output<typeof productInputSchema>;

export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, { error: 'Archivo vacío' })
  .refine((f) => f.size <= IMAGE_MAX_BYTES, { error: 'Máximo 8 MB por foto' })
  .refine((f) => (IMAGE_MIME_TYPES as readonly string[]).includes(f.type), { error: 'Solo JPG, PNG o WebP' });

export const imageFilesSchema = z
  .array(imageFileSchema)
  .min(1, { error: 'Elegí al menos una foto' })
  .max(IMAGES_MAX_PER_PRODUCT, { error: `Máximo ${IMAGES_MAX_PER_PRODUCT} fotos por producto` });

export const loginSchema = z.object({
  password: z.string().min(1, { error: 'Escribí la contraseña' }),
});

/** searchParams del catálogo público y del admin. Valores inválidos se ignoran (catch). */
export const catalogFiltersSchema = z.object({
  categoria: z.enum(CATEGORY_VALUES).optional().catch(undefined),
  estado: z.enum(STATUS_VALUES).optional().catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined),
});
export type CatalogFilters = z.output<typeof catalogFiltersSchema>;

/** Convierte un ZodError a FieldErrors (shape de ActionResult). */
export function toFieldErrors(error: z.ZodError): { form?: string[]; fields?: Record<string, string[]> } {
  const flat = z.flattenError(error);
  const fields: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat.fieldErrors)) if (v && v.length) fields[k] = v;
  return { form: flat.formErrors.length ? flat.formErrors : undefined, fields: Object.keys(fields).length ? fields : undefined };
}
```

```ts
// src/lib/utils/form.ts
/** FormData → objeto plano (último valor gana). Los File se dejan como File. */
export function formDataToObject(fd: FormData): Record<string, FormDataEntryValue> {
  const out: Record<string, FormDataEntryValue> = {};
  for (const [k, v] of fd.entries()) out[k] = v;
  return out;
}
```

### 4.4 Capa de datos — `queries.ts`, `repo.ts`, `actions.ts`

Separación: **`queries.ts`** (lecturas) y **`repo.ts`** (escrituras) son funciones puras sobre `Db` (testeables con `:memory:`, sin imports de `next/*`). **`actions.ts`** son Server Actions: validan sesión, parsean FormData, llaman al repo/storage, revalidan y redirigen. Todas aceptan `db: Db = getDb()` como último parámetro.

```ts
// src/lib/products/queries.ts
import type { Db } from '@/lib/db/client';
import type { ListFilters, ProductWithImages, StatusCounts } from './types';

/**
 * Lista productos con imágenes. Orden: no vendidos primero (available/reserved), vendidos al final;
 * dentro de cada grupo sortOrder desc, createdAt desc. Filtros opcionales.
 * q: LIKE %q% sobre name y note (escapar % y _ con escapeLike).
 */
export async function listProducts(filters?: ListFilters, db?: Db): Promise<ProductWithImages[]>;

/** Por slug, con imágenes ordenadas por position asc. null si no existe. */
export async function getProductBySlug(slug: string, db?: Db): Promise<ProductWithImages | null>;

/** Por id, idem. */
export async function getProductById(id: string, db?: Db): Promise<ProductWithImages | null>;

/** Últimos `n` con status 'available', createdAt desc. (Home: "El botín de esta semana".) */
export async function latestProducts(n: number, db?: Db): Promise<ProductWithImages[]>;

/** Hasta `n` con limited = true y status != 'sold', createdAt desc. */
export async function limitedProducts(n: number, db?: Db): Promise<ProductWithImages[]>;

/** Últimos `n` de cualquier status, createdAt desc. (Dashboard admin.) */
export async function recentProducts(n: number, db?: Db): Promise<ProductWithImages[]>;

/** { available, reserved, sold, total } */
export async function countsByStatus(db?: Db): Promise<StatusCounts>;

/** true si existe un producto con ese slug (opcionalmente excluyendo un id). */
export async function slugExists(slug: string, excludeId?: string, db?: Db): Promise<boolean>;

export function escapeLike(q: string): string; // reemplaza \ % _ por \\ \% \_ ; usar con `ESCAPE '\'`
```

```ts
// src/lib/products/repo.ts
import type { Db } from '@/lib/db/client';
import type { Product, ProductImage } from './types';
import type { ProductInput } from './schemas';

export class RepoError extends Error {
  constructor(public code: 'not_found' | 'too_many_images' | 'bad_order' | 'slug_taken', message?: string);
}

import type { NewImageData } from './constants';
export type { NewImageData };

/** Genera un slug único: base, base-2, base-3... (excluyendo excludeId al comparar). */
export async function ensureUniqueSlug(base: string, excludeId?: string, db?: Db): Promise<string>;

/** id = createId(); slug = input.slug ?? slugify(input.name), luego ensureUniqueSlug. */
export async function insertProduct(input: ProductInput, db?: Db): Promise<Product>;

/** Actualiza campos + updatedAt. Slug: si viene, se respeta (RepoError 'slug_taken' si lo usa otro); si no, se mantiene el actual. null si no existe. */
export async function updateProductById(id: string, input: ProductInput, db?: Db): Promise<Product | null>;

/** Borra imágenes (filas) y producto en una transacción. Devuelve las keys de storage a borrar. */
export async function deleteProductById(id: string, db?: Db): Promise<{ deleted: boolean; storageKeys: string[] }>;

/** Inserta al final (position = max+1...). RepoError 'too_many_images' si supera IMAGES_MAX_PER_PRODUCT; 'not_found' si no existe el producto. */
export async function insertImages(productId: string, images: NewImageData[], db?: Db): Promise<ProductImage[]>;

/** Borra una imagen y compacta positions (0..n-1). Devuelve la fila borrada (para borrar archivos) o null. */
export async function deleteImage(productId: string, imageId: string, db?: Db): Promise<ProductImage | null>;

/** orderedIds debe ser exactamente el conjunto de ids del producto; si no, RepoError 'bad_order'. Asigna position = índice. */
export async function reorderImages(productId: string, orderedIds: string[], db?: Db): Promise<void>;
```

Notas de implementación del repo:
- `PRAGMA foreign_keys` no está garantizado en todas las conexiones libsql: **no confiar en el cascade**; `deleteProductById` borra `product_images` explícitamente antes que `products` dentro de `db.transaction(async (tx) => ...)`.
- `updatedAt` se setea a `new Date()` en cada update.
- `insertProduct`/`updateProductById` no tocan `images`.

```ts
// src/lib/products/actions.ts   ('use server')
import type { ActionResult } from './types';

/** Crea. Éxito → redirect(`/admin/productos/${id}`) (nunca retorna ok en la práctica). */
export async function createProduct(_prev: ActionResult | null, formData: FormData): Promise<ActionResult>;

/** Edita. Usar con .bind(null, id). Éxito → { ok: true, id }. */
export async function updateProduct(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult>;

/** Borra producto + archivos. Éxito → redirect('/admin/productos'). */
export async function deleteProduct(id: string): Promise<ActionResult>;

/** formData.getAll('images') → valida (imageFilesSchema, tope total 8) → sharp → storage → repo. Usar con .bind(null, productId). */
export async function addProductImages(productId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult>;

/** Borra fila + archivos (path y thumbPath; ignorar error de archivo inexistente). */
export async function removeProductImage(productId: string, imageId: string): Promise<ActionResult>;

export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<ActionResult>;
```

Reglas comunes de las actions:
1. Primera línea: `await requireSession()` (redirige a `/admin/login` si no hay sesión). Defensa en profundidad además del proxy.
2. Parseo: `productInputSchema.safeParse(formDataToObject(formData))`; error → `{ ok: false, errors: toFieldErrors(result.error) }`.
3. `RepoError` → `{ ok: false, errors: { form: [mensaje en español] } }` (`slug_taken` → `fields: { slug: ['Ese slug ya existe'] }`).
4. Revalidar tras mutar: `revalidatePath('/')`, `revalidatePath('/botin')`, `revalidatePath(`/botin/${slug}`)` (slug viejo y nuevo si cambió), `revalidatePath('/admin')`, `revalidatePath('/admin/productos')`, `revalidatePath(`/admin/productos/${id}`)`.
5. `redirect()` **fuera** de cualquier `try/catch` (lanza internamente).
6. Nunca loguear la contraseña ni el token.

### 4.5 Auth — `src/lib/auth/*` y `src/proxy.ts`

```ts
// src/lib/auth/session.ts   (puro: sin imports de next/*, se usa en proxy, server y tests)
export const SESSION_COOKIE = 'retake_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

export type Session = { sub: 'admin'; iat: number; exp: number };

/** JWT HS256 con jose: sub 'admin', iat = now, exp = now + TTL. `now` en ms (inyectable para tests). */
export async function signSession(secret: string, now?: number): Promise<string>;

/** Verifica firma, alg HS256 y expiración. null si inválido/expirado. */
export async function verifySessionToken(token: string, secret: string): Promise<Session | null>;

export function sessionCookieOptions(): {
  httpOnly: true; sameSite: 'lax'; secure: boolean; path: '/'; maxAge: number;
}; // secure = process.env.NODE_ENV === 'production'
```

```ts
// src/lib/auth/password.ts
/** Compara en tiempo constante: sha256(input) vs sha256(expected) con crypto.timingSafeEqual. */
export function verifyPassword(input: string, expected: string): boolean;
```

```ts
// src/lib/auth/server.ts   (solo servidor: usa cookies() de next/headers)
import type { Session } from './session';
export async function getSession(): Promise<Session | null>;
/** redirect('/admin/login') si no hay sesión válida. */
export async function requireSession(): Promise<Session>;
```

```ts
// src/lib/auth/actions.ts   ('use server')
export type LoginState = { error?: string };
/** Valida loginSchema, verifyPassword contra ADMIN_PASSWORD; error → { error: 'Contraseña incorrecta' } (con 400 ms de espera); ok → set cookie + redirect('/admin'). */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState>;
/** Borra la cookie y redirect('/admin/login'). */
export async function logout(): Promise<void>;
```

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.SESSION_SECRET ?? '';
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token && secret ? await verifySessionToken(token, secret) : null;
  const isLogin = pathname === '/admin/login';

  if (isLogin && session) return NextResponse.redirect(new URL('/admin', request.url));
  if (!isLogin && !session) return NextResponse.redirect(new URL('/admin/login', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
```

### 4.6 Storage — `src/lib/storage/*` y `src/app/uploads/[...path]/route.ts`

```ts
// src/lib/storage/types.ts
export type StoredObject = { body: Buffer; contentType: string };

export interface Storage {
  /** Guarda (sobrescribe) la key. Crea directorios si hace falta. */
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  /** null si no existe. */
  get(key: string): Promise<StoredObject | null>;
  /** No falla si no existe. */
  delete(key: string): Promise<void>;
  /** URL pública relativa: `/uploads/${key}`. */
  publicUrl(key: string): string;
}

/** Keys válidas: segmentos [a-z0-9_-], extensión webp|jpg|jpeg|png, sin '..' ni barra inicial. */
export const STORAGE_KEY_RE = /^[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.(?:webp|jpg|jpeg|png)$/;
export function isValidStorageKey(key: string): boolean;
export function contentTypeFor(key: string): string; // por extensión
```

```ts
// src/lib/storage/local.ts
import type { Storage } from './types';
export class LocalStorage implements Storage {
  /** root absoluto; default path.resolve(process.cwd(), getEnv().UPLOADS_DIR) lo resuelve index.ts, no acá. */
  constructor(root: string);
  // Resuelve path.resolve(root, key) y verifica que quede dentro de root (anti path traversal) antes de tocar el disco.
}
```

```ts
// src/lib/storage/index.ts
import type { Storage } from './types';
/** Singleton: LocalStorage(path.resolve(process.cwd(), getEnv().UPLOADS_DIR)). Punto único para cambiar a Cloudinary/Blob. */
export function getStorage(): Storage;
export type { Storage } from './types';
```

```ts
// src/lib/storage/images.ts  (sharp)
export type ProcessedVariant = { data: Buffer; width: number; height: number };
export type ProcessedImage = { main: ProcessedVariant; thumb: ProcessedVariant };
/**
 * sharp(input, { failOn: 'none' }).rotate() (respeta EXIF)
 * main:  resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 })
 * thumb: resize({ width: 480,  height: 480,  fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 })
 */
export async function processImage(input: Buffer): Promise<ProcessedImage>;
```

```ts
// src/lib/storage/upload.ts
import type { NewImageData } from '@/lib/products/constants';
/** Lee el File, processImage, guarda main y thumb en storage. Keys: products/<productId>/<imageId>.webp y -thumb.webp. */
export async function saveProductImage(productId: string, file: File, alt: string): Promise<NewImageData>;
```

```ts
// src/app/uploads/[...path]/route.ts
// GET /uploads/products/<pid>/<iid>.webp
// - key = params.path.join('/'); si !isValidStorageKey(key) → 400
// - obj = await getStorage().get(key); null → 404
// - 200 con headers: Content-Type: obj.contentType, Content-Length, Cache-Control: public, max-age=31536000, immutable
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response>;
```

### 4.7 Utils — `src/lib/utils/*`

```ts
// slugify.ts
/** NFD + quitar diacríticos, lowercase, [^a-z0-9]+ → '-', trim de '-', máx 80 chars. '' si no queda nada. */
export function slugify(input: string): string;
// "Pokémon SoulSilver (JP)" → "pokemon-soulsilver-jp" ; "DS Lite Crimson / Black" → "ds-lite-crimson-black" ; "  ¡Ñandú!  " → "nandu"

// format.ts
/** 350000 → "$350.000"; 0 → "$0"; 1234567 → "$1.234.567". Sin Intl (determinista). Redondea a entero; negativos → abs. */
export function formatPrice(ars: number): string;

// date.ts
/** Date → "09.10.26" (dd.mm.yy). */
export function formatStampDate(d: Date): string;
/** Date → "9 de octubre de 2026" (para admin, Intl es-AR está bien acá). */
export function formatLongDate(d: Date): string;

// whatsapp.ts
/** 'https://wa.me/<solo dígitos>' + (message ? '?text=' + encodeURIComponent(message) : '') */
export function whatsappUrl(number: string, message?: string): string;
/** `Hola Retake! Me interesa "${name}" (${formatPrice(price)}). ${siteUrl}/botin/${slug}` */
export function productWhatsappMessage(p: { name: string; slug: string; price: number }, siteUrl: string): string;
export const GENERIC_WHATSAPP_MESSAGE = 'Hola Retake';

// cn.ts
export function cn(...parts: Array<string | false | null | undefined>): string; // filtra falsy y une con ' '

// css.ts
import type { CSSProperties } from 'react';
/** Permite custom properties en style sin castear en cada uso: cssVars({ '--r': '-2deg' }) */
export function cssVars(vars: Record<`--${string}`, string | number>, base?: CSSProperties): CSSProperties;
/** Atajo: rot(-2) → cssVars({ '--r': '-2deg' }) */
export function rot(deg: number, base?: CSSProperties): CSSProperties;

// random.ts
export function hashString(s: string): number;                     // FNV-1a 32 bits
export function seededRandom(seed: string | number): () => number; // mulberry32, [0,1)
export function pick<T>(seed: string | number, list: readonly T[]): T;

// shapes.ts
/** Igual al JS del mockup: 14 puntas, radio interno .8. Determinista → seguro en SSR. */
export function burstClipPath(points?: number, inner?: number): string;
/** Bordes rasgados del mockup pero con PRNG sembrado → SSR y cliente generan el mismo polígono. */
export function tornClipPath(seed: string | number, step?: number, amp?: number): string;
```

### 4.8 Tokens y CSS — `src/app/globals.css`, `src/app/fonts.ts`

```ts
// src/app/fonts.ts
import { Anton, Archivo, Bungee, Permanent_Marker, Silkscreen } from 'next/font/google';

export const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-anton' });
export const bungee = Bungee({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-bungee' });
export const silkscreen = Silkscreen({ weight: ['400', '700'], subsets: ['latin'], display: 'swap', variable: '--font-silkscreen' });
export const permanentMarker = Permanent_Marker({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-permanent-marker' });
export const archivo = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-archivo' }); // variable font (si el tipo exige weight: 'variable')

export const fontClassName = [anton, bungee, silkscreen, permanentMarker, archivo].map((f) => f.variable).join(' ');
```

```css
/* src/app/globals.css — cabecera (T01). El resto (componentes) lo agrega T04. */
@import 'tailwindcss';

@theme {
  --color-ink: #0a0a0a;
  --color-paper: #f2efe6;
  --color-pink: #ff2d8a;
  --color-cyan: #2de2ff;
  --color-acid: #d9ff2d;
  --color-yellow: #facc15;
}

@theme inline {
  --font-shout: var(--font-anton), Impact, 'Arial Narrow', sans-serif;
  --font-sticker: var(--font-bungee), Impact, sans-serif;
  --font-pixel: var(--font-silkscreen), monospace;
  --font-hand: var(--font-permanent-marker), cursive;
  --font-body: var(--font-archivo), system-ui, sans-serif;
}

:root {
  /* aliases cortos para pegar el CSS del mockup casi textual */
  --ink: var(--color-ink);
  --paper: var(--color-paper);
  --pink: var(--color-pink);
  --cyan: var(--color-cyan);
  --acid: var(--color-acid);
  --yellow: var(--color-yellow);
  --noise: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 9 -4'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  --noise-soft: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 5 -1.4'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}

@layer base {
  html { background: var(--ink); color: var(--paper); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }
  body { margin: 0; overflow-x: hidden; position: relative; line-height: 1.5; }
  img, svg { display: block; }
  a { color: inherit; }
  /* grano de fotocopia sobre toda la página; el admin lo apaga */
  body::after { content: ''; position: fixed; inset: 0; z-index: 60; pointer-events: none; background-image: var(--noise); opacity: .11; mix-blend-mode: screen; }
  body:has(.admin-root)::after { display: none; }
  :focus-visible { outline: 3px solid var(--acid); outline-offset: 2px; }
}
```

Qué queda como **CSS plano** (en `globals.css`, `@layer components`, portado del `<style>` del mockup con los nombres de clase originales): `.wrap .pixel .hand .rot .dots .sr`, `.btn .btn-pink .btn-ink .btn-sm`, `.top .logo .nav`, `.marquee .track (+ .cyan .acid .diag) @keyframes scroll`, `.hero .hero-grid .kicker .glitch-wrap .h1 .cut (+ .pink .cyan .acid .sm) .slice (+ a/b) @keyframes sliceA sliceB shake .hero-glitch .lead .hero-copy .cta`, `.hero-art .polaroid .photo (+ .paper .cyan .acid, ::after halftone) .caption .tape .sticker (+ .pink .cyan) .burst (+ colores) .stamp (+ .cyan .ink, mask)`, `.sec .sec-head .sec-label .h2 .hi (+ .cyan .acid) .sub`, `.paper-sec (::before ruido invertido) .props .prop`, `.tags .tag`, `.cards .card (+ .sold::after "VENDIDA") .meta .note .row .price`, `.hazard`, `.notes .note-card .who .stars .rating`, `footer .foot .legal`, `.wa`, `.boot .cur @keyframes blink`, media queries responsive y el bloque `prefers-reduced-motion`. Agregar: `.photo img { width: 100%; height: 100%; object-fit: cover; }`.

Qué va con **utilidades Tailwind**: layout nuevo que no está en el mockup (admin completo: grillas, tablas, forms, spacing), ajustes responsive puntuales, y colores/fonts vía `bg-paper text-ink font-pixel`, etc. No duplicar: si existe la clase del mockup, usarla.

Rotaciones: siempre `style={rot(-2)}` + clase que lea `var(--r)` (`.rot`, `.cut`, `.card`, ...). No usar utilidades `rotate-*` arbitrarias para estas piezas.

### 4.9 Pixel art — `src/lib/pixel/*`

```ts
// src/lib/pixel/grids.ts — copiar los 9 grids del mockup (skull, truck, star, headset, chat, ds, cart, plug, box) tal cual.
export type IconName = 'skull' | 'truck' | 'star' | 'headset' | 'chat' | 'ds' | 'cart' | 'plug' | 'box';
export const GRIDS: Record<IconName, readonly string[]>;
/** Comprime cada fila en runs: [{ x, y, w }] para menos <rect>. */
export function gridToRects(grid: readonly string[]): Array<{ x: number; y: number; w: number }>;

// src/lib/pixel/palettes.ts — colores de los sprites del mockup
export type ConsolePalette = { shell: string; screen: string; screen2: string };
export type CartPalette = { shell: string; label: string };
export const CONSOLE_PALETTES: readonly ConsolePalette[] = [
  { shell: '#e8368f', screen: '#2de2ff', screen2: '#0a0a0a' },
  { shell: '#0a0a0a', screen: '#d9ff2d', screen2: '#ff2d8a' },
  { shell: '#c0202a', screen: '#f2efe6', screen2: '#2de2ff' },
  { shell: '#0a0a0a', screen: '#2de2ff', screen2: '#f2efe6' },
];
export const CART_PALETTES: readonly CartPalette[] = [
  { shell: '#4a4a4a', label: '#f2efe6' },
  { shell: '#777777', label: '#d9ff2d' },
];
/** Fondo de .photo por categoría: consolas→'paper', cartuchos→'cyan', accesorios→'acid', estuches→'pink' */
export function photoVariantFor(category: Category): 'paper' | 'cyan' | 'acid' | 'pink';
```

Favicon `src/app/icon.svg` (calavera pixel magenta, estático; Next lo sirve como `<link rel="icon">`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" shape-rendering="crispEdges" fill="#ff2d8a"><rect x="2" y="0" width="6" height="1"/><rect x="1" y="1" width="8" height="1"/><rect x="0" y="2" width="10" height="1"/><rect x="0" y="3" width="2" height="2"/><rect x="4" y="3" width="2" height="2"/><rect x="8" y="3" width="2" height="2"/><rect x="0" y="5" width="10" height="1"/><rect x="0" y="6" width="4" height="1"/><rect x="6" y="6" width="4" height="1"/><rect x="1" y="7" width="8" height="1"/><rect x="2" y="8" width="1" height="2"/><rect x="4" y="8" width="2" height="2"/><rect x="7" y="8" width="1" height="2"/></svg>
```

### 4.10 Inventario de componentes

Props en TypeScript. Todos aceptan `className?: string` extra salvo que se indique. "RSC" = Server Component (sin `'use client'`).

#### `src/components/ui/` — primitivas del mockup

| Componente | Tipo | Props | Render / notas |
|---|---|---|---|
| `Wrap` | RSC | `children` | `<div class="wrap">` (max 1180px) |
| `PixelIcon` | RSC | `name: IconName; color?: string` (default `currentColor`); `title?: string` | `<svg viewBox="0 0 w h" shape-rendering="crispEdges" fill=color aria-hidden>` con rects de `gridToRects`. Si `title` → `role="img"` + `<title>` |
| `Skull` | RSC | `className?` | atajo `<PixelIcon name="skull">` envuelto en `<span class="skull">` |
| `Stars` | RSC | `value: number` (0..5); `label?: string` | 5 `<span class="px">` con `PixelIcon star`, los > value llevan `.off`; `role="img" aria-label="4 de 5 estrellas"` |
| `Sprite` | RSC | `kind: 'ds' \| 'cart'; palette: ConsolePalette \| CartPalette` | los dos `<symbol>` del mockup como SVG inline (viewBox `0 0 40 36` / `0 0 24 28`), colores vía props (no `<use>`) |
| `ProductArt` | RSC | `category: Category; seed: string` | fallback sin fotos: consolas→`Sprite ds` con `pick(seed, CONSOLE_PALETTES)`; cartuchos→`Sprite cart`; accesorios→`PixelIcon plug`; estuches→`PixelIcon box` (grandes, 62% del ancho) |
| `Button` | RSC | `href?: string; variant?: 'default' \| 'pink' \| 'ink'; size?: 'md' \| 'sm'; type?: 'button' \| 'submit'; disabled?; external?: boolean; children` | `href` → `next/link` (o `<a target=_blank rel=noopener>` si `external`); sin href → `<button>`. Clases `btn btn-pink btn-sm` |
| `SubmitButton` | client | `pendingLabel?: string; children` + props de `Button` | usa `useFormStatus()`; en pending: `aria-busy`, `disabled`, texto `pendingLabel ?? 'Un segundo...'` |
| `Stamp` | RSC | `color?: 'pink' \| 'cyan' \| 'ink'; r?: number; children` | `<span class="stamp cyan" style={rot(r)}>` |
| `StatusStamp` | RSC | `status: Status; r?` | `Stamp` con `STATUSES[status].stamp` y `statusLabel` |
| `Cut` | RSC | `color?: 'paper' \| 'pink' \| 'cyan' \| 'acid'; size?: 'lg' \| 'sm'; r?: number; children` | `<span class="cut pink sm" style={rot(r)}>` |
| `Hi` | RSC | `color?: 'pink' \| 'cyan' \| 'acid'; children` | `<span class="hi cyan">` (resaltador dentro de `.h2`) |
| `SectionHead` | RSC | `label: string; title: ReactNode; sub?: string; hand?: string; id?: string` | `.sec-head` con `.sec-label.pixel`, `<h2 class="h2">`, `.sub`, `.hand.rot` |
| `Tape` | RSC | `r?: number; style?: CSSProperties` | `<span class="tape" aria-hidden>` |
| `Sticker` | RSC | `color?: 'yellow' \| 'pink' \| 'cyan'; r?; children` | `.sticker` |
| `Burst` | RSC | `color?: 'cyan' \| 'pink' \| 'acid' \| 'yellow'; r?; size?: number (px); points?; inner?; children` | `.burst` con `style.clipPath = burstClipPath(points, inner)` calculado en render (puro) |
| `Polaroid` | RSC | `r?: number; caption?: string; tapes?: 'none' \| 'corners' \| 'top'; children` | `.polaroid` (padding grande + `.caption.hand`); `corners` = t1/t2 del hero |
| `Photo` | RSC | `variant?: 'pink' \| 'paper' \| 'cyan' \| 'acid'; ratio?: '4/3' \| '1/1'; image?: { src: string; alt: string; width: number; height: number }; children?` | `.photo`; si `image` → `<img loading="lazy" decoding="async">`; si no, `children` (sprite). Halftone/scanlines vienen del `::after` |
| `Marquee` | RSC | `items: string[]; color?: 'pink' \| 'cyan' \| 'acid'; separator?: 'skull' \| 'star'; diagonal?: boolean` | `.marquee` `aria-hidden`; duplica `items` x2 en `.track` (requisito del keyframe -50%) |
| `Hazard` | RSC | `children` | `.hazard` `aria-hidden` |
| `TornSection` | RSC | `seed: string \| number; children; id?` | `<section class="paper-sec torn" style={{ clipPath: tornClipPath(seed) }}>` (determinista, sin efectos) |
| `Glitch` | RSC | `children` (los `Cut` del título); `as?: 'h1' \| 'h2'` | `<div class="glitch-wrap hero-glitch"><h1 class="h1">{children}</h1><span class="h1 slice a" aria-hidden>{children}</span><span class="h1 slice b" aria-hidden>{children}</span></div>` |
| `BootScreen` | client | `lines?: string[]` (default: las 6 del mockup); `once?: boolean` (default true) | ver algoritmo abajo |
| `WhatsAppLink` | RSC | `message?: string; children; ...anchor props` | `<a href={whatsappUrl(publicEnv.whatsappNumber, message)} target="_blank" rel="noopener noreferrer">` |

**BootScreen (algoritmo):** estado `{ phase: 'typing' \| 'out' \| 'gone'; shown: number }`, inicial `typing/0` (SSR y cliente idénticos: overlay negro con cursor). En `useEffect`: si `matchMedia('(prefers-reduced-motion: reduce)').matches` o (`once` y `sessionStorage.getItem('retake-boot') === '1'`) → `setTimeout(() => setPhase('gone'), 0)`; si no, `sessionStorage.setItem('retake-boot','1')` y un `setInterval` de 150 ms que incrementa `shown`; al llegar a `lines.length` → 450 ms → `'out'` → 500 ms → `'gone'`. Click en el overlay → `'out'`. Limpiar timers en cleanup. **Todos los `setState` ocurren dentro de timers o handlers** (la regla `react-hooks/set-state-in-effect` de eslint-config-next 16 rechaza `setState` síncrono en un effect). Render: `phase === 'gone' ? null : <div class="boot [out]" aria-hidden onClick><pre>{lines.slice(0, shown).join('\n')}\n<span class="cur"/></pre></div>`. El CSS de reduced-motion además pone `.boot{display:none}`.

#### `src/components/site/` — secciones públicas

| Componente | Tipo | Props | Contenido |
|---|---|---|---|
| `TopBar` | RSC | — | `.top` sticky: `Logo` (Skull + RETAKE), `NavLinks`, `Button pink sm` "WhatsApp" (`WhatsAppLink` con `GENERIC_WHATSAPP_MESSAGE`) |
| `NavLinks` | client | — | `usePathname()`; links Inicio `/`, Botín `/botin`, Consolas `/botin?categoria=consolas`, Cartuchos `/botin?categoria=cartuchos`, Reseñas `/#dicen`; `.on` + `aria-current="page"` en el activo; oculta en < 900px (CSS del mockup) |
| `SiteFooter` | RSC | — | columnas: marca (Skull 84px, "RETAKE", "Buenos Aires, AR // importado de Japón", hand "hecho con cinta, fotocopias y nostalgia"); Navegar (Inicio, Botín, 4 categorías → `/botin?categoria=`); Hablemos (WhatsApp, `Instagram @{publicEnv.instagram}` → `https://instagram.com/{handle}`, "Volver arriba ↑" → `#top`); legal: "© {año} Retake. Todos los cartuchos reservados." / "No afiliados a Nintendo. Ni a nadie." |
| `WhatsAppFloat` | RSC | — | `.wa` con `PixelIcon chat`, `aria-label="Escribinos por WhatsApp"` |
| `Hero` | RSC | `latest: ProductWithImages \| null` | copy del mockup + `HeroArt` + `Marquee diagonal cyan` |
| `HeroArt` | RSC | `latest: ProductWithImages \| null` | doodle "¡mirá esto!", `Polaroid r=3 tapes=corners` con `Photo` (foto principal del `latest` si tiene, si no `Sprite ds` paleta 3 del mockup) y caption = `latest?.name ?? 'New 3DS XL // Akihabara'`; `Sticker` "Importado / de Japón"; `Burst b1` "¡Recién / llegada!"; `Stamp` "Ingresó {formatStampDate(latest?.createdAt ?? new Date())}" |
| `WhySection` | RSC | — | `TornSection seed="why"` con `Stamp ink corner` "Página 02 // sin fecha" y 3 `.prop` (truck / star / headset) con el copy del mockup |
| `Categories` | RSC | — | `SectionHead` "// 01 — Categorías" / "Buscá por *tipo*" / "Cuatro cajones. Todos importados, todos revisados."; 4 `.tag` (`next/link` a `/botin?categoria=`), rotaciones `[-1.5, 1, -0.5, 1.5]`, `.n` "01".."04", `PixelIcon` de la categoría, `h3` plural, `.hand` hint |
| `ProductCard` | RSC | `product: ProductWithImages; index: number` | `.card` (`.sold` si vendido) `style=rot([-1.5,1,-0.8,1.4][index%4])`; `Tape`; `Burst` precio color `['pink','cyan','acid','yellow'][index%4]`; `Photo ratio=1/1 variant=photoVariantFor(category)` con thumb de `images[0]` o `ProductArt`; `.meta`: `Stamp` categoría (`cyan` si cartuchos, `pink` resto) + `StatusStamp` si reserved; `<h3>` name (link a `/botin/[slug]`); `.hand.note`; `.row`: `Button ink sm` "Lo quiero" → `/botin/[slug]` y `.pixel` "`{origin} // {year ?? 's/d'}`" |
| `ProductGrid` | RSC | `products: ProductWithImages[]; emptyText?: string` | `.cards` o estado vacío (`.hand` + link a WhatsApp) |
| `LatestLoot` | RSC | `products` | `SectionHead id="botin"` "// 02 — Últimos ingresos" / "El *botín* de esta semana" (hi cyan) / "Lo más nuevo que sumamos. Una unidad de cada una, sin excepción." + `ProductGrid` + `Button` "Ver todo el botín" → `/botin` |
| `LimitedEditions` | RSC | `products` | `Marquee acid` ["Ediciones limitadas","Una unidad de cada una","Cuando se va, se va"] siempre; si `products.length` → `SectionHead` "// 02b — Ediciones limitadas" / "Una *sola* de cada una" (hi pink) + `ProductGrid` |
| `Reviews` | RSC | `reviews: Review[]` | `SectionHead id="dicen"` "// 03 — Reseñas" / "Lo que *dicen*" (hi acid) + hand "(gente real, lo juramos)"; `.notes` con `.note-card` (rot `[-1.2,1.5,-0.6]`), `blockquote`, `.who` (`{author} // {dd.mm.yy}` + `Stars`); `.rating`: promedio con 1 decimal, `Stars` del redondeo, "Basado en {n} reseñas. Las publicamos después de leerlas.", `Button sm` "Dejá la tuya" → WhatsApp "Hola! Quiero dejar una reseña de Retake" |
| `CatalogFilters` | RSC | `current: CatalogFilters; total: number` | `<form method="get" action="/botin">`: chips (links) "Todas" + 4 categorías (`.btn.btn-sm`, activa `.btn-pink`), `<label>` + `<input type="search" name="q">`, hidden `categoria` si activa, `Button ink sm` "Buscar"; texto `.pixel` "{total} piezas" |
| `ProductGallery` | client | `images: ProductImage[]; name: string; category: Category; seed: string` | `useState(index)`; `Polaroid` grande con `Photo ratio=4/3` (imagen `path` 1600) o `ProductArt`; tira de thumbs `<button aria-pressed>`; con 0 imágenes no renderiza thumbs |
| `ProductSpecs` | RSC | `product: Product` | `<dl class="pixel">`: Categoría, Estado, Origen, Año (si hay), Ingresó (`formatStampDate(createdAt)`) |
| `ProductCta` | RSC | `product: Product` | si `status !== 'sold'`: `Button pink` "Lo quiero por WhatsApp" (`productWhatsappMessage`) + `Button` "Volver al botín"; si `sold`: `Stamp ink` "VENDIDA" grande + hand "Ya se fue. Escribinos y te avisamos si entra otra." + `Button` WhatsApp con mensaje `Hola Retake! Se vendió "${name}", ¿me avisás si entra otra?` |

#### `src/components/admin/` — backoffice (papel/tinta, sin collage)

| Componente | Tipo | Props | Notas |
|---|---|---|---|
| `AdminShell` | RSC | `children` | `<div class="admin-root min-h-screen bg-paper text-ink">`; header `bg-ink text-paper` con `Skull` + `.pixel` "RETAKE // BACKOFFICE", nav `.pixel` (Panel `/admin`, Productos `/admin/productos`, Nuevo `/admin/productos/nuevo`, Ver sitio `/` target=_blank), `<form action={logout}>` + `Button sm` "Salir"; `<main class="wrap py-10">` |
| `AdminHeading` | RSC | `title: string; hint?: string; actions?: ReactNode` | `<h1 class="font-shout text-4xl uppercase">` + `.pixel` hint + slot de acciones |
| `StatCard` | RSC | `label: string; value: number; tone?: 'cyan' \| 'pink' \| 'acid' \| 'paper'` | caja `border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)]`, número `font-shout text-5xl`, label `.pixel` |
| `ProductsTable` | RSC | `products: ProductWithImages[]` | `<table>` ink borders: thumb 48px (`thumbPath` o `ProductArt`), nombre + slug (`.pixel`), categoría, precio (`formatPrice`), `StatusStamp`, actualizado (`formatLongDate`), link "Editar" → `/admin/productos/[id]`. Vacío: "Todavía no hay productos. Creá el primero." |
| `ProductFilters` | RSC | `current: CatalogFilters` | `<form method="get">`: `q`, `categoria` (select), `estado` (select), `Button ink sm` "Filtrar", link "Limpiar" |
| `Field` | RSC | `label: string; name: string; error?: string[]; hint?: string; children` | `<label for>` + hint `.pixel` + children + `<p id="{name}-error" role="alert">`; children deben recibir `aria-describedby`/`aria-invalid` (pasar vía `fieldProps(name, error)` helper exportado) |
| `Input` / `Select` / `Textarea` / `Checkbox` | RSC | props nativas + `invalid?: boolean` | `border-[3px] border-ink bg-white px-3 py-2 font-body w-full focus:outline-none focus-visible:shadow-[4px_4px_0_var(--color-pink)]`; `invalid` → `border-pink` |
| `FormErrors` | RSC | `errors?: string[]` | lista `role="alert"` en caja `border-pink` |
| `ProductForm` | client | `action: (prev: ActionResult \| null, fd: FormData) => Promise<ActionResult>; product?: ProductWithImages; submitLabel: string` | `useActionState(action, null)`; campos: name, slug (auto: mientras el usuario no edite slug, se rellena con `slugify(name)`; en edición arranca con el slug actual y no se autoactualiza), category, price, status, note, description, year, origin, featured, limited, sortOrder; errores por campo desde `state.errors.fields`; `SubmitButton`; link "Cancelar" → `/admin/productos` |
| `ImageManager` | client | `productId: string; images: ProductImage[]` | form de subida (`useActionState(addProductImages.bind(null, productId), null)`, `<input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp">`, hint "Hasta 8 fotos, 8 MB c/u. La primera es la principal."); grilla de thumbs con botones "↑" "↓" (`reorderProductImages`), "Borrar" (`confirm()` + `removeProductImage`) vía `useTransition`; muestra error de la última acción |
| `DeleteProductButton` | client | `id: string; name: string` | `confirm(`¿Borrar "${name}"? No hay vuelta atrás.`)` → `startTransition(() => deleteProduct(id))`; muestra `errors.form` si falla |
| `LoginForm` | client | — | `useActionState(login, {})`; `<label>` Contraseña + `<input type="password" name="password" autoComplete="current-password" autoFocus>`; error `role="alert"`; `SubmitButton pink` "Entrar" |

### 4.11 Contenido estático — `src/content/`

```json
// src/content/reviews.json
[
  { "id": "r1", "author": "Agustín", "date": "2026-09-30", "stars": 4, "text": "Buena atención y respondieron rápido todas mis dudas. El envío tardó un par de días más de lo que esperaba, pero llegó todo bien embalado." },
  { "id": "r2", "author": "Nadin",   "date": "2026-09-30", "stars": 5, "text": "Llegó impecable, mejor de lo que se veía en las fotos. Me respondieron todas las dudas por WhatsApp antes y después de la compra." },
  { "id": "r3", "author": "Flor",    "date": "2026-10-04", "stars": 5, "text": "Pedí una DS Lite y me mandaron una foto del cartucho funcionando antes de despacharla. Eso no lo hace nadie." }
]
```

```ts
// src/content/reviews.ts
import { z } from 'zod';
export const reviewSchema = z.object({ id: z.string(), author: z.string(), date: z.iso.date(), stars: z.number().int().min(1).max(5), text: z.string().min(1) });
export type Review = z.infer<typeof reviewSchema>;
export function getReviews(): Review[];                 // parsea el JSON (lanza si está mal)
export function reviewsSummary(reviews: Review[]): { count: number; average: number; averageLabel: string }; // 4.67 → "4.7"
```

### 4.12 Rutas, datos que cargan y copy exacto

| Ruta | Archivo | Datos | Render |
|---|---|---|---|
| `/` | `src/app/(site)/page.tsx` | `latestProducts(4)`, `limitedProducts(4)`, `getReviews()` | `BootScreen`, `Marquee pink` (5 items abajo), `Hero latest=latest[0]`, `WhySection`, `Categories` (`id="cat"`), `Hazard` "⚠ Stock limitado // cuando se va, se va ⚠", `LatestLoot`, `LimitedEditions`, `Reviews` |
| `/botin` | `src/app/(site)/botin/page.tsx` | `catalogFiltersSchema.parse(await searchParams)` → `listProducts({ category, q })` | `SectionHead` "// Botín" / "Todo el *botín*" / "Lo que hay hoy. Lo vendido queda al fondo, de recuerdo."; `CatalogFilters`; `ProductGrid` (vendidos al final con VENDIDA) |
| `/botin/[slug]` | `src/app/(site)/botin/[slug]/page.tsx` | `getProductBySlug(slug)` → `notFound()` si null | grid 2 col: `ProductGallery` / info (`Stamp` categoría + `StatusStamp`, `<h1 class="h2">`, `Burst` precio grande, `.hand` note, descripción (`whitespace-pre-line`), `ProductSpecs`, `ProductCta`). `generateMetadata`: title = name, description = note, openGraph.images = main image si hay |
| 404 | `src/app/not-found.tsx` | — | `TopBar`, `Cut` "404", `Cut pink` "la consola se colgó", `.pixel` "Apagá, soplá el cartucho y volvé a intentar.", `Button pink` "Volver al inicio" + `Button` "Ver el botín", `SiteFooter` |
| `/admin/login` | `src/app/admin/(auth)/login/page.tsx` | — | centrado, tarjeta papel: `Skull`, `.pixel` "RETAKE // BACKOFFICE", `LoginForm` |
| `/admin` | `src/app/admin/(panel)/page.tsx` | `countsByStatus()`, `recentProducts(5)` | `AdminHeading` "Panel" + acción `Button pink sm` "Nuevo producto"; 4 `StatCard`; `ProductsTable` |
| `/admin/productos` | `.../productos/page.tsx` | filtros → `listProducts({ category, status, q })` | `AdminHeading` "Productos" / "{n} en total"; `ProductFilters`; `ProductsTable` |
| `/admin/productos/nuevo` | `.../nuevo/page.tsx` | — | `AdminHeading` "Nuevo producto" / "Las fotos se cargan después de guardar."; `ProductForm action=createProduct submitLabel="Crear"` |
| `/admin/productos/[id]` | `.../[id]/page.tsx` | `getProductById(id)` → `notFound()` | `AdminHeading` name / `.pixel` slug + link "Ver en el sitio"; `ProductForm action=updateProduct.bind(null,id) submitLabel="Guardar"`; `ImageManager`; zona peligro con `DeleteProductButton` |
| `/uploads/[...path]` | `src/app/uploads/[...path]/route.ts` | storage | ver 4.6 |
| `robots.txt` / `sitemap.xml` | `src/app/robots.ts`, `src/app/sitemap.ts` | `listProducts()` | disallow `/admin`; sitemap con `/`, `/botin` y cada `/botin/[slug]` |

Todas las páginas que leen DB llevan `export const dynamic = 'force-dynamic'` (siempre SSR; sin dependencia de DB en `next build`; la revalidación de las actions sigue siendo útil para el router cache).

**Copy exacto del mockup (reproducir tal cual, voseo):**
- `<title>`: `RETAKE // Retomá lo que era tuyo`. Description: `Nintendo DS, 3DS, cartuchos y rarezas importadas de Japón. Elegidas una por una. Envíos a todo el país.`
- Marquee pink (home): `Envíos a todo el país` · `Importado de Japón` · `No es stock, es botín` · `Soporte real, no solo venta` · `Probadas una por una` (separador skull).
- Hero kicker: `Nintendo DS // 3DS // Importado de Japón` (los `//` en acid). Título: `Tu` (r -2) `infancia,` (r 1) salto `reimportada.` (pink, r -1). Lead: `Nintendo DS, 3DS, cartuchos y rarezas rescatadas de Akihabara. Elegidas una por una, probadas, y enviadas a cualquier punto del país.` Hand: `→ retomá lo que era tuyo`. CTAs: `Ver el botín` (pink → `/botin`), `Escribinos por WhatsApp`.
- Marquee diagonal cyan: `Retomá lo que era tuyo` ★ `Región Japón, idioma nostalgia` ★ `Soplar el cartucho no hace falta`.
- Why: `Envíos a todo el país` / `Recibí tu compra estés donde estés. Embalado como si fuera a cruzar el Pacífico, porque ya lo cruzó.` / `(sí, también a Ushuaia)` — `Productos únicos` / `Elegimos cada pieza por su estado, calidad y rareza. Si está acá, es porque la hubiéramos comprado nosotros.` / `(y a veces lo hicimos)` — `Soporte real, no solo venta` / `¿Dudas con juegos, configuración o instalación? Te acompañamos después de la compra, no desaparecemos.` / `(te respondemos un humano)`. Rotaciones de iconos: -4, 3, -2.
- Boot: `RETAKE BIOS v1.0  (c) 2026` / `MEM CHECK ........... OK` / `CARTUCHO ............ DETECTADO` / `SOPLAR CARTUCHO ..... NO HACE FALTA` / `REGION LOCK ......... IGNORADO` / `CARGANDO BOTIN ...... ▓▓▓▓▓▓▓▓░░`.
- Seed (4 productos, en este orden de createdAt descendente): `Nintendo 3DS Gloss Pink` (consolas, 350000, "pantalla sin rayones, con cargador", 2013, featured) · `Nintendo 3DS Cosmo Black` (consolas, 250000, "la clásica. el 3D todavía marea", 2011) · `DS Lite Crimson / Black` (consolas, 180000, "bisagra firme, cosa rara", 2007, limited) · `Pokémon SoulSilver (JP)` (cartuchos, 90000, "en japonés, pero ya sabés qué hace", 2009). Todos `available`, origin `JP`, slugs: `nintendo-3ds-gloss-pink`, `nintendo-3ds-cosmo-black`, `ds-lite-crimson-black`, `pokemon-soulsilver-jp`.

---

## 5. Tareas por olas

Reglas:
- Cada tarea tiene una lista **exclusiva** de archivos que crea/edita. Dentro de una misma ola nadie toca archivos de otra tarea. `package.json` y `pnpm-lock.yaml` los toca **solo T01**: ya instala todo lo que el proyecto va a necesitar.
- Antes de reportar, cada tarea corre sus comandos de verificación y, como mínimo, `pnpm lint && pnpm typecheck && pnpm test && pnpm build` deben pasar (si una tarea de ola 2 deja algo que solo se completa en ola 3, lo deja con stubs tipados, nunca roto).
- Si descubrís que un contrato de la sección 4 no cierra, implementalo igual con la mínima desviación, y **anotá la desviación en tu reporte**.
- Commits: uno por tarea sobre `main`, mensaje `T0x: <qué>`; no pushear (no hay remoto configurado; lo decide Juan).

```
Ola 1:  T01
Ola 2:  T02 ‖ T03 ‖ T04
Ola 3:  T05 ‖ T06
Ola 4:  T07 ‖ T08
Ola 5:  T09
```

---

### T01 — Scaffold del proyecto (Ola 1)

**Objetivo:** proyecto Next 16 con pnpm que pasa lint/typecheck/test/build, con tokens, fuentes, env y configuración de todo lo que usan las olas siguientes.

**Archivos (exclusivos):** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `vitest.config.ts`, `drizzle.config.ts`, `.env.example`, `.env.local` (no commitear), `.gitignore`, `AGENTS.md` (generado), `src/app/layout.tsx`, `src/app/fonts.ts`, `src/app/globals.css` (solo cabecera 4.8), `src/app/page.tsx` (placeholder), `src/app/icon.svg`, `src/lib/env.ts`, `src/lib/public-env.ts`, `src/instrumentation.ts`, `src/lib/products/constants.ts`, `data/.gitkeep`, `data/uploads/.gitkeep`, `tests/env.test.ts`. (No toca `design/` ni `docs/`.)

**Dependencias:** ninguna.

**Pasos:**
1. Scaffold en un directorio temporal y copiar (así no choca con `docs/`):
   ```bash
   cd /tmp && rm -rf retake-cna && pnpm dlx create-next-app@16.4.0 retake-cna --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install --disable-git --no-agent-feedback
   cp -a /tmp/retake-cna/. ~/retake/ && rm -rf /tmp/retake-cna
   cd ~/retake && rm -f README.md   # el README lo escribe Juan; design/, docs/ y .git/ quedan intactos
   ```
   El repo **ya existe** (rama `main`, un commit con `design/`): no correr `git init`.
2. **Antes de instalar**, crear `pnpm-workspace.yaml`:
   ```yaml
   allowBuilds:
     esbuild: true
     unrs-resolver: true
     sharp: true
   ```
3. Editar `package.json`: nombre `retake`, `"private": true`, `"packageManager": "pnpm@12.4.2"`, `"engines": { "node": ">=22" }`. Reemplazar los rangos `^` de lo que generó create-next-app por las versiones exactas de 2.1. Scripts:
   ```json
   {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "eslint .",
     "typecheck": "next typegen && tsc --noEmit",
     "test": "vitest run",
     "test:watch": "vitest",
     "format": "prettier --write .",
     "format:check": "prettier --check .",
     "db:generate": "drizzle-kit generate",
     "db:migrate": "node --env-file-if-exists=.env.local --env-file-if-exists=.env --import=tsx scripts/migrate.ts",
     "db:seed": "node --env-file-if-exists=.env.local --env-file-if-exists=.env --import=tsx scripts/seed.ts",
     "db:setup": "pnpm db:migrate && pnpm db:seed",
     "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
   }
   ```
4. `pnpm install`, luego `pnpm add -E drizzle-orm@0.45.4 @libsql/client@0.18.0 zod@4.6.5 jose@6.2.12 sharp@0.35.5 @paralleldrive/cuid2@3.3.0` y `pnpm add -D -E drizzle-kit@0.31.11 tsx@4.23.15 vitest@5.0.3 prettier@3.9.9 @types/node@22.20.5`. Verificar que `typescript` quedó en `5.9.3` y `eslint` en `9.39.5` (si create-next-app puso otra cosa, `pnpm add -D -E typescript@5.9.3 eslint@9.39.5 eslint-config-next@16.4.0`).
5. `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"paths": { "@/*": ["./src/*"] }`, mantener `include` generado (`next-env.d.ts`, `.next/types/**/*.ts`, `**/*.ts`, `**/*.tsx`) y agregar `"exclude": ["node_modules", "design", "data"]`.
6. `next.config.ts`:
   ```ts
   import type { NextConfig } from 'next';
   const nextConfig: NextConfig = {
     reactStrictMode: true,
     serverExternalPackages: ['@libsql/client', 'libsql', 'sharp'],
     experimental: { serverActions: { bodySizeLimit: '32mb' } },
   };
   export default nextConfig;
   ```
7. `eslint.config.mjs`: mantener lo generado (`defineConfig`, `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`) y agregar `globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'drizzle/**', 'data/**', 'design/**', 'docs/**'])` y la regla `'@next/next/no-img-element': 'off'` (las fotos ya vienen optimizadas por sharp y se sirven por nuestro route handler).
8. `.prettierrc`: `{ "singleQuote": true, "semi": true, "printWidth": 110, "trailingComma": "all" }`. `.prettierignore`: `.next`, `node_modules`, `pnpm-lock.yaml`, `drizzle`, `data`, `design`, `docs`.
9. `vitest.config.ts`:
   ```ts
   import path from 'node:path';
   import { defineConfig } from 'vitest/config';
   export default defineConfig({
     resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
     test: {
       environment: 'node',
       include: ['tests/**/*.test.ts'],
       env: {
         DATABASE_URL: ':memory:',
         ADMIN_PASSWORD: 'test-password',
         SESSION_SECRET: 'test-secret-test-secret-test-secret-1234',
         UPLOADS_DIR: 'data/uploads-test',
         NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
         NEXT_PUBLIC_WHATSAPP_NUMBER: '5491100000000',
         NEXT_PUBLIC_INSTAGRAM: 'retake.ar',
       },
     },
   });
   ```
10. `drizzle.config.ts` (4.2), `.env.example` (4.1), copiar `.env.example` → `.env.local` y completar `SESSION_SECRET` con `openssl rand -hex 32`.
11. `.gitignore`: al generado, **reemplazar** la línea `.env*` por:
    ```
    .env
    .env.*
    !.env.example
    /data/*
    !/data/.gitkeep
    !/data/uploads/
    /data/uploads/*
    !/data/uploads/.gitkeep
    ```
12. `src/lib/env.ts`, `src/lib/public-env.ts`, `src/instrumentation.ts` según 4.1, y `src/lib/products/constants.ts` textual de 4.2 (es el contrato compartido que T02, T03 y T04 importan en paralelo; sin dependencias).
13. `src/app/fonts.ts` (4.8) y `src/app/globals.css` (solo la cabecera de 4.8: import, `@theme`, `@theme inline`, `:root`, `@layer base`). Borrar el CSS de ejemplo de create-next-app.
14. `src/app/layout.tsx`:
    ```tsx
    import type { Metadata } from 'next';
    import { fontClassName } from './fonts';
    import { publicEnv } from '@/lib/public-env';
    import './globals.css';
    export const metadata: Metadata = {
      metadataBase: new URL(publicEnv.siteUrl),
      title: { default: 'RETAKE // Retomá lo que era tuyo', template: '%s // RETAKE' },
      description: 'Nintendo DS, 3DS, cartuchos y rarezas importadas de Japón. Elegidas una por una. Envíos a todo el país.',
    };
    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="es" className={fontClassName}>
          <body id="top">{children}</body>
        </html>
      );
    }
    ```
15. `src/app/page.tsx` placeholder: `<main className="wrap py-20"><h1 className="font-shout text-7xl uppercase text-pink">RETAKE</h1><p className="font-pixel text-xs uppercase text-cyan">Retomá lo que era tuyo</p></main>` (sirve para comprobar que fuentes y tokens funcionan). Reemplazar `favicon.ico` generado por `src/app/icon.svg` (4.9); borrar `public/*.svg` de ejemplo.
16. `mkdir -p data/uploads && touch data/.gitkeep data/uploads/.gitkeep`. Verificar con `git status` que `design/` no cambió.
17. `tests/env.test.ts`: `getEnv()` con el env de vitest devuelve `UPLOADS_DIR === 'data/uploads-test'`; con `SESSION_SECRET` corto (usar `vi.stubEnv` + resetear módulo con `vi.resetModules()` y re-import dinámico) lanza error que contiene `SESSION_SECRET`.
18. `pnpm format && pnpm check`. Commit `T01: scaffold`.

**Aceptación:**
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (1 archivo, 2 tests), `pnpm build` pasan desde cero.
- `pnpm dev` muestra "RETAKE" en Anton magenta sobre fondo `#0a0a0a`, tagline en Silkscreen cian; `<html>` tiene las 5 clases de fuentes; `curl -s localhost:3000/icon.svg | head -c 60` devuelve el SVG.
- `git status` no muestra `.env.local`, `data/retake.db` ni `.next`.
- `package.json` sin `^` en ninguna dependencia; `pnpm-workspace.yaml` con `allowBuilds`.

**Verificación:** `pnpm check`; `pnpm dev` + `curl -sI localhost:3000 | head -1` → `200`.

---

### T02 — Capa de datos: schema, migraciones, seed, queries, repo, tests (Ola 2)

**Objetivo:** DB funcionando (archivo local y `:memory:`), migración inicial commiteada, seed con los 4 productos, lecturas/escrituras puras y testeadas.

**Archivos (exclusivos):** `src/lib/products/types.ts`, `src/lib/products/schemas.ts`, `src/lib/utils/slugify.ts`, `src/lib/utils/form.ts`, `src/lib/db/schema.ts`, `src/lib/db/client.ts`, `src/lib/db/migrate.ts`, `drizzle/**`, `src/lib/products/queries.ts`, `src/lib/products/repo.ts`, `scripts/migrate.ts`, `scripts/seed.ts`, `tests/slugify.test.ts`, `tests/products.schemas.test.ts`, `tests/products.repo.test.ts`, `tests/helpers/db.ts`.

**Dependencias:** T01.

**Pasos:**
1. Escribir `types.ts`, `schemas.ts`, `form.ts`, `slugify.ts` textuales de 4.3/4.7 (`constants.ts` ya existe desde T01: no tocarlo).
2. `schema.ts`, `client.ts`, `migrate.ts` de 4.2. `pnpm db:generate` → revisar `drizzle/0000_*.sql`: dos tablas, FK con `on delete cascade`, 5 índices (1 unique). Commitear `drizzle/`.
3. `tests/helpers/db.ts`: `export async function testDb(): Promise<Db>` → `createDb(':memory:')` + `runMigrations`.
4. `queries.ts` y `repo.ts` según 4.4 (relational queries de drizzle: `db.query.products.findMany({ with: { images: { orderBy: asc(productImages.position) } } })`; orden vendidos-al-final con `sql\`case when ${products.status} = 'sold' then 1 else 0 end\``).
5. `scripts/migrate.ts`: `getEnv()` → `createDb` → `runMigrations` → log `migrations applied` → `client.close()`. `scripts/seed.ts`: si `--reset` borra `product_images` y `products`; si ya hay productos y no es reset, log y salir; si no, inserta los 4 de 4.12 con `createdAt` escalonados (hoy, -1 día, -2, -3) para que el orden sea el del mockup.
6. Tests:
   - `slugify.test.ts`: los 3 ejemplos de 4.7 + vacío + límite 80.
   - `products.schemas.test.ts`: objeto estilo FormData (todo strings) válido → tipos correctos (`price` number, `featured` false si ausente, `year: ''` → null, `slug: ''` → undefined); `category: 'x'` → `toFieldErrors` tiene `fields.category[0] === 'Elegí una categoría'`; `imageFileSchema` rechaza `new File([new Uint8Array(IMAGE_MAX_BYTES + 1)], 'a.jpg', { type: 'image/jpeg' })` y `type: 'image/gif'`.
   - `products.repo.test.ts` (cada test con `testDb()` nuevo): insert genera id/slug; dos inserts con el mismo name → `foo`, `foo-2`; `updateProductById` con slug ajeno → `RepoError('slug_taken')`; `listProducts()` pone `sold` al final y respeta `sortOrder`/`createdAt`; `listProducts({ q: 'pokémon' })` no matchea pero `{ q: 'pok' }` sí (LIKE es case-insensitive ASCII; documentar que no normaliza acentos); `{ category }`, `{ status }`; `latestProducts(2)` solo available; `limitedProducts` excluye sold; `countsByStatus`; `insertImages` asigna positions 0..n, la 9.ª lanza `too_many_images`; `reorderImages` con set incompleto → `bad_order`; `deleteImage` compacta; `deleteProductById` deja 0 imágenes y devuelve 2 keys por imagen.
7. `pnpm db:setup` contra `.env.local` → `data/retake.db` con 4 productos (`sqlite3` no está garantizado; verificar con un `node -e` usando `@libsql/client`).
8. `pnpm check`. Commit `T02: data layer`.

**Aceptación:**
- `drizzle/meta/_journal.json` existe; `pnpm db:migrate` es idempotente (segunda corrida no falla).
- `pnpm db:seed` dos veces no duplica; `pnpm db:seed --reset` vuelve a 4.
- Tests: ≥ 20 casos, todos verdes, en < 5 s.
- Ningún archivo de esta tarea importa `next/*`.

**Verificación:** `pnpm test`, `pnpm db:setup`, `pnpm check`.

---

### T03 — Auth, storage, proxy, route handler de uploads (Ola 2)

**Objetivo:** sesión JWT en cookie, login/logout como Server Actions, proxy que protege `/admin`, storage local con procesamiento sharp y servido por route handler.

**Archivos (exclusivos):** `src/lib/auth/session.ts`, `src/lib/auth/password.ts`, `src/lib/auth/server.ts`, `src/lib/auth/actions.ts`, `src/proxy.ts`, `src/lib/storage/types.ts`, `src/lib/storage/local.ts`, `src/lib/storage/index.ts`, `src/lib/storage/images.ts`, `src/lib/storage/upload.ts`, `src/app/uploads/[...path]/route.ts`, `tests/auth.session.test.ts`, `tests/auth.password.test.ts`, `tests/storage.local.test.ts`, `tests/storage.images.test.ts`, `tests/uploads.route.test.ts`.

**Dependencias:** T01 (`upload.ts` importa `NewImageData` de `@/lib/products/constants`, que ya existe; no tocar nada de T02/T04).

**Pasos:**
1. `session.ts`: `signSession` = `new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('admin').setIssuedAt(Math.floor(now/1000)).setExpirationTime(Math.floor(now/1000) + SESSION_TTL_SECONDS).sign(new TextEncoder().encode(secret))`; `verifySessionToken` con `jwtVerify(token, key, { algorithms: ['HS256'] })`, `try/catch` → null, exigir `payload.sub === 'admin'`.
2. `password.ts` con `createHash('sha256')` + `timingSafeEqual`.
3. `server.ts` (`cookies()` es async), `actions.ts` (`'use server'`; `login` con `await new Promise(r => setTimeout(r, 400))` en fallo; `cookies().set(SESSION_COOKIE, token, sessionCookieOptions())`; `redirect('/admin')`), `proxy.ts` textual (4.5).
4. Storage según 4.6. `LocalStorage.put` hace `mkdir -p` del directorio. `getStorage()` singleton en `globalThis` como `getDb`.
5. `images.ts` con sharp; `upload.ts` con `createId()` para el id de imagen.
6. Route handler según 4.6; `new Response(new Uint8Array(obj.body), { headers })`.
7. Tests:
   - `auth.session.test.ts`: roundtrip; otro secret → null; token con `now` = hace 8 días → null; token manipulado → null.
   - `auth.password.test.ts`: igual → true; distinto / distinta longitud / vacío → false.
   - `storage.local.test.ts`: root en `fs.mkdtempSync(os.tmpdir())`; put/get/delete; `get('../x.webp')` y `get('/etc/passwd')` → null sin tocar fuera del root; `isValidStorageKey` casos.
   - `storage.images.test.ts`: generar PNG 2400×1200 con `sharp({ create: { width: 2400, height: 1200, channels: 3, background: '#ff2d8a' } }).png().toBuffer()`; `processImage` → main 1600×800 webp (`sharp(buf).metadata().format === 'webp'`), thumb 480×240; una 300×300 no se agranda.
   - `uploads.route.test.ts`: con `UPLOADS_DIR` del env de vitest (tmp, limpiar en `afterAll`), `put` un webp y llamar `GET(new Request('http://x/uploads/a/b.webp'), { params: Promise.resolve({ path: ['a', 'b.webp'] }) })` → 200, `content-type: image/webp`, `cache-control` immutable; `['..', 'x.webp']` → 400; inexistente → 404.
8. `pnpm check`. Commit `T03: auth + storage`.

**Aceptación:**
- `pnpm dev`: `curl -sI localhost:3000/admin | head -1` → `307` y `location: /admin/login` (la página de login todavía no existe: 404 al seguirla es esperado en esta ola).
- Tests verdes (≥ 15 casos). `sharp` funciona en WSL (si falla la carga nativa, reportar).
- `proxy.ts` no importa `@/lib/env` ni nada de `drizzle`/`sharp`.

**Verificación:** `pnpm test`, `pnpm check`, el `curl` de arriba.

---

### T04 — CSS del mockup, utils de UI, pixel art y primitivas base (Ola 2)

**Objetivo:** portar el `<style>` del mockup a `globals.css`, escribir los utils puros de UI con tests, y las primitivas que no dependen de nada más (PixelIcon, Sprite, ProductArt, Stars, Button, SubmitButton, Stamp, StatusStamp, WhatsAppLink).

**Archivos (exclusivos):** `src/app/globals.css` (agrega `@layer components`; no toca la cabecera de T01), `src/lib/utils/format.ts`, `src/lib/utils/date.ts`, `src/lib/utils/whatsapp.ts`, `src/lib/utils/cn.ts`, `src/lib/utils/css.ts`, `src/lib/utils/random.ts`, `src/lib/utils/shapes.ts`, `src/lib/pixel/grids.ts`, `src/lib/pixel/palettes.ts`, `src/components/ui/PixelIcon.tsx`, `Skull.tsx`, `Stars.tsx`, `Sprite.tsx`, `ProductArt.tsx`, `Button.tsx`, `SubmitButton.tsx`, `Stamp.tsx`, `StatusStamp.tsx`, `WhatsAppLink.tsx`, `src/content/reviews.json`, `src/content/reviews.ts`, `tests/format.test.ts`, `tests/date.test.ts`, `tests/whatsapp.test.ts`, `tests/random.test.ts`, `tests/shapes.test.ts`, `tests/reviews.test.ts`.

**Dependencias:** T01 (`ProductArt`/`StatusStamp` importan `Category`/`Status`/`STATUSES` de `@/lib/products/constants`, que ya existe; no tocar nada de T02/T03).

**Pasos:**
1. Portar el CSS: abrir `design/mockup.html`, copiar todo el `<style>` **excepto** `:root`, `*`, `html`, `body`, `img,svg`, `a`, `body::after` (ya están en la cabecera) dentro de `@layer components { ... }` en `globals.css`. Mantener nombres de clase y valores. Agregar `.photo img{width:100%;height:100%;object-fit:cover}` y `.slice{display:block}` (las copias del glitch son `<span>` con clase `.h1`, deben comportarse como el `<h1>`). Agregar `[id]{scroll-margin-top:80px}` para que la barra sticky no tape las anclas. Dejar las `@media` responsive y el bloque `prefers-reduced-motion` al final, **fuera** de `@layer` (para que ganen por orden).
2. Utils de 4.7 (`format`, `date`, `whatsapp`, `cn`, `css`, `random`, `shapes`). `palettes.ts` y `grids.ts` de 4.9 (grids copiados textual del JS del mockup).
3. Primitivas de la tabla 4.10 listadas arriba. `Button` con `next/link` cuando `href` empieza con `/` o `#`.
4. `reviews.json` + `reviews.ts` (4.11).
5. Tests: `formatPrice` (4 casos), `formatStampDate(new Date(2026, 9, 9))` → `09.10.26`, `whatsappUrl('+54 9 11 0000-0000', 'Hola Retake')` → `https://wa.me/5491100000000?text=Hola%20Retake`, `productWhatsappMessage`, `seededRandom('a')` determinista y distinto de `'b'`, `burstClipPath()` empieza con `polygon(` y tiene 28 puntos, `tornClipPath('x') === tornClipPath('x')`, `reviewsSummary` → `{ count: 3, average: 4.666..., averageLabel: '4.7' }`.
6. `pnpm check`. Commit `T04: mockup css + ui base`.

**Aceptación:**
- `globals.css` compila con Tailwind 4 (sin warnings de `@layer`); `pnpm build` ok.
- Reemplazando temporalmente el placeholder de `src/app/page.tsx` por `<a className="btn btn-pink">Ver el botín</a>` + `<Stamp color="cyan" r={-3}>Consola</Stamp>` + `<PixelIcon name="skull" />` se ven igual que en el mockup (revertir el placeholder antes de commitear; T05 lo va a reemplazar).
- Tests verdes (≥ 14 casos).

**Verificación:** `pnpm test`, `pnpm check`.

---

### T05 — Primitivas de collage y galería de UI (Ola 3)

**Objetivo:** el resto de `src/components/ui` (todo lo del collage: Cut, Polaroid, Photo, Tape, Sticker, Burst, Marquee, Hazard, TornSection, Glitch, BootScreen, SectionHead, Hi, Wrap) + página `/dev/ui` que los muestra todos para validarlos contra el mockup.

**Archivos (exclusivos):** `src/components/ui/Wrap.tsx`, `Cut.tsx`, `Hi.tsx`, `SectionHead.tsx`, `Tape.tsx`, `Sticker.tsx`, `Burst.tsx`, `Polaroid.tsx`, `Photo.tsx`, `Marquee.tsx`, `Hazard.tsx`, `TornSection.tsx`, `Glitch.tsx`, `BootScreen.tsx`, `src/components/ui/index.ts` (re-exports de **todas** las primitivas, incl. las de T04), `src/app/dev/ui/page.tsx`.

**Dependencias:** T04 (y T02 para tipos).

**Pasos:**
1. Implementar según 4.10. `BootScreen` según el algoritmo. `TornSection`/`Burst` calculan `clipPath` en render (sin `useEffect`).
2. `/dev/ui`: `if (process.env.NODE_ENV === 'production') notFound();` y render de: hero completo del mockup (kicker, `Glitch` con los 3 `Cut`, lead, hand, CTAs, `HeroArt` armado a mano con `Polaroid`+`Sprite`+`Sticker`+`Burst`+`Stamp`), los 3 marquees, `TornSection` con los props, 4 tags, 4 cards con datos hardcodeados (una `.sold`), hazard, 3 note-cards, botones en sus variantes, stamps, `BootScreen` al inicio. Es, en la práctica, el mockup rehecho con componentes y datos fijos.
3. Comparar lado a lado con `design/mockup.html` abierto en el navegador (misma resolución): tipografías, rotaciones, sombras, halftone, bordes rasgados, glitch en pulsos, marquee corriendo, boot screen tipeando.
4. `pnpm check`. Commit `T05: ui primitives`.

**Aceptación:**
- `/dev/ui` en dev reproduce visualmente el mockup; en `pnpm build && pnpm start` devuelve 404.
- Sin warnings de hidratación en consola (torn edges y burst deterministas; boot screen con el mismo markup inicial en SSR).
- Con `prefers-reduced-motion` emulado en DevTools: no hay boot, ni marquee en movimiento, ni slices.
- `pnpm check` verde.

**Verificación:** `pnpm check`; inspección visual documentada en el reporte (qué se comparó).

---

### T06 — Backoffice: login, panel, ABM de productos, imágenes (Ola 3)

**Objetivo:** admin completo, server-rendered, con Server Actions y mínimo JS cliente.

**Archivos (exclusivos):** `src/lib/products/actions.ts`, `src/app/admin/(auth)/login/page.tsx`, `src/app/admin/(auth)/layout.tsx` (fondo papel, centrado), `src/app/admin/(panel)/layout.tsx`, `src/app/admin/(panel)/page.tsx`, `src/app/admin/(panel)/productos/page.tsx`, `src/app/admin/(panel)/productos/nuevo/page.tsx`, `src/app/admin/(panel)/productos/[id]/page.tsx`, `src/components/admin/*` (todos los de 4.10).

**Dependencias:** T02, T03, T04 (usa `Button`, `SubmitButton`, `Stamp`, `StatusStamp`, `PixelIcon`, `Skull`, `ProductArt`, `formatPrice`, `formatLongDate`, `cn`, `slugify`). Importar primitivas **por archivo** (`@/components/ui/Button`), nunca desde `@/components/ui` (el barrel `index.ts` lo crea T05 en paralelo).

**Pasos:**
1. `actions.ts` según 4.4 (reglas 1-6). `addProductImages`: `const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0)`; validar; comprobar `existing.length + files.length <= 8`; por cada archivo `saveProductImage(productId, file, product.name)`; `insertImages`. Si falla sharp en un archivo, devolver `{ ok: false, errors: { form: [`No pude procesar "${file.name}"`] } }` y no insertar nada de esa tanda (borrar lo ya subido de la tanda).
2. `(panel)/layout.tsx`: `await requireSession()` + `AdminShell`. `export const dynamic = 'force-dynamic'` en todas las páginas del panel.
3. Páginas según 4.12. En `[id]/page.tsx` usar `const { id } = await params`.
4. Componentes admin según 4.10. Estilo: papel/tinta, `.pixel` en labels, botones `.btn`, bordes `3px` tinta, sombras duras; **sin** rotaciones, noise, marquee ni stickers. Form en una columna (max-w-2xl), campos agrupados: "Lo básico" (name, slug, category, price, status), "Detalle" (note, description, year, origin), "Destacar" (featured, limited, sortOrder).
5. Smoke manual con `pnpm dev` (DB seedeada): login con contraseña mala → error; buena → `/admin` con 4 disponibles; crear producto sin nombre → error inline; crear ok → redirige a edición; subir 2 fotos (jpg y png) → aparecen thumbs, archivos en `data/uploads/products/<id>/`; reordenar; borrar una; cambiar status a `sold`; borrar producto → vuelve al listado y los archivos desaparecen; logout → `/admin` redirige a login.
6. `pnpm check`. Commit `T06: admin`.

**Aceptación:**
- Todos los flujos del paso 5 funcionan; ningún campo sin `<label>`; errores con `role="alert"`; botones muestran estado pending.
- Un `curl -s -o /dev/null -w '%{http_code}' localhost:3000/admin/productos` sin cookie → `307`; con cookie válida → `200`.
- Subir un `.gif` → mensaje "Solo JPG, PNG o WebP"; 9 fotos → mensaje de máximo.
- `pnpm check` verde.

**Verificación:** `pnpm check`; checklist del paso 5 en el reporte.

---

### T07 — Sitio público (Ola 4)

**Objetivo:** home, catálogo, detalle y 404 fieles al mockup, con datos reales de la DB.

**Archivos (exclusivos):** `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx`, `src/app/(site)/botin/page.tsx`, `src/app/(site)/botin/[slug]/page.tsx`, `src/app/not-found.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/components/site/*` (todos los de 4.10). **Borra** `src/app/page.tsx` (placeholder de T01).

**Dependencias:** T02, T04, T05.

**Pasos:**
1. `(site)/layout.tsx`: `<TopBar />{children}<SiteFooter /><WhatsAppFloat />`. Páginas con `export const dynamic = 'force-dynamic'`.
2. Home según 4.12 (orden de secciones del mockup). `LatestLoot` con `latestProducts(4)`; `LimitedEditions` con `limitedProducts(4)`.
3. `/botin`: `const sp = catalogFiltersSchema.parse(await searchParams)`; título `generateMetadata` "Botín" o "Consolas" según categoría.
4. `/botin/[slug]`: `generateMetadata` + página. `notFound()` si no existe.
5. `not-found.tsx` según 4.12. `robots.ts`: `{ rules: { userAgent: '*', disallow: ['/admin', '/uploads'] }, sitemap: `${publicEnv.siteUrl}/sitemap.xml` }`. `sitemap.ts` con `listProducts()` (solo no vendidos).
6. Comparar con `design/mockup-desktop.png` y `design/mockup-mobile.png` a 1280px y 390px.
7. `pnpm check`. Commit `T07: public site`.

**Aceptación:**
- `/` con el seed se ve como `design/mockup-desktop.png` (4 cards con precios `$350.000`, `$250.000`, `$180.000`, `$90.000`, en ese orden, con bursts pink/cyan/acid/yellow); el mockup usaba sprites porque no hay fotos: con el seed sin imágenes debe verse igual.
- `/botin?categoria=cartuchos` muestra solo SoulSilver; `/botin?q=lite` muestra DS Lite; `/botin?categoria=zzz` ignora el filtro; producto `sold` aparece último con "VENDIDA".
- `/botin/pokemon-soulsilver-jp`: el link de WhatsApp contiene `Pok%C3%A9mon%20SoulSilver` y `/botin/pokemon-soulsilver-jp`; `/botin/no-existe` → 404 con "la consola se colgó".
- Lighthouse (DevTools, mobile) accesibilidad ≥ 90 en `/`; headings en orden (h1 único en hero, h2 por sección, h3 en cards).
- Reduced motion: sin boot, sin animaciones.
- `pnpm check` verde.

**Verificación:** `pnpm check`; `curl -s localhost:3000/botin/pokemon-soulsilver-jp | grep -o 'wa.me[^"]*'`.

---

### T08 — Endurecimiento de tests (Ola 4)

**Objetivo:** cubrir lo que quedó sin test y preparar fixtures para la integración, sin tocar código de producto.

**Archivos (exclusivos):** `tests/products.queries.test.ts`, `tests/products.actions-helpers.test.ts`, `tests/seed.test.ts`, `tests/helpers/fixtures.ts`, `tests/storage.upload.test.ts`.

**Dependencias:** T02, T03, T04.

**Pasos:**
1. `fixtures.ts`: `makeProductInput(overrides)` y `seedProducts(db)` (los 4 del mockup, reutilizable por `scripts/seed.ts` **no**: el script no se toca en esta ola; duplicar los datos acá está bien y T09 decide si unifica).
2. `products.queries.test.ts`: `escapeLike`, búsqueda con `%` literal no matchea todo, `getProductBySlug` trae imágenes ordenadas, `recentProducts` incluye vendidos, `slugExists` con `excludeId`.
3. `products.actions-helpers.test.ts`: `toFieldErrors` con errores de form y de campo; `formDataToObject` con `FormData` real y checkbox ausente.
4. `storage.upload.test.ts`: `saveProductImage` con un `File` creado desde un PNG de sharp → devuelve keys con el patrón `products/<pid>/<id>.webp` y `-thumb.webp`, ambos existentes en el `UPLOADS_DIR` de test; limpiar.
5. `seed.test.ts`: importar la lista de productos del seed si `scripts/seed.ts` la exporta (`export const SEED_PRODUCTS`); si no la exporta, testear `seedProducts(db)` de fixtures y anotar en el reporte que T09 debe hacer exportable la lista.
6. `pnpm check`. Commit `T08: tests`.

**Aceptación:** suite total ≥ 60 casos, < 15 s, sin tests flaky (correr 3 veces). `pnpm check` verde.

---

### T09 — Integración, pulido y entrega (Ola 5)

**Objetivo:** cerrar desviaciones entre tareas, pasar por todo el flujo como el dueño de la tienda, y dejar el repo listo para que Juan escriba la documentación.

**Archivos:** cualquiera (es la única tarea de su ola).

**Dependencias:** todas.

**Pasos:**
1. Leer los reportes de T02..T08: resolver desviaciones anotadas (p. ej. exportar `SEED_PRODUCTS` de `scripts/seed.ts` y usarla en fixtures; eliminar duplicados; ajustar contratos que alguien tuvo que desviar).
2. `rm -rf data/retake.db data/uploads/* && pnpm db:setup && pnpm dev`: recorrer **todo**: home → categoría → detalle → WhatsApp (verificar URL en el `href`) → 404 → login → crear producto con 3 fotos → verlo en home como "último ingreso" y con su foto real en el `HeroArt` → marcarlo `limited` → aparece en ediciones limitadas → marcarlo `sold` → va al final del catálogo con VENDIDA y desaparece de la home → borrarlo.
3. Accesibilidad: `tab` por toda la home y el admin (focus visible acid), `aria-current` en nav, `alt` en todas las fotos (nombre del producto), `aria-label` en WhatsApp flotante, contraste de `.pixel` gris sobre tinta ≥ 4.5 (si no, subir la opacidad a .75).
4. Metadatos: OG del detalle con la foto principal (`/uploads/...` absoluta vía `metadataBase`), `robots.txt`, `sitemap.xml` válidos. `icon.svg` en la pestaña.
5. Rendimiento mínimo: `pnpm build` sin warnings de tamaño; fotos en cards usan `thumbPath`; `loading="lazy"` salvo la primera card.
6. Revisar que **nada del cliente** importe `@/lib/env`, `drizzle`, `sharp`, `jose` (`grep -r "use client" -l src | xargs grep -l "lib/env\|drizzle\|sharp\|jose"` vacío).
7. `pnpm format`, `pnpm check` (3 corridas de test). Actualizar `docs/PLAN.md` solo con una sección final "Estado al cierre" (qué quedó distinto al plan). Commit `T09: integration pass`.
8. Reporte final para Juan: lista de env vars y cómo generar `SESSION_SECRET`, comandos de arranque (`pnpm i && cp .env.example .env.local && pnpm db:setup && pnpm dev`), limitaciones (uploads efímeros en Vercel, límite 4.5 MB por request en Vercel), y todo lo que CLAUDE.md / DESIGN.md / README.md deberían decir (sección 7).

**Aceptación:** flujo completo del paso 2 sin errores en consola del server ni del browser; `pnpm check` verde desde `rm -rf .next node_modules && pnpm i`; `git status` limpio; 9 commits.

---

## 6. Riesgos y gotchas para implementadores

**Tooling**
1. **pnpm 12 + scripts de build.** Sin `pnpm-workspace.yaml` con `allowBuilds` (esbuild, unrs-resolver), `pnpm install` termina en `ERR_PNPM_IGNORED_BUILDS`. Crear el archivo **antes** del primer install. `pnpm approve-builds` es interactivo: no sirve para agentes.
2. **TypeScript 7 es `latest` en npm.** No usarlo: typescript-eslint necesita la API JS. Si `create-next-app` instala `typescript@^7`, bajar a `5.9.3` antes de seguir.
3. **`next typegen` + `tsc`.** `tsconfig` incluye `.next/types/**`; por eso `typecheck` corre `next typegen` antes. No usar `PageProps`/`RouteContext` globales igual (dependen de ese paso).
4. **ESLint 10 todavía no:** `eslint-config-next@16` declara `>=9`, pero la combinación probada es 9.x. Flat config obligatoria.
5. **`react-hooks` de eslint-config-next 16** incluye reglas del React Compiler (`set-state-in-effect`, `refs`, `purity`): nada de `setState` síncrono dentro de `useEffect`, nada de `Math.random()`/`Date.now()` en render de client components. Los efectos de `BootScreen` solo arman timers.
6. **`server-only`** lanza al importarse en Node plano (scripts, vitest). No usarlo; la separación es por convención (`env.ts`, `db/*`, `auth/server.ts`, `storage/*` solo desde servidor).
7. **`next/font/google` descarga en build**: sin internet, `pnpm build` falla. No hay fallback offline en este plan (anotar si pasa).
8. **Next 16 lock de dev:** un solo `next dev` por proyecto; si queda un proceso colgado, matarlo antes de volver a correr (`.next/dev/lock`).
9. **Vitest 5 + alias `@/`**: se resuelve en `vitest.config.ts` (`resolve.alias`), no por tsconfig. `import.meta.dirname` requiere Node ≥ 20.11 (ok).

**Base de datos**
10. **libsql + migraciones:** usar `drizzle-orm/libsql/migrator` sobre el mismo `Db`. Para Turso remoto, `migrate()` funciona por HTTP; las transacciones de drizzle también (usa `client.transaction`). `drizzle-kit push` no está en el flujo (si se quisiera contra Turso: `dialect: 'turso'`).
11. **`PRAGMA foreign_keys`** puede estar apagado por conexión: borrar hijos a mano (ya está en el contrato del repo). `:memory:` en tests crea una DB por `createClient` (no se comparte entre clientes).
12. **`timestamp_ms`** guarda enteros; comparar fechas en tests con `getTime()`. `createdAt` escalonado en el seed para que el orden sea determinista.
13. **LIKE** en SQLite es case-insensitive solo para ASCII: `q: 'pokémon'` no matchea `Pokémon`? Sí matchea (mismos bytes), pero `pokemon` sin tilde **no** matchea `Pokémon`. Documentado; roadmap: columna `search_text` normalizada.
14. **`file:./data/retake.db`** es relativo al cwd: los scripts y `next dev/start` deben correr desde la raíz del repo. `data/` existe por el `.gitkeep`.

**Uploads**
15. **Vercel = filesystem efímero y read-only** (salvo `/tmp`): `LocalStorage` solo sirve en un VPS/Docker o en dev. En Vercel hay que implementar otro `Storage` (roadmap) y además el **body máximo por request es 4.5 MB** en funciones serverless, independiente de `bodySizeLimit`. Dejarlo escrito en README (Juan).
16. **`serverActions.bodySizeLimit`** está en `32mb` (8 fotos × ~4 MB); el límite por archivo (8 MB) y por producto (8) se valida en zod. El overhead multipart cuenta.
17. **sharp**: usar `serverExternalPackages` (ya en config). `rotate()` sin args aplica EXIF y borra el tag. `failOn: 'none'` evita que una foto levemente corrupta tire la tanda. Sin install script en 0.35 (binarios por optionalDependencies); en Alpine/Docker usar imagen glibc o `--platform`.
18. **Path traversal**: la key se valida con regex **y** se verifica `resolve(root, key).startsWith(root + sep)`. El route handler nunca recibe rutas absolutas.
19. Las URLs `/uploads/...` llevan `immutable`: nunca sobrescribir una key; cada imagen tiene id nuevo.

**UI / React**
20. **Hidratación:** nada aleatorio en render. Bordes rasgados → `tornClipPath(seed)`; bursts → `burstClipPath()` puro; fechas "Ingresó" vienen del server (dynamic); `BootScreen` renderiza el mismo markup inicial en SSR y cliente y decide en `useEffect`.
21. **`style` con custom properties**: `cssVars({ '--r': '-2deg' })` (tipado en `css.ts`); React las serializa bien en SSR.
22. **Tailwind 4 y `@theme`:** las fuentes van en `@theme inline` (referencian variables de `next/font` definidas en `<html>`); los colores en `@theme` normal. Las clases del mockup viven en `@layer components`; las `@media` quedan fuera del layer. Si Tailwind purga algo: no purga CSS escrito a mano, solo utilidades no usadas.
23. **Marquee:** el keyframe mueve `-50%`: la lista va duplicada exactamente dos veces o el loop salta.
24. **Glitch:** las dos copias son `aria-hidden` y `pointer-events: none`; el `<h1>` real es uno solo.
25. **`prefers-reduced-motion`:** CSS mata animaciones/transiciones y oculta `.slice` y `.boot`; `BootScreen` además chequea `matchMedia` para no bloquear la página.
26. **`next/link` + `#dicen`:** desde `/botin` el link a `/#dicen` navega y hace scroll al ancla; en home es scroll puro. `TopBar` sticky tapa 62px: agregar `scroll-margin-top: 80px` a las secciones con `id`.
27. **Server Actions con `.bind`:** `updateProduct.bind(null, id)` produce `(prev, formData)`; tipar `useActionState<ActionResult | null, FormData>`. `redirect()` dentro de la action nunca retorna: el estado `ok: true` casi nunca llega al cliente en create/delete.
28. **Forms GET** (`CatalogFilters`, `ProductFilters`) son `<form method="get">` sin JS: Next los maneja como navegación normal.
29. **`<img>` vs `next/image`:** usamos `<img>` con `width/height` de la DB (evita CLS) y la regla `no-img-element` apagada; `next/image` no aporta con fotos ya procesadas y un FS efímero.
30. **Copy en español:** acentos y `¿¡` dentro de JSX van tal cual (archivo UTF-8). Comillas rectas en `"` dentro de texto → usar `&quot;` o template strings.

**Seguridad**
31. Comparación de contraseña en tiempo constante vía hash; 400 ms de espera en fallo; sin rate-limit real (roadmap).
32. Cookie `httpOnly; SameSite=Lax; Secure` en prod; 7 días; secreto ≥ 32 chars. El proxy valida el JWT **y** cada action/layout llama `requireSession()` (Next documenta que el proxy puede quedar sin cobertura si cambia un matcher).
33. Las actions nunca devuelven mensajes con stack traces; loguear al server con `console.error` y devolver un texto genérico.

---

## 7. Qué deben cubrir los docs (los escribe Juan después)

**CLAUDE.md**
- Stack y versiones pineadas; que `pnpm` es el único gestor y por qué existe `pnpm-workspace.yaml`.
- Comandos: `dev`, `check`, `db:generate/migrate/seed/setup`, `test`, `format`.
- Mapa de carpetas (sección 3) y convenciones: RSC por default, lista blanca de `'use client'`, contratos en `src/lib/*`, copy en español rioplatense con voseo, código en inglés.
- Reglas de oro: no `any`; nada aleatorio en render; env solo desde `getEnv()`; mutaciones solo por Server Actions con `requireSession()`; nunca tocar `drizzle/` a mano (usar `db:generate`).
- Cómo agregar un campo a producto (schema → generate → types/schemas → form → card) y cómo cambiar el `Storage`.
- Dónde está el mockup (`design/mockup.html` + capturas + `MOCKUP-NOTES.md`) y que `/dev/ui` es la galería de referencia.

**DESIGN.md**
- Concepto: DedSec / zine fotocopiado / collage / tintas planas / glitch en pulsos; qué sí y qué no (sin gradientes suaves, sin esquinas redondeadas, sombras duras, rotaciones de -3° a 3°).
- Tokens: 6 colores (hex), 5 fuentes y su rol, ruido (`--noise`, `--noise-soft`), halftone/scanlines del `.photo::after`.
- Catálogo de piezas con su clase y componente: cut, polaroid, photo, tape, sticker, burst, stamp, btn, marquee, hazard, torn, glitch, boot, pixel icons y sprites (paletas).
- Reglas de movimiento (pulsos de 7 s, marquee 30 s, boot 150 ms/línea) y `prefers-reduced-motion`.
- Backoffice: mismo papel/tinta, labels pixel, botones brutalistas, **sin** collage ni animaciones; por qué.
- Copy/voz: voseo, humor seco, frases cortas; ejemplos y antiejemplos.
- Responsive: breakpoints 900 y 480 del mockup y qué cambia.

**README.md** (para el amigo, no técnico-avanzado)
- Qué es Retake y qué hace el sitio (ventas por WhatsApp, admin de productos).
- Requisitos (Node 22, pnpm 12) y arranque en 5 comandos.
- Variables de entorno explicadas una por una; cómo generar `SESSION_SECRET`; cómo cambiar el WhatsApp e Instagram.
- Cómo usar el admin (crear producto, fotos, estados, ediciones limitadas, destacar, borrar).
- Deploy: opción A VPS/Docker con sqlite + `data/` persistente; opción B Vercel + Turso (migrar con `pnpm db:migrate` apuntando a Turso) y la advertencia de uploads efímeros + 4.5 MB (hasta implementar Cloudinary).
- Backups: copiar `data/retake.db` y `data/uploads/`.
- Roadmap (sección 8) y cómo pedir ayuda.

---

## 8. Roadmap después de v1

1. **Reseñas con moderación:** tabla `reviews` (author, text, stars, status `pending|approved|rejected`, createdAt), form público con honeypot y rate-limit, cola en `/admin/resenas`, promedio calculado solo con aprobadas. Migrar `reviews.json` como seed.
2. **Storage en Cloudinary (o Vercel Blob):** implementar `CloudinaryStorage implements Storage` (`put` = upload con `public_id` = key, `get` innecesario si `publicUrl` apunta al CDN, `delete` = destroy). Env `STORAGE_DRIVER=local|cloudinary`. Resolver el límite de 4.5 MB con upload firmado desde el browser.
3. **Multi-admin:** tabla `users` (email, passwordHash con argon2, role), invitaciones por link, sesiones con `jti` revocables, rate-limit de login (p. ej. 5 intentos / 15 min por IP).
4. **i18n EN:** `next-intl` o diccionarios propios; rutas `/en`; copy en inglés para compradores de afuera; precios con conversión indicativa.
5. Mejoras menores: búsqueda normalizada sin acentos (`search_text`), "reservado hasta" con fecha, orden manual drag-and-drop de productos, OG image generada (`opengraph-image.tsx` con la estética del zine), analytics sin cookies (Plausible/Umami), export CSV del catálogo.

---

## 9. Estado al cierre (2026-10-09)

Desviaciones respecto de los contratos originales que sobrevivieron (T02–T09), una línea cada una:

- `src/proxy.ts` (Next 16, ex `middleware.ts`) y `src/lib/auth/server.ts` comparten `sessionFromCookie(token, secret)` de `session.ts`; `proxy.ts` no importa `@/lib/env` y lee `process.env.SESSION_SECRET` directo.
- `loginSchema` se usa desde `auth/actions.ts` (T03 no podía importarlo); el login suma limitador en memoria por IP (`src/lib/auth/rate-limit.ts`: 5 fallos / 15 min, por proceso; multi-instancia queda en el roadmap).
- `productInputSchema.price` trata `''` como faltante ("Poné un precio"); `0` sigue siendo válido.
- `imageFilesSchema` suma tope de 64 MB por tanda y `serverActions.bodySizeLimit` pasó de 32 a 72 MB.
- `ensureUniqueSlug` recorta la base para que `base-N` no pase de 80 caracteres.
- `insertProduct` con slug explícito repetido lanza `RepoError('slug_taken')` (antes lo deduplicaba con sufijo); solo los slugs autogenerados pasan por `ensureUniqueSlug`.
- `updateProductById` sin slug regenera desde `name` (conserva el actual si ya es `base` o `base-N`), en vez de mantenerlo siempre.
- `saveProductImage` borra el archivo principal si falla el `put` del thumb; `LocalStorage.delete` quita el directorio padre si queda vacío (nunca el root).
- `scripts/seed.ts` exporta `seedDb(db, { reset })` además de `SEED_PRODUCTS`; `--reset` borra también los archivos de las fotos; `tests/helpers/fixtures.ts` `seedProducts` delega en `seedDb`.
- `drizzle.config.ts` usa `dialect: 'turso'` + `authToken` solo cuando `DATABASE_URL` empieza con `libsql://`.
- Queries nuevas fuera del contrato: `getProductSlug`, `listProductSlugs` (sitemap, sin join de imágenes) y `heroProduct` (destacado disponible más reciente, si no el último disponible).
- `src/lib/products/cached.ts` (solo servidor) envuelve con `React.cache` `getProductBySlug` y el parseo de filtros del catálogo; `queries.ts` sigue sin importar `react`.
- `Hero`/`HeroArt` reciben `product` (no `latest`); `Photo` acepta `loading` (default `'lazy'`) y la galería usa `'eager'` en la foto visible; `SectionHead` acepta `as` (el catálogo usa `h1`).
- `/admin/(panel)/error.tsx` agregado como red de seguridad ante fallos inesperados de acciones.
- `src/app/favicon.ico` (PNG dentro de ICO, 32x32) generado una vez desde `icon.svg`; el generador no está en el repo.
- Contraste/foco: `.legal` a .75 de opacidad, `.tag .n` a .65, textos `pixel` del admin a `text-ink/75`, errores de formulario en `#c2005c`, y outline de foco `ink` sobre superficies de papel (cards, tags, admin).
- El `role="alert"` con el nombre del producto en `/admin/productos/[id]` es el anunciador de rutas de Next (`next-route-announcer`), no un componente propio; los tests e2e deben acotar el selector.
- `robots.txt` bloquea `/uploads`, por lo que los buscadores no indexan las fotos (las OG de redes sociales igual funcionan); revisar si se quiere indexación de imágenes.
