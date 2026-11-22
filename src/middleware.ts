import { defineMiddleware } from 'astro:middleware';
import { isLoggedIn } from './lib/auth';
import { u } from './lib/site';

const LOGIN_PAGE = u('/admin/prijava');
const LOGIN_API = u('/api/admin/prijava');

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const path = url.pathname.replace(/\/+$/, '') || '/';

  const isAdminArea = path === u('/admin') || path.startsWith(u('/admin/'));
  const isAdminApi = path === u('/api/admin') || path.startsWith(u('/api/admin/'));

  if (!isAdminArea && !isAdminApi) {
    return next();
  }

  const loggedIn = await isLoggedIn(cookies);
  context.locals.loggedIn = loggedIn;

  const isPublic = path === LOGIN_PAGE || path === LOGIN_API;
  if (isPublic) return next();

  if (!loggedIn) {
    if (isAdminApi) {
      return new Response('Nicht angemeldet', {
        status: 401,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    return redirect(`${LOGIN_PAGE}?weiter=${encodeURIComponent(path)}`, 302);
  }

  const response = await next();
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
