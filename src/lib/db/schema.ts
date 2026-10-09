import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { CATEGORY_VALUES, STATUS_VALUES } from '@/lib/products/constants';

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(), // cuid2
    slug: text('slug').notNull(), // único (índice abajo)
    name: text('name').notNull(),
    category: text('category', { enum: CATEGORY_VALUES }).notNull(),
    price: integer('price').notNull(), // ARS enteros
    status: text('status', { enum: STATUS_VALUES }).notNull().default('available'),
    note: text('note').notNull().default(''), // "pantalla sin rayones, con cargador"
    description: text('description'), // opcional, largo
    year: integer('year'), // opcional
    origin: text('origin').notNull().default('JP'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    limited: integer('limited', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
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
    id: text('id').primaryKey(), // cuid2
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    path: text('path').notNull(), // key en Storage: products/<productId>/<id>.webp
    thumbPath: text('thumb_path').notNull(), // products/<productId>/<id>-thumb.webp
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    alt: text('alt').notNull().default(''),
    position: integer('position').notNull().default(0), // 0 = imagen principal
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index('product_images_product_position_idx').on(t.productId, t.position)],
);

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
