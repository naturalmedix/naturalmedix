PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  original_price INTEGER,
  pum TEXT,
  net_content TEXT,
  net_weight_g REAL,
  stock INTEGER NOT NULL DEFAULT 0,
  barcode TEXT UNIQUE,
  invima TEXT,
  brand TEXT,
  laboratory TEXT,
  line TEXT,
  video_url TEXT,
  badges_json TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  minimum_quantity INTEGER NOT NULL,
  price_cop INTEGER NOT NULL,
  label TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(product_id, minimum_quantity),
  CHECK(minimum_quantity >= 1),
  CHECK(price_cop >= 0)
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY(product_id, category_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  total_cop INTEGER NOT NULL DEFAULT 0,
  wompi_link_id TEXT,
  wompi_reference TEXT,
  wompi_transaction_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_document TEXT,
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_address_2 TEXT,
  shipping_city TEXT,
  shipping_region TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'CO',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit_price_cop INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal_cop INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id, minimum_quantity);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
