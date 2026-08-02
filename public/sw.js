
/* ==========================================
   SERVICE WORKER - NATURAL MEDIX PWA
   ========================================== */

// 1. Nombre de la caché (Sincronizado con la versión de tu app)
const CACHE_NAME = "naturalmedix-v1.1.5";

// 2. Lista completa de recursos para funcionamiento offline
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./manifest.json",
  // Todos tus módulos JavaScript:
  "./js/products.js",
  "./js/cart.js",
  "./js/ui.js",
  "./js/checkout.js",
  "./js/app.js",
  // Script de Wompi (opcional pero recomendado guardar el widget localmente si responde)
  "https://checkout.wompi.co/widget.js"
];

// 3. INSTALACIÓN: Guarda los recursos en la caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precachando archivos modulares...");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// 4. ACTIVACIÓN: Limpia cachés antiguas (v1, v1.1.3, etc.)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[SW] Borrando caché antigua:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Tomar control de las páginas abiertas
  );
});

// 5. INTERCEPTACIÓN DE PETICIONES (Estrategia: Network First con Fallback a Caché)
self.addEventListener("fetch", (event) => {
  // Ignorar peticiones que no sean GET o que sean hacia las APIS de Wompi en vivo
  if (event.request.method !== "GET" || event.request.url.includes("wompi.co/v1")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la red responde, actualizamos la caché dinámicamente
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay red (offline), servimos desde la caché
        return caches.match(event.request);
      })
  );
});
