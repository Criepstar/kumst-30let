/** Kleine Helfer für die HTMX-Endpunkte. */

export function htmlMessage(text: string, tone: 'error' | 'ok' = 'error', status = 200): Response {
  const classes =
    tone === 'error'
      ? 'border-wine/50 bg-wine/10 text-wine'
      : 'border-sage/60 bg-sage/10 text-sage-deep';
  return new Response(`<p class="border px-3 py-2 text-[0.875rem] ${classes}">${text}</p>`, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export function noContent(trigger?: string, status = 204): Response {
  const headers: Record<string, string> = {};
  if (trigger) headers['HX-Trigger'] = trigger;
  return new Response(null, { status, headers });
}

/** Einfache Absicherung gegen fremde Origins (zusätzlich zu SameSite=Lax). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost?.split(',')[0].trim() || request.headers.get('host') || requestUrl.host;
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
