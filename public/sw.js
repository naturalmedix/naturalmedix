/* ==========================================
   SERVICE WORKER - STARNATURAL PWA
   ========================================== */

// 1. Nombre de la caché (Incrementa la versión al modificar archivos)
const CACHE_NAME = "starnatural-v1.2.1";

// 2. Lista completa de recursos locales para precachar
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./public/manifest.json",
  
  // Archivos CSS
  "./public/assets/css/styles.css",
  "./public/assets/css/base.css",
  "./public/assets/css/navbar.css",
  "./public/assets/css/products.css",
  "./public/assets/css/cart.css",
  "./public/assets/css/checkout.css",

  // Archivos JavaScript
  "./public/assets/js/products.js",
  "./public/assets/js/cart.js",
  "./public/assets/js/ui.js",
  "./public/assets/js/checkout.js",
  "./public/assets/js/app.js"
];

// 3. INSTALACIÓN: Guarda los recursos locales en la caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precachando archivos de la app StarNatural...");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// 4. ACTIVACIÓN: Limpia cachés antiguas
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
    }).then(() => self.clients.claim()) // Tomar control inmediato de las páginas abiertas
  );
});

// 5. INTERCEPTACIÓN DE PETICIONES (Network First con Fallback a Caché)
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Ignorar peticiones no GET, esquemas no HTTP/HTTPS (extensiones) o transacciones vivas de Wompi
  if (
    event.request.method !== "GET" || 
    !requestUrl.protocol.startsWith("http") ||
    requestUrl.href.includes("wompi.co/v1")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar/Actualizar copia en caché si la respuesta es válida
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === "opaque")) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Modo Offline: recupera desde la caché si la red falla
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si solicita una página HTML navegable y no hay red, entrega el index.html
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
