/* Service worker NaturalMedix: lista de recursos existentes y versión renovada. */
const CACHE_NAME = "naturalmedix-v1.0.2";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/images/logo-naturalmedix.svg",
  "/css/styles-1.2.8.css",
  "/images/icon-192.png",
  "/images/icon-512.png",
  "/icons/2b50_512.webp",
  "/js/products.js",
  "/js/pack-rules.js",
  "/js/cart.js",
  "/js/ui.js",
  "/js/checkout.js",
  "/js/app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => cacheName !== CACHE_NAME ? caches.delete(cacheName) : undefined)
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || /\.(mp4|webm|mov)$/i.test(url.pathname) || url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(request).then((response) => {
      if (response && response.status === 200 && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
