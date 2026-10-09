import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { contentTypeFor, isValidStorageKey, type Storage, type StoredObject } from './types';

function errCode(err: unknown): string | undefined {
  return (err as NodeJS.ErrnoException).code;
}

export class LocalStorage implements Storage {
  private readonly root: string;

  /** root absoluto; el default (UPLOADS_DIR) lo resuelve index.ts, no acá. */
  constructor(root: string) {
    this.root = path.resolve(root);
  }

  /** Resuelve la key dentro de root; null si es inválida o escapa del root (anti path traversal). */
  private resolveKey(key: string): string | null {
    if (!isValidStorageKey(key)) return null;
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) return null;
    return full;
  }

  async put(key: string, data: Buffer, contentType: string): Promise<void> {
    void contentType; // el tipo se deriva de la extensión al leer
    const full = this.resolveKey(key);
    if (!full) throw new Error(`Storage key inválida: ${key}`);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  }

  async get(key: string): Promise<StoredObject | null> {
    const full = this.resolveKey(key);
    if (!full) return null;
    try {
      const body = await readFile(full);
      return { body, contentType: contentTypeFor(key) };
    } catch (err) {
      if (errCode(err) === 'ENOENT' || errCode(err) === 'EISDIR') return null;
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    const full = this.resolveKey(key);
    if (!full) return;
    try {
      await unlink(full);
    } catch (err) {
      if (errCode(err) !== 'ENOENT') throw err;
    }
  }

  publicUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
