import { getStorage } from '@/lib/storage';
import { isValidStorageKey } from '@/lib/storage/types';

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;
  const key = path.join('/');
  if (!isValidStorageKey(key)) return new Response('Bad request', { status: 400 });

  const obj = await getStorage().get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(obj.body), {
    headers: {
      'Content-Type': obj.contentType,
      'Content-Length': String(obj.body.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
