import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'data', 'naturalmedix_jumpseller_import.json');
const outputPath = path.join(root, '.wrangler', 'naturalmedix_catalog_import.sql');
const products = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

if (products.length !== 81) {
  throw new Error(`Se esperaban 81 productos y se encontraron ${products.length}; no se generó la importación.`);
}

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const nullableText = (value) => value == null ? 'NULL' : quote(value);
const integer = (value, label) => {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new Error(`Valor inválido para ${label}: ${value}`);
  return String(number);
};

const categories = new Map();
const seenIds = new Set();
const seenBarcodes = new Set();

for (const product of products) {
  if (!product.id || seenIds.has(product.id)) throw new Error(`ID de producto ausente o repetido: ${product.id}`);
  seenIds.add(product.id);
  if (Number(product.stock) !== 12) throw new Error(`El stock de ${product.id} no es 12.`);

  const barcode = String(product.barcode ?? '').trim();
  if (barcode && seenBarcodes.has(barcode)) throw new Error(`Código de barras repetido: ${barcode}`);
  if (barcode) seenBarcodes.add(barcode);

  const categoryIds = product.category_ids ?? [];
  const names = String(product.source_data?.Categories ?? '').split(',').map(value => value.trim()).filter(Boolean);
  if (categoryIds.length !== names.length) {
    throw new Error(`No coincide la cantidad de categorías para ${product.id}.`);
  }
  categoryIds.forEach((id, index) => {
    const name = names[index];
    const previous = categories.get(id);
    if (previous && previous.name !== name) throw new Error(`Nombre de categoría inconsistente: ${id}`);
    categories.set(id, { name, slug: id.replace(/^jm-cat-/, '') });
  });
}

const sql = [];
sql.push('-- Catálogo Jumpseller NaturalMedix: 81 productos; stock 12 por producto.');
sql.push('-- Inserciones OR IGNORE para permitir reanudar una carga incompleta sin reiniciar stock.');

for (const [id, category] of categories) {
  sql.push(`INSERT OR IGNORE INTO categories (id, name, slug, active, sort_order) VALUES (${quote(id)}, ${quote(category.name)}, ${quote(category.slug)}, 1, 0);`);
}

for (const product of products) {
  const barcode = String(product.barcode ?? '').trim();
  const images = JSON.stringify(product.images ?? []);
  const sourceData = JSON.stringify(product.source_data ?? {});
  const columns = 'id, slug, name, description, original_price, stock, barcode, brand, active, sort_order, seo_title, seo_description, minimum_order_quantity, sku, cost_cop, images_json, source_data_json';
  const values = [
    quote(product.id),
    quote(product.slug),
    quote(product.name),
    nullableText(product.description),
    integer(product.original_price ?? 0, 'original_price'),
    integer(product.stock, 'stock'),
    barcode ? quote(barcode) : 'NULL',
    nullableText(product.brand),
    integer(product.active ?? 1, 'active'),
    integer(product.sort_order ?? 0, 'sort_order'),
    nullableText(product.seo_title),
    nullableText(product.seo_description),
    integer(product.minimum_order_quantity ?? 1, 'minimum_order_quantity'),
    nullableText(product.sku),
    product.cost_cop == null ? 'NULL' : integer(product.cost_cop, 'cost_cop'),
    quote(images),
    quote(sourceData),
  ];
  sql.push(`INSERT OR IGNORE INTO products (${columns}) VALUES (${values.join(', ')});`);

  for (const tier of product.price_tiers ?? []) {
    sql.push(`INSERT OR IGNORE INTO product_prices (product_id, minimum_quantity, price_cop, label, active) VALUES (${quote(product.id)}, ${integer(tier.minimum_quantity, 'minimum_quantity')}, ${integer(tier.price_cop, 'price_cop')}, ${nullableText(tier.label)}, ${integer(tier.active ?? 1, 'active')});`);
  }

  for (const categoryId of product.category_ids ?? []) {
    sql.push(`INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (${quote(product.id)}, ${quote(categoryId)});`);
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql.join('\n') + '\n', 'utf8');
console.log(`Generated idempotent catalog SQL for ${products.length} products at ${path.relative(root, outputPath)}`);
