/* ==========================================
   SERVICE WORKER - NATURALMEDIX PWA
   ========================================== */

const CACHE_NAME = "naturalmedix-v1.2.1";

// Lista completa de assets requeridos para funcionamiento Offline
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/public/manifest.json",

  // Íconos PWA
  "/public/assets/icons/icon-192.png",
  "/public/assets/icons/icon-512.png",

  // Archivos CSS
  "/public/assets/css/styles.css",
  "/public/assets/css/base.css",
  "/public/assets/css/navbar.css",
  "/public/assets/css/products.css",
  "/public/assets/css/cart.css",
  "/public/assets/css/checkout.css",

  // Archivos JavaScript
  "/public/assets/js/products.js",
  "/public/assets/js/cart.js",
  "/public/assets/js/ui.js",
  "/public/assets/js/checkout.js",
  "/public/assets/js/app.js",
  "/public/assets/js/script.js"
];

// 1. INSTALACIÓN: Precarga segura
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Guardando en caché los archivos base de NaturalMedix...");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error("[SW] Error crítico en el precaché:", err))
  );
});

// 2. ACTIVACIÓN: Limpieza de cachés obsoletas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[SW] Eliminando caché antigua:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. ESTRATEGIA DE CACHÉ: Network First con Fallback Offline
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Excluir peticiones que no sean GET o pasarelas de pago (Wompi)
  if (
    request.method !== "GET" || 
    !url.protocol.startsWith("http") || 
    url.hostname.includes("wompi.co")
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Actualizar caché solo para respuestas HTTP válidas de nuestro propio origen
        if (networkResponse && networkResponse.status === 200 && url.origin === location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Intenta responder con lo que haya en la caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si es una navegación de página y no hay red ni caché específica, retorna el index.html
        if (request.mode === "navigate") {
          return caches.match("/index.html") || caches.match("/");
        }
      })
  );
});
