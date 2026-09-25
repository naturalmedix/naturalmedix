-- Catálogo corregido de ORIGEN•plus.
-- Los productos nuevos quedan INACTIVOS hasta completar precios, stock y multimedia.

INSERT OR IGNORE INTO categories (id, name, slug, active, sort_order)
VALUES
  ('bebidas', 'Bebidas', 'bebidas', 1, 1),
  ('capsulas-comprimidos', 'Cápsulas y comprimidos', 'capsulas-comprimidos', 1, 2),
  ('polvos-preparados', 'Polvos y preparados', 'polvos-preparados', 1, 3);

INSERT OR IGNORE INTO products (
  id, slug, name, description, original_price, pum, net_content, net_weight_g, stock,
  invima, brand, laboratory, line, video_url, badges_json, active, sort_order,
  seo_title, seo_description, minimum_order_quantity
) VALUES
(
  'r13_330ml', 'r-13-330ml', 'R-13 — 330 mL',
  '', 0, '', '330 mL', NULL, 0,
  'RSA-0033307-2024', '', '', 'R-13 Full-3', '', '[]', 0, 30,
  'R-13 — 330 mL | ORIGEN•plus', 'R-13 Full-3 de 330 mL · ORIGEN•plus', 1
),
(
  'redumex_30_capsulas', 'redumex-30-capsulas', 'REDUMEX — 30 cápsulas',
  '', 0, '', '30 cápsulas', NULL, 0,
  '', 'Natural Medix', '', 'REDUMEX', '', '[]', 0, 40,
  'REDUMEX — 30 cápsulas | ORIGEN•plus', 'REDUMEX de 30 cápsulas · ORIGEN•plus', 1
),
(
  'redumex_60_capsulas', 'redumex-60-capsulas', 'REDUMEX — 60 cápsulas',
  '', 0, '', '60 cápsulas', NULL, 0,
  '', 'Natural Medix', '', 'REDUMEX', '', '[]', 0, 50,
  'REDUMEX — 60 cápsulas | ORIGEN•plus', 'REDUMEX de 60 cápsulas · ORIGEN•plus', 1
),
(
  'chupa_panza_450g', 'chupa-panza-450-g', 'Chupa Panza 450 g',
  '', 0, '', '450 g', 450, 0,
  '', 'Natural Medix', '', '15 en 1', '', '[]', 0, 60,
  'Chupa Panza 450 g | ORIGEN•plus', 'Chupa Panza 450 g · Natural Medix · ORIGEN•plus', 1
);

INSERT OR IGNORE INTO product_categories (product_id, category_id)
VALUES
  ('r13_330ml', 'bebidas'),
  ('redumex_30_capsulas', 'capsulas-comprimidos'),
  ('redumex_60_capsulas', 'capsulas-comprimidos'),
  ('chupa_panza_450g', 'polvos-preparados');

-- No se crean precios ficticios. Cada producto debe recibir sus niveles reales
-- desde /admin/productos/[id] antes de activarse.
