/**
 * Zentrale Website-Angaben. Alles, was man beim Umzug auf einen anderen
 * Server anpassen müsste, steht hier oder in der .env.
 */

import { env } from './env';

const rawBase = import.meta.env.BASE_URL || '/';
export const BASE = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');

/** Interne URL bauen – berücksichtigt ein Unterverzeichnis (BASE_PATH). */
export function u(path: string): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return BASE + (path.startsWith('/') ? path : `/${path}`);
}

export const SITE = {
  name: 'KUMST',
  claimSl: 'Kulturni most',
  claimDe: 'Kulturbrücke',
  title: '30 let / 30 Jahre KUMST',
  subtitleSl: 'Kulturni dom KUMST, Žitara vas',
  subtitleDe: 'Kulturhaus KUMST, Sittersdorf',
  url: env('SITE_URL', 'https://www.trta.at/30-let-kumst')!,
  brochure: {
    file: '/download/KUMST-30-let-30-Jahre.pdf',
    nameSl: 'Brošura 30 let KUMST',
    nameDe: 'Broschüre 30 Jahre KUMST',
    sizeLabel: 'PDF · 5,7 MB · 2 strani / 2 Seiten',
  },
  org: {
    nameSl: 'Slovensko prosvetno društvo Trta',
    nameDe: 'Slowenischer Kulturverein Trta',
    street: 'Žitara vas / Sittersdorf 3',
    city: '9133 Žitara vas / Sittersdorf',
    country: 'Avstrija / Österreich',
    mail: 'info@trta.at',
  },
  gallery: {
    /** maximale Kantenlänge, in der Fotos gespeichert werden */
    full: 1800,
    thumb: 700,
  },
} as const;

/** Fotos werden über diese Route ausgeliefert (nicht aus /public, damit Uploads Deployments überleben). */
export function mediaUrl(id: string, variant: 'full' | 'thumb' = 'full'): string {
  return u(`/media/${id}${variant === 'thumb' ? '-t' : ''}.webp`);
}

/**
 * Adresse der JPEG-Fassung – wird bei Bedarf serverseitig erzeugt.
 * Damit liefert „in neuem Tab öffnen“ ein echtes .jpg statt eines .webp.
 */
export function photoFileUrl(id: string): string {
  return u(`/media/${id}.jpg`);
}
