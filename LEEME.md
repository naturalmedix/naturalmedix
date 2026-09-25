# Restaurar etiquetas animadas e instalación PWA

Aplicar el contenido del paquete en la raíz de `C:\Users\julio\NaturalMedix-pwa-v1`, conservando `backups/` como respaldo de los tres archivos originales.

1. Copiar `public/js/app.js`, `public/sw.js` y `public/manifest.json` sobre sus rutas existentes.
2. En la terminal de VS Code, ejecutar una sola vez el SQL de etiquetas:
   `npx wrangler d1 execute naturalmedix --local --file=./db/restaurar_slider_etiquetas.sql`
3. Recargar la tienda. La versión nueva del service worker reemplaza la caché anterior.

Las etiquetas usan la marca, categorías y el indicador `Featured` del CSV. El botón aparece cuando la app no está instalada; si el navegador no ofrece el evento de instalación, el botón muestra instrucciones para instalarla desde el menú.
