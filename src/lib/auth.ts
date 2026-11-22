import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AstroCookies } from 'astro';
import { DATA_DIR } from './gallery';
import { env } from './env';

export const COOKIE_NAME = 'kumst_urednik';
export const SESSION_HOURS = 12;

/** Passwort kommt aus der .env – im Dev-Betrieb gibt es einen Fallback. */
export function adminPassword(): string {
  const pw = env('ADMIN_PASSWORD');
  if (pw && pw.length > 0) return pw;
  return 'kumst30';
}

export function usesFallbackPassword(): boolean {
  return !env('ADMIN_PASSWORD');
}

let secretCache: string | null = null;

async function sessionSecret(): Promise<string> {
  if (secretCache) return secretCache;
  const fromEnv = env('ADMIN_SECRET');
  if (fromEnv && fromEnv.length >= 16) {
    secretCache = fromEnv;
    return secretCache;
  }
  const file = path.join(DATA_DIR, '.session-secret');
  try {
    const existing = (await readFile(file, 'utf8')).trim();
    if (existing.length >= 16) {
      secretCache = existing;
      return secretCache;
    }
  } catch {
    /* Datei existiert noch nicht */
  }
  const generated = randomBytes(32).toString('hex');
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(file, generated, { encoding: 'utf8', mode: 0o600 });
  secretCache = generated;
  return generated;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Passwortvergleich ohne Zeitkanal. */
export function checkPassword(input: string): boolean {
  const expected = createHmac('sha256', 'kumst-cmp').update(adminPassword()).digest();
  const given = createHmac('sha256', 'kumst-cmp').update(input ?? '').digest();
  return timingSafeEqual(expected, given);
}

export async function createSessionToken(): Promise<{ value: string; maxAge: number }> {
  const secret = await sessionSecret();
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = `v1.${expires}`;
  return { value: `${payload}.${sign(payload, secret)}`, maxAge: SESSION_HOURS * 3600 };
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [version, expires, signature] = parts;
  if (version !== 'v1') return false;
  const exp = Number(expires);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const secret = await sessionSecret();
  return safeEqual(signature, sign(`${version}.${expires}`, secret));
}

export async function isLoggedIn(cookies: AstroCookies): Promise<boolean> {
  return verifySessionToken(cookies.get(COOKIE_NAME)?.value);
}

export function setSessionCookie(
  cookies: AstroCookies,
  token: { value: string; maxAge: number },
  secure: boolean,
) {
  cookies.set(COOKIE_NAME, token.value, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: token.maxAge,
  });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

/* ---------------------------------------------------------------- Rate-Limit */
type Attempt = { count: number; first: number };
const attempts = new Map<string, Attempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

export function loginBlocked(ip: string): boolean {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() - a.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return a.count >= MAX_ATTEMPTS;
}

export function registerFailure(ip: string) {
  const a = attempts.get(ip);
  if (!a || Date.now() - a.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: Date.now() });
  } else {
    a.count += 1;
  }
}

export function clearFailures(ip: string) {
  attempts.delete(ip);
}

export function isSecureRequest(request: Request): boolean {
  const proto = request.headers.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0].trim() === 'https';
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function clientIp(request: Request, fallback: string): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return fallback;
}
