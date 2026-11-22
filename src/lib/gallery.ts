import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { SITE } from './site';
import { env } from './env';

export const DATA_DIR = path.resolve(env('DATA_DIR', './data')!);
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const INDEX_FILE = path.join(DATA_DIR, 'gallery.json');

export type Photo = {
  id: string;
  /** Breite/Höhe des gespeicherten (nicht des hochgeladenen) Bildes */
  width: number;
  height: number;
  captionSl: string;
  captionDe: string;
  published: boolean;
  createdAt: string;
};

type GalleryFile = { version: 1; photos: Photo[] };

let cache: GalleryFile | null = null;

async function ensureDirs() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function readGallery(): Promise<GalleryFile> {
  if (cache) return cache;
  await ensureDirs();
  try {
    const raw = await readFile(INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw) as GalleryFile;
    if (!Array.isArray(parsed.photos)) parsed.photos = [];
    cache = { version: 1, photos: parsed.photos };
  } catch {
    cache = { version: 1, photos: [] };
  }
  return cache;
}

async function writeGallery(g: GalleryFile) {
  await ensureDirs();
  const tmp = `${INDEX_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(g, null, 2), 'utf8');
  await rename(tmp, INDEX_FILE);
  cache = g;
}

export async function listPhotos(onlyPublished = true): Promise<Photo[]> {
  const g = await readGallery();
  return onlyPublished ? g.photos.filter((p) => p.published) : g.photos;
}

export async function getPhoto(id: string): Promise<Photo | undefined> {
  const g = await readGallery();
  return g.photos.find((p) => p.id === id);
}

export async function getNeighbours(id: string) {
  const photos = await listPhotos(true);
  const i = photos.findIndex((p) => p.id === id);
  if (i < 0) return { prev: undefined, next: undefined, index: -1, total: photos.length };
  return {
    prev: photos[(i - 1 + photos.length) % photos.length],
    next: photos[(i + 1) % photos.length],
    index: i,
    total: photos.length,
  };
}

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff', 'image/heic']);

export type UploadResult = { photo: Photo } | { error: string };

/** Speichert ein hochgeladenes Bild als WebP in zwei Auflösungen. */
export async function addPhoto(
  input: { buffer: Uint8Array; type?: string; name?: string; captionSl?: string; captionDe?: string },
): Promise<UploadResult> {
  if (input.type && !ALLOWED.has(input.type)) {
    return { error: `Dateityp ${input.type} wird nicht unterstützt.` };
  }
  await ensureDirs();
  const id = randomUUID().slice(0, 8) + Date.now().toString(36).slice(-4);

  let full: Buffer;
  let thumb: Buffer;
  let width = 0;
  let height = 0;
  try {
    const pipeline = sharp(input.buffer, { failOn: 'none' }).rotate();
    const meta = await pipeline.metadata();
    if (!meta.width || !meta.height) return { error: 'Bild konnte nicht gelesen werden.' };
    if (Math.min(meta.width, meta.height) < 300) {
      return { error: 'Das Bild ist zu klein (min. 300 px an der kurzen Kante).' };
    }
    const target = SITE.gallery.full;
    const resized = pipeline.resize({
      width: Math.min(meta.width, target),
      height: Math.min(meta.height, target),
      fit: 'inside',
      withoutEnlargement: true,
    });
    const buf = await resized.webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true });
    full = buf.data;
    width = buf.info.width;
    height = buf.info.height;
    thumb = await sharp(full)
      .resize({
        width: Math.min(width, SITE.gallery.thumb),
        height: Math.min(height, SITE.gallery.thumb),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 78, effort: 4 })
      .toBuffer();
  } catch {
    return { error: 'Bild konnte nicht verarbeitet werden.' };
  }

  await writeFile(path.join(UPLOAD_DIR, `${id}.webp`), full);
  await writeFile(path.join(UPLOAD_DIR, `${id}-t.webp`), thumb);

  const photo: Photo = {
    id,
    width,
    height,
    captionSl: (input.captionSl || '').trim(),
    captionDe: (input.captionDe || '').trim(),
    published: true,
    createdAt: new Date().toISOString(),
  };

  const g = await readGallery();
  // Neue Fotos hängen hinten an – die Reihenfolge im Grid ist die Reihenfolge in der Galerie
  const next: GalleryFile = { version: 1, photos: [...g.photos, photo] };
  await writeGallery(next);
  return { photo };
}

export async function updatePhoto(
  id: string,
  patch: Partial<Pick<Photo, 'captionSl' | 'captionDe' | 'published'>>,
): Promise<boolean> {
  const g = await readGallery();
  const i = g.photos.findIndex((p) => p.id === id);
  if (i < 0) return false;
  const merged: Photo = { ...g.photos[i], ...patch };
  if (typeof merged.captionSl === 'string') merged.captionSl = merged.captionSl.slice(0, 600).trim();
  if (typeof merged.captionDe === 'string') merged.captionDe = merged.captionDe.slice(0, 600).trim();
  const photos = [...g.photos];
  photos[i] = merged;
  await writeGallery({ version: 1, photos });
  return true;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const g = await readGallery();
  const photos = g.photos.filter((p) => p.id !== id);
  if (photos.length === g.photos.length) return false;
  await writeGallery({ version: 1, photos });
  for (const suffix of ['.webp', '-t.webp']) {
    await unlink(path.join(UPLOAD_DIR, `${id}${suffix}`)).catch(() => {});
  }
  return true;
}

export async function movePhoto(id: string, direction: -1 | 1): Promise<boolean> {
  const g = await readGallery();
  const photos = [...g.photos];
  const i = photos.findIndex((p) => p.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= photos.length) return false;
  [photos[i], photos[j]] = [photos[j], photos[i]];
  await writeGallery({ version: 1, photos });
  return true;
}

export function mediaFilePath(id: string, variant: 'full' | 'thumb'): string | null {
  if (!/^[a-z0-9]{6,24}$/i.test(id)) return null;
  return path.join(UPLOAD_DIR, variant === 'thumb' ? `${id}-t.webp` : `${id}.webp`);
}
