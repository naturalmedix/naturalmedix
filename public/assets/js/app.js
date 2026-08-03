/* ==========================================
   INICIALIZACIÓN DE LA APLICACIÓN (ENTRYPOINT)
   ========================================== */

const APP_VERSION = "1.2.1";

// Guardar versión en storage sin recargas forzadas agresivas
try {
  localStorage.setItem("app_version", APP_VERSION);
} catch (e) {
  console.warn("[App] Acceso restringido a localStorage", e);
}

let deferredPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de módulos principales
  if (typeof renderProducts === 'function') renderProducts();
  if (typeof updateCartUI === 'function') updateCartUI();

  setupPWAInstall();
  if (typeof setupEventListeners === 'function') setupEventListeners();
  if (typeof setupBackToTop === 'function') setupBackToTop();
});

// --- SOPORTE E INSTALACIÓN DE PWA ---
function setupPWAInstall() {
  const banner = document.getElementById("pwa-install-banner");

  // Si la app ya se ejecuta en modo standalone (instalada), no muestra el banner
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone && banner) {
    banner.classList.add("hidden");
  }

  // Capturar evento de instalación
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (banner && !isStandalone) {
      banner.classList.remove("hidden");
    }
  });

  // Listener para cuando la PWA se instala con éxito
  window.addEventListener("appinstalled", () => {
    console.log("[PWA] App instalada con éxito.");
    if (banner) banner.classList.add("hidden");
    deferredPrompt = null;
  });

  // Acción del botón instalar
  const btnInstall = document.getElementById("btn-install-app");
  if (btnInstall) {
    btnInstall.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      // Despliega el diálogo nativo de instalación
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Respuesta del usuario: ${outcome}`);

      // Ocultar banner sin importar la decisión y liberar el prompt
      if (banner) banner.classList.add("hidden");
      deferredPrompt = null;
    });
  }

  // Registro seguro del Service Worker desde la raíz de la app
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[SW App] Registrado con éxito en el scope:', reg.scope);

        // Detectar si hay una actualización del SW lista para activarse
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW App] Nueva versión disponible. Recarga para actualizar.');
            }
          });
        });
      })
      .catch(err => console.error('[SW App] Error en el registro:', err));
  }
}
