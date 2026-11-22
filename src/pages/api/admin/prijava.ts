import type { APIRoute } from 'astro';
import {
  checkPassword,
  clearFailures,
  clientIp,
  createSessionToken,
  isSecureRequest,
  loginBlocked,
  registerFailure,
  setSessionCookie,
} from '../../../lib/auth';
import { htmlMessage, sameOrigin } from '../../../lib/http';
import { u } from '../../../lib/site';

export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress }) => {
  if (!sameOrigin(request)) {
    return htmlMessage('Napačen izvor zahtevka. / Ungültige Herkunft.', 'error', 403);
  }

  const isHtmx = request.headers.get('hx-request') === 'true';
  const form = await request.formData();
  const password = String(form.get('geslo') ?? '');
  const weiterRaw = String(form.get('weiter') ?? '');
  const weiter = weiterRaw.startsWith(u('/admin')) ? weiterRaw : u('/admin');
  const ip = clientIp(request, clientAddress ?? 'lokal');

  if (loginBlocked(ip)) {
    return htmlMessage(
      'Preveč poskusov. Poskusite znova čez 15 minut. / Zu viele Versuche – bitte in 15 Minuten erneut.',
      'error',
      429,
    );
  }

  if (!checkPassword(password)) {
    registerFailure(ip);
    return htmlMessage('Napačno geslo. / Falsches Passwort.', 'error', 401);
  }

  clearFailures(ip);
  const token = await createSessionToken();
  setSessionCookie(cookies, token, isSecureRequest(request));

  if (isHtmx) {
    return new Response(null, { status: 200, headers: { 'HX-Redirect': weiter } });
  }
  return redirect(weiter, 303);
};
