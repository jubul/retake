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

export function isValidStorageKey(key: string): boolean {
  return STORAGE_KEY_RE.test(key);
}

const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

/** Content-Type por extensión. */
export function contentTypeFor(key: string): string {
  const ext = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
  return CONTENT_TYPES[ext] ?? 'application/octet-stream';
}
