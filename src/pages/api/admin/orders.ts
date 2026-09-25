import type { APIRoute } from 'astro';
import { getDB, json, requireAdmin } from '../../../lib/db';
export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  if (!requireAdmin(request)) return json({ error: 'No autorizado' }, { status: 401 });
  const db = getDB();
  const { results } = await db.prepare(`SELECT id, order_number, status, payment_status, total_cop, customer_name, customer_email, customer_phone, shipping_city, wompi_reference, wompi_transaction_id, created_at FROM orders ORDER BY created_at DESC LIMIT 100`).all();
  return json({ orders: results || [] });
};
