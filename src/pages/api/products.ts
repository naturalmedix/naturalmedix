import type { APIRoute } from 'astro';
import { getDB, json } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const db = getDB();
  const { results } = await db.prepare(`
    SELECT p.*, COALESCE((
      SELECT json_group_array(json_object(
        'minimumQuantity', pp.minimum_quantity,
        'price', pp.price_cop,
        'label', COALESCE(pp.label, '')
      )) FROM product_prices pp
      WHERE pp.product_id = p.id AND pp.active = 1
    ), '[]') AS price_tiers
    FROM products p
    WHERE p.active = 1
    ORDER BY p.sort_order ASC, p.name ASC
  `).all();

  const products = (results || []).map((p: any) => ({
    ...p,
    minimumOrderQuantity: p.minimum_order_quantity,
    originalPrice: p.original_price,
    netWeight: p.net_weight_g,
    videoUrl: p.video_url,
    priceTiers: JSON.parse(p.price_tiers || '[]'),
    badges: JSON.parse(p.badges_json || '[]'),
    images: JSON.parse(p.images_json || '[]'),
  }));

  return json({ products });
};

