'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth/server';
import { getDb } from '@/lib/db/client';
import { getStorage } from '@/lib/storage';
import { saveProductImage } from '@/lib/storage/upload';
import { formDataToObject } from '@/lib/utils/form';
import { IMAGES_MAX_PER_PRODUCT, type NewImageData } from './constants';
import { getProductById, getProductSlug } from './queries';
import {
  deleteImage,
  deleteProductById,
  insertImages,
  insertProduct,
  reorderImages,
  RepoError,
  updateProductById,
} from './repo';
import { imageFilesSchema, productInputSchema, toFieldErrors } from './schemas';
import type { ActionResult } from './types';

const GENERIC_ERROR = 'Algo salió mal. Probá de nuevo.';

function failure(message: string): ActionResult {
  return { ok: false, errors: { form: [message] } };
}

function repoFailure(error: unknown, context: string): ActionResult {
  if (error instanceof RepoError) {
    switch (error.code) {
      case 'slug_taken':
        return { ok: false, errors: { fields: { slug: ['Ese slug ya existe'] } } };
      case 'not_found':
        return failure('No encontré ese producto. Quizás ya lo borraron.');
      case 'too_many_images':
        return failure(`Máximo ${IMAGES_MAX_PER_PRODUCT} fotos por producto`);
      case 'bad_order':
        return failure('El orden no coincide con las fotos del producto. Recargá la página.');
    }
  }
  // Nunca devolver detalles internos al cliente.
  console.error(`[products/actions] ${context} falló`, error);
  return failure(GENERIC_ERROR);
}

function revalidateProduct(id: string, ...slugs: Array<string | undefined>): void {
  revalidatePath('/');
  revalidatePath('/botin');
  for (const slug of new Set(slugs)) if (slug) revalidatePath(`/botin/${slug}`);
  revalidatePath('/admin');
  revalidatePath('/admin/productos');
  revalidatePath(`/admin/productos/${id}`);
}

async function deleteKeys(keys: string[]): Promise<void> {
  const storage = getStorage();
  await Promise.all(
    keys.map(async (key) => {
      try {
        await storage.delete(key);
      } catch (error) {
        console.error('[products/actions] no pude borrar el archivo', key, error);
      }
    }),
  );
}

/** Crea. Éxito → redirect(`/admin/productos/${id}`). */
export async function createProduct(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const parsed = productInputSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };

  let id: string;
  try {
    const product = await insertProduct(parsed.data, getDb());
    id = product.id;
    revalidateProduct(id, product.slug);
  } catch (error) {
    return repoFailure(error, 'createProduct');
  }
  redirect(`/admin/productos/${id}`);
}

/** Edita. Usar con .bind(null, id). */
export async function updateProduct(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();
  const parsed = productInputSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };

  try {
    const db = getDb();
    const beforeSlug = await getProductSlug(id, db);
    if (beforeSlug === null) return repoFailure(new RepoError('not_found'), 'updateProduct');
    const updated = await updateProductById(id, parsed.data, db);
    if (!updated) return repoFailure(new RepoError('not_found'), 'updateProduct');
    revalidateProduct(id, beforeSlug, updated.slug);
    return { ok: true, id };
  } catch (error) {
    return repoFailure(error, 'updateProduct');
  }
}

/** Borra producto + archivos. Éxito → redirect('/admin/productos'). */
export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireSession();
  try {
    const db = getDb();
    const beforeSlug = await getProductSlug(id, db);
    const { deleted, storageKeys } = await deleteProductById(id, db);
    if (!deleted) return repoFailure(new RepoError('not_found'), 'deleteProduct');
    await deleteKeys(storageKeys);
    revalidateProduct(id, beforeSlug ?? undefined);
  } catch (error) {
    return repoFailure(error, 'deleteProduct');
  }
  redirect('/admin/productos');
}

/** formData.getAll('images') → valida → sharp → storage → repo. Usar con .bind(null, productId). */
export async function addProductImages(
  productId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();
  const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
  const parsed = imageFilesSchema.safeParse(files);
  if (!parsed.success) {
    // Los errores por archivo llegan con path [i]: se muestran como errores del form, sin repetidos.
    const messages = [...new Set(parsed.error.issues.map((i) => i.message))];
    return { ok: false, errors: { form: messages } };
  }

  const saved: NewImageData[] = [];
  try {
    const db = getDb();
    const product = await getProductById(productId, db);
    if (!product) return repoFailure(new RepoError('not_found'), 'addProductImages');
    if (product.images.length + files.length > IMAGES_MAX_PER_PRODUCT) {
      return repoFailure(new RepoError('too_many_images'), 'addProductImages');
    }

    for (const file of files) {
      try {
        saved.push(await saveProductImage(productId, file, product.name));
      } catch (error) {
        console.error('[products/actions] sharp falló', error);
        await deleteKeys(saved.flatMap((s) => [s.path, s.thumbPath]));
        return failure(`No pude procesar "${file.name}"`);
      }
    }

    await insertImages(productId, saved, db);
    revalidateProduct(productId, product.slug);
    return { ok: true, id: productId };
  } catch (error) {
    await deleteKeys(saved.flatMap((s) => [s.path, s.thumbPath]));
    return repoFailure(error, 'addProductImages');
  }
}

/** Borra fila + archivos (path y thumbPath). */
export async function removeProductImage(productId: string, imageId: string): Promise<ActionResult> {
  await requireSession();
  try {
    const db = getDb();
    const removed = await deleteImage(productId, imageId, db);
    if (!removed) return failure('Esa foto ya no existe.');
    await deleteKeys([removed.path, removed.thumbPath]);
    const product = await getProductById(productId, db);
    revalidateProduct(productId, product?.slug);
    return { ok: true, id: productId };
  } catch (error) {
    return repoFailure(error, 'removeProductImage');
  }
}

export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<ActionResult> {
  await requireSession();
  try {
    const db = getDb();
    await reorderImages(productId, orderedIds, db);
    const product = await getProductById(productId, db);
    revalidateProduct(productId, product?.slug);
    return { ok: true, id: productId };
  } catch (error) {
    return repoFailure(error, 'reorderProductImages');
  }
}
