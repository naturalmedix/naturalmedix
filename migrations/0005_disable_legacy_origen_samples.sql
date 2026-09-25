-- Keep the legacy sample rows for history but hide them from the NaturalMedix storefront.
UPDATE products
SET active = 0, updated_at = CURRENT_TIMESTAMP
WHERE id IN ('origen_30_comprimidos', 'origen-15-discos');
