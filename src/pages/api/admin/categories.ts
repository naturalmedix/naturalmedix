import type { APIRoute } from 'astro';
import { getDB, json, requireAdmin } from '../../../lib/db';
export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  if (!requireAdmin(request)) return json({ error: 'No autorizado' }, { status: 401 });
  const db = getDB();
  const { results } = await db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all();
  return json({ categories: results || [] });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!requireAdmin(request)) return json({ error: 'No autorizado' }, { status: 401 });
  const body = await request.json();
  if (!body?.id || !body?.name || !body?.slug) return json({ error: 'id, name y slug son obligatorios' }, { status: 400 });
  const db = getDB();
  await db.prepare(`INSERT INTO categories (id,name,slug,active,sort_order) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, slug=excluded.slug, active=excluded.active, sort_order=excluded.sort_order`).bind(String(body.id), String(body.name), String(body.slug), body.active === false ? 0 : 1, Number(body.sortOrder || 0)).run();
  return json({ ok: true });
};
