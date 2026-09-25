INSERT OR IGNORE INTO products (
  id, slug, name, description, original_price, pum, net_content, net_weight_g, stock,
  invima, brand, laboratory, line, video_url, badges_json, active, sort_order,
  seo_title, seo_description, minimum_order_quantity
) VALUES
(
  'origen_30_comprimidos', 'origen-30-comprimidos', 'ORIGEN Natural 30 Comprimidos',
  '', 42900, '', 'Cont. Neto: Frasco x 30 Comprimidos (30 Porciones)', 18, 0,
  'PSA-0005343-2024', 'ORIGEN Natural', 'ORIGEN Natural', 'ORIGEN Natural',
  '/images/origen_30_comprimidos.mp4', '[]', 1, 10,
  'ORIGEN Natural 30 Comprimidos', 'ORIGEN Natural 30 Comprimidos · ORIGEN•plus', 1
),
(
  'origen-15-discos', 'origen-15-discos', 'ORIGEN Natural 15 Discos Comprimidos',
  '', 42900, '', 'Cont. Neto: Frasco x 15 Comprimidos (15 Porciones)', 9, 0,
  'PSA-0005343-2024', 'ORIGEN Natural', 'Star Natural', 'ORIGEN Natural',
  '/images/origen-15-discos.mp4', '[]', 1, 20,
  'ORIGEN Natural 15 Discos Comprimidos', 'ORIGEN Natural 15 Discos Comprimidos · ORIGEN•plus', 1
);

INSERT OR IGNORE INTO product_prices (product_id, minimum_quantity, price_cop, label) VALUES
('origen_30_comprimidos', 1, 30000, 'Detal'),
('origen-15-discos', 1, 18000, 'Detal');
