/* ==========================================
   SERVICE WORKER - NATURAL MEDIX PWA
   ========================================== */

// 1. Nombre de la caché
const CACHE_NAME = "naturalmedix-v1.1.5";

// 2. Lista completa de recursos locales para precachar
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  
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
  "./public/assets/js/app.js",
  "./public/assets/js/script.js"
];

// 3. INSTALACIÓN: Guarda los recursos locales en la caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precachando archivos de la app...");
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
    }).then(() => self.clients.claim()) // Tomar control de las páginas abiertas
  );
});

// 5. INTERCEPTACIÓN DE PETICIONES (Network First con Fallback a Caché)
self.addEventListener("fetch", (event) => {
  // Ignorar peticiones que no sean GET o que vayan directo a las APIs en vivo de Wompi
  if (event.request.method !== "GET" || event.request.url.includes("wompi.co/v1")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar/Actualizar copia en caché si la respuesta es exitosa
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === "opaque")) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si falla la red (Modo Offline), busca la respuesta guardada en caché
        return caches.match(event.request);
      })
  );
});
