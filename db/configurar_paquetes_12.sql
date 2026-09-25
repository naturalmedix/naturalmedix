-- Agrupa las cuatro presentaciones de Aguaje para completar paquetes mixtos de 12.
-- Los demás productos quedan como grupos individuales hasta que se les asigne una línea.
UPDATE products
SET line = 'Aguaje'
WHERE id IN ('jm-002', 'jm-003', 'jm-004', 'jm-005');

-- Reversión si se requiere deshacer el grupo:
-- UPDATE products SET line = NULL WHERE id IN ('jm-002', 'jm-003', 'jm-004', 'jm-005');
