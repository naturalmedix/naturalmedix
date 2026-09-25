import { env } from 'cloudflare:workers';

export function getDB() {
  if (!env.DB) {
    throw new Error('D1 no está configurada. Define el binding DB en Cloudflare.');
  }
  return env.DB;
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });
}

export function requireAdmin(request: Request) {
  const expected = env.ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get('authorization') || '';
  return header === `Bearer ${expected}`;
}
