# NaturalMedix · Cloudflare Workers + D1

NaturalMedix usa Astro con renderizado en servidor, endpoints API y D1. GitHub Pages solo publica archivos estáticos y no puede ejecutar esta aplicación. El código permanece en GitHub y la publicación se hace en Cloudflare Workers.

## Configuración de Cloudflare

La zona `naturalmedix.co` ya está activa en Cloudflare y sus nameservers están delegados desde Dynadot. El identificador de cuenta y la base D1 de producción están configurados en `wrangler.jsonc`; son identificadores, no contraseñas.

## Configurar el token de despliegue

En el repositorio abre **Settings → Secrets and variables → Actions** y crea el secreto:

- `CLOUDFLARE_API_TOKEN`: token de Cloudflare con permisos para editar Workers y D1 en esta cuenta.

No pegues el token en el chat ni lo agregues a archivos del proyecto.

## Primer despliegue e inicialización de D1

El workflow aplica las migraciones para crear las tablas. En el primer despliegue, activa las dos confirmaciones del formulario:

- `confirm_production`: confirma la publicación de producción.
- `initialize_catalog`: carga el catálogo por primera vez en la base D1.

La inicialización carga los 81 productos con stock 12, precios fuente, categorías, descripciones, SKU e imágenes. También configura la línea mixta de Aguaje y restaura las etiquetas animadas. Los códigos de barras vacíos se guardan como `NULL`, para respetar la restricción de unicidad de la base.

La importación usa inserciones que no reinician el stock de productos ya existentes. En ejecuciones posteriores, deja `initialize_catalog` desactivado para evitar volver a sembrar productos eliminados.

Para publicar: **Actions → Deploy NaturalMedix to Cloudflare Workers → Run workflow**. El workflow compila Astro y publica con Wrangler.

## Conectar el dominio al Worker

Después del despliegue, comprueba que la dirección `workers.dev` responda. Luego, en Cloudflare Workers, asigna `naturalmedix.co` como dominio personalizado del Worker. El dominio permanece registrado en Dynadot; no se transfiere.

## Secretos de la aplicación

Antes de usar el panel administrativo y el checkout, configura en Cloudflare Workers estos secretos de runtime:

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

El pedido mínimo usa paquetes de 12 unidades por producto o por línea mixta. La línea Aguaje permite combinar sus cuatro productos. Cada paquete suma $130.000.

## Wompi · Payment Links

El servidor crea un Payment Link de uso único y monto fijo por pedido usando la llave privada de Wompi. Las llaves y la firma de integridad no se exponen en el navegador.
