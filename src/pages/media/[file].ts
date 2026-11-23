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
 * `Sec-Fetch-Dest: document` (bzw., in Browsern ohne Fetch Metadata, eine
 * `Accept`-Liste mit `text/html`). Darauf antworten wir mit einem 302 auf die
 * JPEG-Fassung. Ein `<img>` schickt `Sec-Fetch-Dest: image` und bekommt
 * weiterhin WebP. So bleibt im Markup ein einziges `<img src="…webp">`, ohne
 * Link-Wrapper, ohne JavaScript, ohne zusätzliche Bild-Ebene – ein Linksklick
 * auf das Bild löst nichts aus.
 *
 * Wichtig für Caches: Die WebP-Antworten und der Redirect tragen
 * `Vary: Sec-Fetch-Dest, Accept`, der Redirect zusätzlich `Cache-Control: no-store`.
 */

const IMMUTABLE = 'public, max-age=31536000, immutable';
const VARY = 'Sec-Fetch-Dest, Accept';
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
 *
 * Erkannt wird das an `Sec-Fetch-Dest: document` (Chrome/Edge ab 76,
 * Firefox ab 90, Safari ab 16.4). Ältere Browser schicken den Header nicht;
 * dort entscheidet die Akzeptanzliste: eine Navigation fragt nach HTML, ein
 * `<img>` nach Bildern. Ohne beides (`*`/`*`, curl) bleibt es beim WebP.
 */
function wantsDocument(request: Request): boolean {
  const dest = request.headers.get('sec-fetch-dest');
  if (dest) return dest === 'document';

  const accept = request.headers.get('accept') ?? '';
  return /text\/html/i.test(accept);
}

function jpegRedirectForDocument(request: Request): Response | null {
  if (!wantsDocument(request)) return null;

  const url = new URL(request.url);
  if (!/(?:-t)?\.webp$/i.test(url.pathname)) return null;

  // Auch das Thumbnail führt auf die volle JPEG-Fassung – im neuen Tab will
  // man das große Bild, nicht die 700-px-Version.
  url.pathname = url.pathname.replace(/-t\.webp$/i, '.jpg').replace(/\.webp$/i, '.jpg');

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.pathname}${url.search}`,
      'Cache-Control': 'no-store',
      Vary: VARY,
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

    return serveFile(original, 'image/webp', request, { Vary: VARY });
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
