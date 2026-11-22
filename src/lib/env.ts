import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Winziger .env-Loader für den Serverbetrieb.
 *
 * Astro/Vite liest .env-Dateien nur zur Build-Zeit in `import.meta.env`.
 * Damit Passwort und Datenpfad auch im laufenden Node-Server aus der .env
 * kommen, wird sie hier einmalig in `process.env` nachgezogen. Bereits
 * gesetzte echte Umgebungsvariablen (Docker, systemd) haben Vorrang.
 */
let loaded = false;

function loadDotEnv(): void {
  if (loaded) return;
  loaded = true;

  for (const file of ['.env', '.env.local']) {
    let raw: string;
    try {
      raw = readFileSync(path.resolve(process.cwd(), file), 'utf8');
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

export function env(key: string, fallback?: string): string | undefined {
  loadDotEnv();
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}
