# NaturalMedix · Cloudflare Workers + D1

NaturalMedix usa Astro con renderizado en servidor, endpoints API y D1. GitHub Pages solo publica archivos estáticos y no puede ejecutar esta aplicación. El repositorio permanece en GitHub; el sitio se publica en Cloudflare Workers.

## Preparar la base D1 de producción

Crear una base de producción si todavía no existe:

```bash
npx wrangler d1 create naturalmedix
```

Guarda el `database_id` que entrega Wrangler. Para ejecutar migraciones desde tu computadora, coloca ese ID en el campo `database_id` de `wrangler.jsonc`. El ID no es un secreto, pero no subas otros tokens al archivo.

Ejecuta las migraciones en la base:

```bash
npx wrangler d1 migrations apply naturalmedix --remote
```

Confirma que la base tenga las tablas y el catálogo que necesita la tienda. La base local con los 81 productos y stock 12 no se copia automáticamente a producción.

## Configurar GitHub Actions

En el repositorio, abre **Settings → Secrets and variables → Actions** y configura:

- Secret `CLOUDFLARE_ACCOUNT_ID`: identificador de la cuenta Cloudflare.
- Secret `CLOUDFLARE_API_TOKEN`: token de Cloudflare autorizado para desplegar Workers.
- Variable `CLOUDFLARE_D1_DATABASE_ID`: identificador real de la base D1 `naturalmedix`.

El workflow está configurado como ejecución manual para evitar publicar hasta que estas credenciales y la base de producción estén listas. Desde **Actions → Deploy NaturalMedix to Cloudflare Workers → Run workflow**, marca la confirmación de producción y ejecútalo. El workflow valida la configuración, coloca el ID de D1 solo en el entorno de compilación y publica con Wrangler.

No agregues tokens privados a archivos del proyecto ni al chat.

## Conectar el dominio

Después de que el Worker se despliegue correctamente, configura `naturalmedix.co` como dominio personalizado del Worker en Cloudflare. Comprueba que el dominio y su zona DNS estén disponibles en la cuenta antes de cambiar la publicación desde GitHub Pages. No cambies los registros DNS hasta verificar primero la URL de prueba `workers.dev` y que el Worker responde bien.

El archivo `CNAME` del repositorio puede permanecer como respaldo; cuando GitHub Pages deje de publicar, ese archivo no dirige el Worker.

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
