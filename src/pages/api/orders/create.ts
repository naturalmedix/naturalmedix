import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getDB, json } from '../../../lib/db';

export const prerender = false;

type CartItem = { id?: unknown; qty?: unknown };

function clean(value: unknown, max = 255) {
  return String(value ?? '').trim().slice(0, max);
}

function makeOrderNumber() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const random = crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();
  return `TS-${stamp}-${random}`.slice(0, 36);
}

export const POST: APIRoute = async ({ request, url }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Solicitud inválida.' }, { status: 400 }); }

  const items = Array.isArray(body?.items) ? body.items as CartItem[] : [];
  if (!items.length) return json({ error: 'El carrito está vacío.' }, { status: 400 });

  const customer = {
    name: clean(body.customer?.name, 160),
    idNum: clean(body.customer?.idNum, 60),
    email: clean(body.customer?.email, 160),
    phone: clean(body.customer?.phone, 40),
    city: clean(body.customer?.city, 100),
    address: clean(body.customer?.address, 255),
    notes: clean(body.customer?.notes, 500),
  };
  if (!customer.name || !customer.idNum || !customer.email || !customer.phone || !customer.city || !customer.address) {
    return json({ error: 'Completa todos los datos de envío obligatorios.' }, { status: 400 });
  }

  const normalized = items.map(item => ({ id: clean(item.id, 80), qty: Math.floor(Number(item.qty)) }))
    .filter(item => item.id && item.qty > 0);
  if (!normalized.length) return json({ error: 'No hay cantidades válidas en el carrito.' }, { status: 400 });

  const db = getDB();
  const unique = new Map<string, number>();
  for (const item of normalized) unique.set(item.id, (unique.get(item.id) || 0) + item.qty);

  const productIds = [...unique.keys()];
  const placeholders = productIds.map(() => '?').join(',');
  const { results } = await db.prepare(`
    SELECT p.id, p.name, p.stock, p.active, p.minimum_order_quantity, p.line,
      COALESCE((SELECT json_group_array(json_object(
        'minimumQuantity', pp.minimum_quantity,
        'price', pp.price_cop,
        'label', COALESCE(pp.label, '')
      )) FROM product_prices pp WHERE pp.product_id = p.id AND pp.active = 1), '[]') AS price_tiers
    FROM products p WHERE p.id IN (${placeholders})
  `).bind(...productIds).all();

  const byId = new Map((results || []).map((p: any) => [String(p.id), p]));
  const PACK_SIZE = 12;
  const PACK_PRICE_COP = 130000;
  const orderItems: Array<{ id: string; name: string; qty: number; unit: number; subtotal: number; groupKey: string }> = [];
  const packGroups = new Map<string, { label: string; quantity: number }>();
  let total = 0;

  for (const [id, qty] of unique) {
    const product: any = byId.get(id);
    if (!product || !product.active) return json({ error: `El producto ${id} no está disponible.` }, { status: 400 });
    const line = String(product.line || '').trim();
    const groupKey = line ? 'line:' + line.toLocaleLowerCase('es-CO') : 'product:' + id;
    const group = packGroups.get(groupKey) || { label: line || String(product.name), quantity: 0 };
    group.quantity += qty;
    packGroups.set(groupKey, group);

    if (qty > Number(product.stock || 0)) {
      return json({ error: `${product.name}: stock insuficiente.` }, { status: 400 });
    }

    orderItems.push({ id, name: String(product.name), qty, unit: 0, subtotal: 0, groupKey });
  }

  for (const group of packGroups.values()) {
    const remainder = group.quantity % PACK_SIZE;
    if (group.quantity < PACK_SIZE) {
      return json({ error: group.label + ': el paquete mínimo es de 12 unidades; agrega ' + (PACK_SIZE - group.quantity) + ' unidades de la misma línea.' }, { status: 400 });
    }
    if (remainder !== 0) {
      return json({ error: group.label + ': la cantidad debe completar paquetes de 12. Agrega ' + (PACK_SIZE - remainder) + ' unidades o quita ' + remainder + '.' }, { status: 400 });
    }
  }

  for (const [groupKey, group] of packGroups) {
    const groupTotal = (group.quantity / PACK_SIZE) * PACK_PRICE_COP;
    total += groupTotal;
    const shares = orderItems.filter(item => item.groupKey === groupKey).map(item => {
      const numerator = PACK_PRICE_COP * item.qty;
      return { item, subtotal: Math.floor(numerator / PACK_SIZE), remainder: numerator % PACK_SIZE };
    });
    const allocated = shares.reduce((sum, share) => sum + share.subtotal, 0);
    let pesosToAllocate = groupTotal - allocated;
    shares.sort((a, b) => b.remainder - a.remainder);
    for (const share of shares) {
      if (pesosToAllocate <= 0) break;
      share.subtotal += 1;
      pesosToAllocate -= 1;
    }
    for (const share of shares) {
      share.item.subtotal = share.subtotal;
      share.item.unit = Math.round(share.subtotal / share.item.qty);
    }
  }

  const orderId = crypto.randomUUID();
  const orderNumber = makeOrderNumber();
  await db.prepare(`INSERT INTO orders (
    id, order_number, status, payment_status, total_cop,
    customer_name, customer_email, customer_phone, customer_document,
    shipping_name, shipping_address, shipping_city, shipping_country, notes
  ) VALUES (?, ?, 'PENDING', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, 'CO', ?)`)
    .bind(orderId, orderNumber, total, customer.name, customer.email, customer.phone, customer.idNum,
      customer.name, customer.address, customer.city, customer.notes).run();

  for (const item of orderItems) {
    await db.prepare(`INSERT INTO order_items (order_id, product_id, product_name, unit_price_cop, quantity, subtotal_cop)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(orderId, item.id, item.name, item.unit, item.qty, item.subtotal).run();
  }

  const privateKey = env.WOMPI_PRIVATE_KEY;
  const wompiApiBase = String(env.WOMPI_API_BASE_URL || 'https://production.wompi.co/v1').replace(/\/$/, '');
  if (!privateKey) return json({ error: 'Wompi no está configurado en el servidor.' }, { status: 500 });

  const origin = url.origin;
  const payload = {
    name: `Pedido ${orderNumber}`.slice(0, 80),
    description: `Compra NaturalMedix ${orderNumber}`.slice(0, 255),
    single_use: true,
    collect_shipping: false,
    currency: 'COP',
    amount_in_cents: total * 100,
    redirect_url: `${origin}/pago/resultado?order=${encodeURIComponent(orderId)}`,
    sku: orderNumber,
  };

  try {
    const response = await fetch(`${wompiApiBase}/payment_links`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${privateKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok || !data?.data?.id) {
      await db.prepare(`UPDATE orders SET status='PAYMENT_LINK_ERROR', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(orderId).run();
      return json({ error: data?.error?.reason || data?.error?.messages?.[0] || 'Wompi no pudo crear el link de pago.' }, { status: 502 });
    }

    const linkId = String(data.data.id);
    const paymentUrl = `https://checkout.wompi.co/l/${encodeURIComponent(linkId)}`;
    await db.prepare(`UPDATE orders SET wompi_link_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(linkId, orderId).run();
    return json({ ok: true, orderId, orderNumber, paymentUrl, total });
  } catch (error) {
    await db.prepare(`UPDATE orders SET status='PAYMENT_LINK_ERROR', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(orderId).run();
    console.error('Wompi payment link error', error);
    return json({ error: 'No se pudo conectar con Wompi.' }, { status: 502 });
  }
};
