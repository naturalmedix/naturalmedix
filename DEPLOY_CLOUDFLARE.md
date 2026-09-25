# NaturalMedix · Cloudflare Workers + D1

La aplicación mantiene Astro como base y añade renderizado server-side para API/admin, con D1 como única base de datos de la aplicación.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Crear D1

```bash
npx wrangler d1 create tienda-secreta
```

Copia el `database_id` que entrega Wrangler a `wrangler.jsonc`.

## 3. Crear las tablas

Local:

```bash
npx wrangler d1 execute tienda-secreta --local --file=./migrations/0001_initial.sql
```

Producción:

```bash
npx wrangler d1 execute tienda-secreta --remote --file=./migrations/0001_initial.sql
```

## 4. Configurar el token de administrador

Local: copia `.dev.vars.example` a `.dev.vars` y cambia el valor.

Producción:

```bash
npx wrangler secret put ADMIN_TOKEN
```

No pongas el token real en `wrangler.jsonc`, GitHub ni JavaScript del navegador.

## 5. Desarrollo

```bash
npm run dev
```

## 6. Deploy

```bash
npm run build
npx wrangler deploy
```

El adaptador oficial de Cloudflare usa Workers para el SSR/API y permite acceder a bindings como `DB` desde el runtime. D1 se consulta mediante `env.DB`.

## Admin

- `/admin`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/categorias`
- `/admin/pedidos`

El formulario de producto soporta múltiples niveles de precio por cantidad, por ejemplo:

- Desde 1 → $22.000
- Desde 4 → $18.000
- Desde 7 → $16.500
- Desde 13 → $15.600

La cantidad mínima de compra es independiente y se configura por producto.

## Wompi · Payment Links

El checkout del storefront ya no expone llaves ni firma de integridad en el navegador. El servidor crea un Payment Link de uso único y monto fijo por cada pedido usando la llave privada de Wompi.

Configura estos secretos en Cloudflare:

```bash
npx wrangler secret put WOMPI_PRIVATE_KEY
npx wrangler secret put WOMPI_EVENTS_SECRET
```

Configura en el Dashboard de Wompi el webhook de eventos apuntando a:

```text
https://TU-DOMINIO/api/wompi/events
```

El endpoint valida el checksum del evento antes de actualizar D1. El evento operativo es `transaction.updated`.

Para desarrollo local, agrega `WOMPI_PRIVATE_KEY` y `WOMPI_EVENTS_SECRET` a `.dev.vars`. No los pongas en `public/`, en el frontend ni en Git.
