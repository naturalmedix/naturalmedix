# NaturalMedix · Cloudflare Workers + D1

NaturalMedix usa Astro con renderizado en servidor, endpoints API y D1. GitHub Pages solo publica archivos estáticos y no puede ejecutar esta aplicación. El código permanece en GitHub y la publicación se hace en Cloudflare Workers.

## Base D1 de producción

La base de producción `naturalmedix` ya fue creada. Su ID y el identificador de la cuenta Cloudflare están configurados en `wrangler.jsonc`; esos identificadores no son contraseñas.

Antes del primer despliegue, hay que preparar la base con el esquema y el catálogo correcto. Las migraciones de tablas y el archivo de importación del catálogo son pasos separados del despliegue del Worker. El archivo `db/import_jumpseller_20260924.sql` contiene los datos fuente de los 81 productos, incluyendo stock 12, categorías, descripciones, SKU e imágenes. Aplícalo una sola vez en una base vacía después de revisar los datos y los precios. No ejecutes una importación repetida sobre una base con catálogo.

La base local de Wrangler no se copia a producción automáticamente.

## Configurar el secreto para GitHub Actions

En el repositorio, abre **Settings → Secrets and variables → Actions** y crea el secreto:

- `CLOUDFLARE_API_TOKEN`: token de Cloudflare autorizado para desplegar Workers.

No pegues el token en el chat ni lo agregues a archivos del proyecto.

El workflow de GitHub está configurado como ejecución manual. Cuando el secreto y la base estén listos, ve a **Actions → Deploy NaturalMedix to Cloudflare Workers → Run workflow**, marca la confirmación de producción y ejecútalo. El workflow compila Astro y publica con Wrangler.

## Conectar el dominio

La zona `naturalmedix.co` ya está activa en Cloudflare. Después de desplegar el Worker y confirmar que responde en `workers.dev`, asígnale `naturalmedix.co` como dominio personalizado desde Cloudflare Workers. No hace falta transferir el registro del dominio desde Dynadot.

## Secretos de la aplicación

Configura también los secretos de runtime requeridos por el panel y el checkout en Cloudflare Workers:

```bash
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put WOMPI_PRIVATE_KEY
npx wrangler secret put WOMPI_EVENTS_SECRET
```

No pongas los valores reales en `wrangler.jsonc`, GitHub ni JavaScript del navegador. Configura en el Dashboard de Wompi el webhook de eventos apuntando a:

```text
https://naturalmedix.co/api/wompi/events
```

El endpoint valida el checksum del evento antes de actualizar D1. El evento operativo es `transaction.updated`.

Para desarrollo local, copia `.dev.vars.example` a `.dev.vars` y agrega los secretos de prueba. No los pongas en `public/` ni en Git.

## Desarrollo

```bash
npm install
npm run dev
```

## Panel de administración

- `/admin`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/categorias`
- `/admin/pedidos`

El formulario de producto admite precios por cantidad. La cantidad mínima de compra es independiente y se configura por producto.

## Wompi · Payment Links

El servidor crea un Payment Link de uso único y monto fijo por pedido usando la llave privada de Wompi. Las llaves y la firma de integridad no se exponen en el navegador.
