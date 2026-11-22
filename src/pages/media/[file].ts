import type { APIRoute } from 'astro';
import { readFile, rename, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { jpegFilePath, mediaFilePath } from '../../lib/gallery';

/**
 * Liefert die hochgeladenen Fotos aus data/uploads aus.
 * Sie liegen bewusst nicht in /public, damit Uploads ein Deployment überleben.
 *
 * Zwei Formate:
 *  - /media/<id>.webp und /media/<id>-t.webp – was die Seite selbst einbindet (klein, schnell)
 *  - /media/<id>.jpg – für „Bild in neuem Tab öffnen“ und Rechtsklick-Speichern;
 *    wird beim ersten Aufruf einmalig aus dem WebP erzeugt und bleibt liegen.
 */

const IMMUTABLE = 'public, max-age=31536000, immutable';
const notFound = () => new Response('Not found', { status: 404 });

async function serveFile(filePath: string, contentType: string, request: Request): Promise<Response> {
  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    return notFound();
  }

  const etag = `W/"${fileStat.size.toString(16)}-${Math.floor(fileStat.mtimeMs).toString(16)}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  const body = await readFile(filePath);

  return new Response(new Uint8Array(body), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(fileStat.size),
      'Cache-Control': IMMUTABLE,
      ETag: etag,
      'Last-Modified': new Date(fileStat.mtimeMs).toUTCString(),
    },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const file = params.file ?? '';

  const webp = /^([a-z0-9]{6,24})(-t)?\.webp$/i.exec(file);
  if (webp) {
    const original = mediaFilePath(webp[1], webp[2] ? 'thumb' : 'full');
    if (!original) return notFound();
    return serveFile(original, 'image/webp', request);
  }

  const jpg = /^([a-z0-9]{6,24})\.jpe?g$/i.exec(file);
  if (jpg) {
    const target = jpegFilePath(jpg[1]);
    if (!target) return notFound();

    try {
      await stat(target);
    } catch {
      const source = mediaFilePath(jpg[1], 'full');
      if (!source) return notFound();
      try {
        await stat(source);
      } catch {
        return notFound();
      }
      const tmp = `${target}.${process.pid}-${Date.now()}.tmp`;
      await sharp(source).jpeg({ quality: 84, mozjpeg: true }).toFile(tmp);
      await rename(tmp, target);
    }

    return serveFile(target, 'image/jpeg', request);
  }

  return notFound();
};
