import path from 'node:path';
import { getEnv } from '@/lib/env';
import { LocalStorage } from './local';
import type { Storage } from './types';

declare global {
  var __retakeStorage: Storage | undefined;
}

/** Singleton: LocalStorage(path.resolve(process.cwd(), getEnv().UPLOADS_DIR)). Punto único para cambiar a Cloudinary/Blob. */
export function getStorage(): Storage {
  if (!globalThis.__retakeStorage) {
    globalThis.__retakeStorage = new LocalStorage(
      path.resolve(/*turbopackIgnore: true*/ process.cwd(), getEnv().UPLOADS_DIR),
    );
  }
  return globalThis.__retakeStorage;
}

export type { Storage } from './types';
