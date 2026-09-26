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
  const orderItems: Array<{ id: string; name: string; qty: number; unit: number; subtotal: number }> = [];
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

    const tiers = JSON.parse(product.price_tiers || '[]') as Array<{ minimumQuantity: number; price: number }>;
    const applicable = tiers.filter(t => Number(t.minimumQuantity) <= qty && Number(t.price) >= 0)
      .sort((a, b) => Number(b.minimumQuantity) - Number(a.minimumQuantity))[0];
    if (!applicable) return json({ error: `${product.name}: no tiene precio configurado.` }, { status: 400 });

    const unit = Math.floor(Number(applicable.price));
    const subtotal = unit * qty;
    total += subtotal;
    orderItems.push({ id, name: String(product.name), qty, unit, subtotal });
  }

  for (const group of packGroups.values()) {
    const remainder = group.quantity % 12;
    if (group.quantity < 12) {
      return json({ error: group.label + ': el paquete mínimo es de 12 unidades; agrega ' + (12 - group.quantity) + ' unidades de la misma línea.' }, { status: 400 });
    }
    if (remainder !== 0) {
      return json({ error: group.label + ': la cantidad debe completar paquetes de 12. Agrega ' + (12 - remainder) + ' unidades o quita ' + remainder + '.' }, { status: 400 });
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
