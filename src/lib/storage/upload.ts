import { createId } from '@paralleldrive/cuid2';
import type { NewImageData } from '@/lib/products/constants';
import { processImage } from './images';
import { getStorage } from './index';

/** Lee el File, processImage, guarda main y thumb en storage. Keys: products/<productId>/<imageId>.webp y -thumb.webp. */
export async function saveProductImage(productId: string, file: File, alt: string): Promise<NewImageData> {
  const processed = await processImage(Buffer.from(await file.arrayBuffer()));
  const storage = getStorage();
  const imageId = createId();
  const path = `products/${productId}/${imageId}.webp`;
  const thumbPath = `products/${productId}/${imageId}-thumb.webp`;
  await storage.put(path, processed.main.data, 'image/webp');
  await storage.put(thumbPath, processed.thumb.data, 'image/webp');
  return { path, thumbPath, width: processed.main.width, height: processed.main.height, alt };
}
