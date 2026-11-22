#!/usr/bin/env node
/**
 * Befüllt data/gallery.json und data/uploads mit den Archivfotos aus
 * seed/photos (diese wurden aus der Broschüren-PDF extrahiert).
 *
 *   node ./scripts/seed.mjs [--force]
 *
 * Ohne --force wird eine bereits vorhandene Galerie nicht überschrieben.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SEED_DIR = path.join(ROOT, 'seed', 'photos');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const INDEX_FILE = path.join(DATA_DIR, 'gallery.json');

const FULL = 1800;
const THUMB = 700;

/** Fotos, die keine Aufnahme, sondern eine Texttafel/Reproduktion sind. */
const SKIP = new Set(['archiv-08.jpg']);

const force = process.argv.includes('--force');

async function main() {
  await mkdir(UPLOAD_DIR, { recursive: true });

  if (!force) {
    try {
      const existing = JSON.parse(await readFile(INDEX_FILE, 'utf8'));
      if (Array.isArray(existing.photos) && existing.photos.length > 0) {
        console.log(
          `Es sind bereits ${existing.photos.length} Fotos vorhanden – nichts zu tun. (--force zum Überschreiben)`,
        );
        return;
      }
    } catch {
      /* noch keine Galerie – weiter */
    }
  }

  const files = (await readdir(SEED_DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const photos = [];

  for (const [index, file] of files.entries()) {
    if (SKIP.has(file)) continue;

    const input = await readFile(path.join(SEED_DIR, file));
    const id = `seed${String(index + 1).padStart(3, '0')}`;

    const meta = await sharp(input).metadata();
    const fullBuf = await sharp(input)
      .rotate()
      .resize({
        width: Math.min(meta.width ?? FULL, FULL),
        height: Math.min(meta.height ?? FULL, FULL),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5 })
      .toBuffer({ resolveWithObject: true });

    const thumbBuf = await sharp(fullBuf.data)
      .resize({
        width: Math.min(fullBuf.info.width, THUMB),
        height: Math.min(fullBuf.info.height, THUMB),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 78, effort: 5 })
      .toBuffer();

    await writeFile(path.join(UPLOAD_DIR, `${id}.webp`), fullBuf.data);
    await writeFile(path.join(UPLOAD_DIR, `${id}-t.webp`), thumbBuf);

    photos.push({
      id,
      width: fullBuf.info.width,
      height: fullBuf.info.height,
      captionSl: '',
      captionDe: '',
      published: true,
      createdAt: new Date(Date.UTC(2026, 10, 22, 10, index)).toISOString(),
    });

    console.log(`+ ${file} → ${id}.webp (${fullBuf.info.width}×${fullBuf.info.height})`);
  }

  await writeFile(INDEX_FILE, JSON.stringify({ version: 1, photos }, null, 2), 'utf8');
  console.log(`\n${photos.length} Fotos in ${path.relative(ROOT, INDEX_FILE)} eingetragen.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
