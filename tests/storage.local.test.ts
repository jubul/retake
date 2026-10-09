import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LocalStorage } from '@/lib/storage/local';
import { contentTypeFor, isValidStorageKey } from '@/lib/storage/types';

let tmp: string;
let root: string;
let storage: LocalStorage;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'retake-storage-'));
  root = path.join(tmp, 'root');
  fs.mkdirSync(root);
  storage = new LocalStorage(root);
});

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('LocalStorage', () => {
  it('put + get devuelve el contenido y el content-type', async () => {
    const data = Buffer.from('hola');
    await storage.put('products/p1/i1.webp', data, 'image/webp');
    const obj = await storage.get('products/p1/i1.webp');
    expect(obj?.body.equals(data)).toBe(true);
    expect(obj?.contentType).toBe('image/webp');
  });

  it('put sobrescribe', async () => {
    await storage.put('a/b.png', Buffer.from('1'), 'image/png');
    await storage.put('a/b.png', Buffer.from('2'), 'image/png');
    expect((await storage.get('a/b.png'))?.body.toString()).toBe('2');
  });

  it('get de una key inexistente → null', async () => {
    expect(await storage.get('nada/nada.webp')).toBeNull();
  });

  it('delete borra y no falla si no existe', async () => {
    await storage.put('d/x.webp', Buffer.from('x'), 'image/webp');
    await storage.delete('d/x.webp');
    expect(await storage.get('d/x.webp')).toBeNull();
    await expect(storage.delete('d/x.webp')).resolves.toBeUndefined();
  });

  it("get('../x.webp') y get('/etc/passwd') → null sin tocar fuera del root", async () => {
    fs.writeFileSync(path.join(tmp, 'x.webp'), 'secreto');
    expect(await storage.get('../x.webp')).toBeNull();
    expect(await storage.get('/etc/passwd')).toBeNull();
  });

  it('delete con traversal no borra fuera del root', async () => {
    await storage.delete('../x.webp');
    expect(fs.existsSync(path.join(tmp, 'x.webp'))).toBe(true);
  });

  it('put con key inválida lanza y no escribe', async () => {
    await expect(storage.put('../y.webp', Buffer.from('y'), 'image/webp')).rejects.toThrow();
    expect(fs.existsSync(path.join(tmp, 'y.webp'))).toBe(false);
  });

  it('publicUrl', () => {
    expect(storage.publicUrl('products/a/b.webp')).toBe('/uploads/products/a/b.webp');
  });
});

describe('isValidStorageKey / contentTypeFor', () => {
  it.each(['a.webp', 'products/abc123/x_y-z.webp', 'a/b/c.jpg', 'a.jpeg', 'a.png'])('válida: %s', (key) => {
    expect(isValidStorageKey(key)).toBe(true);
  });

  it.each([
    '',
    '../x.webp',
    'a/../b.webp',
    '/a.webp',
    'a//b.webp',
    'A.webp',
    'a.gif',
    'a.webp/',
    'a b.webp',
    'a/.webp',
    'a\\b.webp',
  ])('inválida: %j', (key) => {
    expect(isValidStorageKey(key)).toBe(false);
  });

  it('contentTypeFor por extensión', () => {
    expect(contentTypeFor('a.webp')).toBe('image/webp');
    expect(contentTypeFor('a.jpg')).toBe('image/jpeg');
    expect(contentTypeFor('a.jpeg')).toBe('image/jpeg');
    expect(contentTypeFor('a.png')).toBe('image/png');
  });
});
