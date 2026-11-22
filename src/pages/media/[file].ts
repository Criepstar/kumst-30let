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
 *
 * Inhaltliche Aushandlung pro Request (kein Markup-Trick):
 * „Bild in neuem Tab öffnen“ ist eine Top-Level-Navigation und schickt deshalb
 * `Sec-Fetch-Dest: document`. Darauf antworten wir mit einem 302 auf die
 * JPEG-Fassung. Ein `<img>` schickt `Sec-Fetch-Dest: image` und bekommt
 * weiterhin WebP. So bleibt im Markup ein einziges `<img src="…webp">`, ohne
 * Link-Wrapper, ohne JavaScript, ohne zusätzliche Bild-Ebene.
 *
 * Wichtig für Caches: Die WebP-Antworten und der Redirect tragen
 * `Vary: Sec-Fetch-Dest`, der Redirect zusätzlich `Cache-Control: no-store`.
 */

const IMMUTABLE = 'public, max-age=31536000, immutable';
const notFound = () => new Response('Not found', { status: 404 });

async function serveFile(
  filePath: string,
  contentType: string,
  request: Request,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    return notFound();
  }

  const etag = `W/"${fileStat.size.toString(16)}-${Math.floor(fileStat.mtimeMs).toString(16)}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag, ...extraHeaders } });
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
      ...extraHeaders,
    },
  });
}

/**
 * Wird die WebP-Adresse als Dokument geöffnet (Rechtsklick → „Bild in neuem
 * Tab öffnen“, Adresse kopieren und einfügen), leiten wir auf das JPEG um.
 * Fehlt der Header (ältere Browser, curl), bleibt es beim WebP.
 */
function jpegRedirectForDocument(request: Request): Response | null {
  if (request.headers.get('sec-fetch-dest') !== 'document') return null;

  const url = new URL(request.url);
  if (!/(?:-t)?\.webp$/i.test(url.pathname)) return null;

  url.pathname = url.pathname.replace(/-t\.webp$/i, '.jpg').replace(/\.webp$/i, '.jpg');

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.pathname}${url.search}`,
      'Cache-Control': 'no-store',
      Vary: 'Sec-Fetch-Dest',
    },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const file = params.file ?? '';

  const webp = /^([a-z0-9]{6,24})(-t)?\.webp$/i.exec(file);
  if (webp) {
    const original = mediaFilePath(webp[1], webp[2] ? 'thumb' : 'full');
    if (!original) return notFound();

    const redirect = jpegRedirectForDocument(request);
    if (redirect) {
      // Nur umleiten, wenn das Foto existiert – sonst bleibt es beim 404.
      try {
        await stat(original);
      } catch {
        return notFound();
      }
      return redirect;
    }

    return serveFile(original, 'image/webp', request, { Vary: 'Sec-Fetch-Dest' });
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
