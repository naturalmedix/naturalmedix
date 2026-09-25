import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getDB } from '../../../lib/db';

export const prerender = false;

function getPath(obj: any, path: string) {
  return path.split('.').reduce((value, key) => value == null ? undefined : value[key], obj);
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function wompiResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const secret = env.WOMPI_EVENTS_SECRET;
    if (!secret) return wompiResponse({ ok: false, error: 'Webhook no configurado.' }, 500);

    let event: any;
    try { event = await request.json(); }
    catch { return wompiResponse({ ok: false, error: 'JSON inválido.' }, 400); }

    console.log('[WOMPI WEBHOOK] Evento recibido:', String(event?.event || 'unknown'));

    if (event?.event !== 'transaction.updated' || !event?.data?.transaction) {
      return wompiResponse({ ok: true, ignored: true });
    }

    const properties = Array.isArray(event?.signature?.properties) ? event.signature.properties : [];
    const timestamp = event?.timestamp;
    if (!properties.length || timestamp == null) return wompiResponse({ ok: false, error: 'Firma incompleta.' }, 401);

    const values = properties.map((property: string) => String(getPath(event.data, property) ?? ''));
    const checksum = await sha256Hex(`${values.join('')}${timestamp}${secret}`);
    const provided = String(request.headers.get('X-Event-Checksum') || event?.signature?.checksum || '').toLowerCase();
    if (!provided || !safeEqual(checksum.toLowerCase(), provided)) return wompiResponse({ ok: false, error: 'Firma inválida.' }, 401);

    const tx = event.data.transaction;
    const linkId = tx.payment_link_id || null;
    const reference = tx.reference || null;
    const transactionId = tx.id || null;
    const status = String(tx.status || '');
    const db = getDB();

    let order: any = null;
    if (linkId) order = await db.prepare(`SELECT * FROM orders WHERE wompi_link_id=? LIMIT 1`).bind(linkId).first();
    if (!order && reference) order = await db.prepare(`SELECT * FROM orders WHERE wompi_reference=? LIMIT 1`).bind(reference).first();
    if (!order) return wompiResponse({ ok: true, ignored: true });

    if (status === 'APPROVED') {
      if (order.payment_status === 'APPROVED') return wompiResponse({ ok: true, duplicate: true });

      const items: any = await db.prepare(`SELECT product_id, quantity FROM order_items WHERE order_id=?`).bind(order.id).all();
      const updates = (items.results || []).map((item: any) => db.prepare(`UPDATE products SET stock=stock-? WHERE id=? AND stock>=?`).bind(Number(item.quantity), String(item.product_id), Number(item.quantity)));
      const results = updates.length ? await db.batch(updates) : [];
      const stockOk = results.every((result: any) => Number(result?.meta?.changes ?? 0) === 1);

      if (!stockOk) {
        await db.prepare(`UPDATE orders SET status='STOCK_ERROR', payment_status='APPROVED', wompi_reference=?, wompi_transaction_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(reference, transactionId, order.id).run();
        return wompiResponse({ ok: true, stockError: true });
      }

      await db.prepare(`UPDATE orders SET status='PAID', payment_status='APPROVED', wompi_reference=?, wompi_transaction_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(reference, transactionId, order.id).run();
      return wompiResponse({ ok: true, status: 'PAID' });
    }

    if (['DECLINED', 'ERROR', 'VOIDED'].includes(status)) {
      await db.prepare(`UPDATE orders SET status=?, payment_status=?, wompi_reference=?, wompi_transaction_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status!='APPROVED'`).bind(status, status, reference, transactionId, order.id).run();
      return wompiResponse({ ok: true, status });
    }

    await db.prepare(`UPDATE orders SET status='PENDING', payment_status='PENDING', wompi_reference=?, wompi_transaction_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status!='APPROVED'`).bind(reference, transactionId, order.id).run();
    return wompiResponse({ ok: true, status: 'PENDING' });
  } catch (error) {
    console.error('[WOMPI WEBHOOK] Error interno:', error);
    return wompiResponse({ ok: false, error: 'Error interno procesando el evento.' }, 500);
  }
};
