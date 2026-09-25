import type { APIRoute } from 'astro';
import { getDB, json, requireAdmin } from '../../../lib/db';

export const prerender = false;

async function parseBody(request: Request) {
  try { return await request.json(); } catch { return null; }
}

function cleanTiers(input: unknown) {
  if (!Array.isArray(input) || input.length === 0) {
    return [{ minimumQuantity: 1, price: 0, label: 'Detal', active: true }];
  }

  const tiers = input.map((tier: any) => ({
    minimumQuantity: Math.max(1, Math.floor(Number(tier?.minimumQuantity || 0))),
    price: Math.max(0, Math.floor(Number(tier?.price || 0))),
    label: String(tier?.label || ''),
    active: tier?.active !== false,
  })).sort((a, b) => a.minimumQuantity - b.minimumQuantity);

  const seen = new Set<number>();
  for (const tier of tiers) {
    if (seen.has(tier.minimumQuantity)) throw new Error(`Hay niveles de precio repetidos: desde ${tier.minimumQuantity}.`);
    seen.add(tier.minimumQuantity);
  }
  if (tiers[0].minimumQuantity !== 1) throw new Error('El primer nivel de precio debe comenzar desde 1 unidad.');
  return tiers;
}

function normalizeCategories(input: unknown) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map(String).map((x) => x.trim()).filter(Boolean))];
}

export const GET: APIRoute = async ({ request }) => {
  if (!requireAdmin(request)) return json({ error: 'No autorizado' }, { status: 401 });
  const db = getDB();
  const { results } = await db.prepare(`
    SELECT
      p.*,
      COALESCE((SELECT json_group_array(json_object(
        'minimumQuantity', pp.minimum_quantity,
        'price', pp.price_cop,
        'label', COALESCE(pp.label, ''),
        'active', pp.active
      )) FROM product_prices pp WHERE pp.product_id = p.id ORDER BY pp.minimum_quantity), '[]') AS price_tiers,
      COALESCE((SELECT json_group_array(json_object(
        'id', c.id, 'name', c.name, 'slug', c.slug
      )) FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id), '[]') AS categories
    FROM products p
    ORDER BY p.sort_order ASC, p.name ASC
  `).all();

  return json({
    products: (results || []).map((p: any) => ({
      ...p,
      priceTiers: JSON.parse(p.price_tiers || '[]'),
      categories: JSON.parse(p.categories || '[]'),
      badges: JSON.parse(p.badges_json || '[]'),
      minimumOrderQuantity: p.minimum_order_quantity,
      originalPrice: p.original_price,
      netContent: p.net_content,
      netWeight: p.net_weight_g,
      videoUrl: p.video_url,
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
      sortOrder: p.sort_order,
      active: Boolean(p.active),
    })),
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!requireAdmin(request)) return json({ error: 'No autorizado' }, { status: 401 });
  const body = await parseBody(request);
  if (!body?.slug || !body?.name) return json({ error: 'slug y name son obligatorios' }, { status: 400 });

  let prices;
  try {
    prices = cleanTiers(body.priceTiers);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Niveles de precio inválidos.' }, { status: 400 });
  }

  const db = getDB();
  const id = String(body.id || crypto.randomUUID().replaceAll('-', '').slice(0, 12));
  const categories = normalizeCategories(body.categoryIds);
  const badges = Array.isArray(body.badges) ? body.badges.map(String).map((x) => x.trim()).filter(Boolean) : [];

  try {
    await db.prepare(`INSERT INTO products (
      id, slug, name, description, original_price, pum, net_content, net_weight_g, stock, barcode, invima, brand, laboratory, line, video_url, badges_json, active, sort_order, seo_title, seo_description, minimum_order_quantity, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      slug=excluded.slug, name=excluded.name, description=excluded.description, original_price=excluded.original_price, pum=excluded.pum, net_content=excluded.net_content, net_weight_g=excluded.net_weight_g, stock=excluded.stock, barcode=excluded.barcode, invima=excluded.invima, brand=excluded.brand, laboratory=excluded.laboratory, line=excluded.line, video_url=excluded.video_url, badges_json=excluded.badges_json, active=excluded.active, sort_order=excluded.sort_order, seo_title=excluded.seo_title, seo_description=excluded.seo_description, minimum_order_quantity=excluded.minimum_order_quantity, updated_at=CURRENT_TIMESTAMP
    `).bind(
      id,
      String(body.slug).trim(),
      String(body.name).trim(),
      String(body.description || ''),
      Math.max(0, Math.floor(Number(body.originalPrice || 0))),
      String(body.pum || ''),
      String(body.netContent || ''),
      Math.max(0, Number(body.netWeight || 0)),
      Math.max(0, Math.floor(Number(body.stock || 0))),
      body.barcode ? String(body.barcode).trim() : null,
      String(body.invima || ''),
      String(body.brand || ''),
      String(body.laboratory || ''),
      String(body.line || ''),
      String(body.videoUrl || ''),
      JSON.stringify(badges),
      body.active === false ? 0 : 1,
      Math.floor(Number(body.sortOrder || 0)),
      String(body.seoTitle || ''),
      String(body.seoDescription || ''),
      Math.max(1, Math.floor(Number(body.minimumOrderQuantity || 1))),
    ).run();

    await db.prepare('DELETE FROM product_prices WHERE product_id = ?').bind(id).run();
    for (const tier of prices) {
      await db.prepare('INSERT INTO product_prices (product_id, minimum_quantity, price_cop, label, active) VALUES (?, ?, ?, ?, ?)').bind(
        id, tier.minimumQuantity, tier.price, tier.label, tier.active ? 1 : 0,
      ).run();
    }

    await db.prepare('DELETE FROM product_categories WHERE product_id = ?').bind(id).run();
    if (categories.length) {
      const valid = await db.prepare(`SELECT id FROM categories WHERE id IN (${categories.map(() => '?').join(',')})`).bind(...categories).all();
      for (const row of (valid.results || []) as any[]) {
        await db.prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)').bind(id, row.id).run();
      }
    }

    return json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar el producto.';
    return json({ error: message }, { status: 400 });
  }
};
