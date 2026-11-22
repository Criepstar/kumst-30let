import type { APIRoute } from 'astro';
import { readFile, stat } from 'node:fs/promises';
import { mediaFilePath } from '../../lib/gallery';

/**
 * Liefert die hochgeladenen Fotos aus data/uploads aus.
 * Sie liegen bewusst nicht in /public, damit Uploads ein Deployment überleben.
 */
export const GET: APIRoute = async ({ params, request }) => {
  const file = params.file ?? '';
  const match = /^([a-z0-9]{6,24})(-t)?\.webp$/i.exec(file);
  if (!match) {
    return new Response('Not found', { status: 404 });
  }

  const id = match[1];
  const variant = match[2] ? 'thumb' : 'full';
  const filePath = mediaFilePath(id, variant);
  if (!filePath) return new Response('Not found', { status: 404 });

  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const etag = `W/"${fileStat.size.toString(16)}-${Math.floor(fileStat.mtimeMs).toString(16)}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  const body = await readFile(filePath);

  return new Response(new Uint8Array(body), {
    status: 200,
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(fileStat.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: etag,
      'Last-Modified': new Date(fileStat.mtimeMs).toUTCString(),
    },
  });
};
