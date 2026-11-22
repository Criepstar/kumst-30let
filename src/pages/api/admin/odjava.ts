import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth';
import { sameOrigin } from '../../../lib/http';
import { u } from '../../../lib/site';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!sameOrigin(request)) {
    return new Response('Ungültige Herkunft', { status: 403 });
  }
  clearSessionCookie(cookies);

  if (request.headers.get('hx-request') === 'true') {
    return new Response(null, { status: 200, headers: { 'HX-Redirect': u('/admin/prijava') } });
  }
  return redirect(u('/admin/prijava'), 303);
};
