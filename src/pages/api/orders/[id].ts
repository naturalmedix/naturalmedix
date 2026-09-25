import type { APIRoute } from 'astro';
import { getDB, json } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = String(params.id || '');
  if (!id) return json({ error: 'Pedido inválido.' }, { status: 400 });
  const db = getDB();
  const order: any = await db.prepare(`SELECT id, order_number, status, payment_status, total_cop, wompi_reference, wompi_transaction_id, created_at, updated_at FROM orders WHERE id=?`).bind(id).first();
  if (!order) return json({ error: 'Pedido no encontrado.' }, { status: 404 });
  return json({ order });
};
