/* ==========================================
   INICIALIZACIÓN DE LA APLICACIÓN (ENTRYPOINT)
   ========================================== */

const APP_VERSION = "1.2.1";

// Control de versión sin bucle infinito ni parámetros obsoletos
try {
  const storedVersion = localStorage.getItem("app_version");
  if (storedVersion !== APP_VERSION) {
    localStorage.setItem("app_version", APP_VERSION);
    // Si la versión cambió, limpia cachés obsoletas y recarga suavemente
    if (storedVersion) {
      window.location.reload();
    }
  }
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
  
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (banner) banner.classList.remove("hidden");
  });

  const btnInstall = document.getElementById("btn-install-app");
  if (btnInstall) {
    btnInstall.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted' && banner) { 
        banner.classList.add("hidden"); 
      }
      deferredPrompt = null;
    });
  }

  // Registro seguro del Service Worker apuntando a la raíz
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW App] Registrado con éxito:', reg.scope))
      .catch(err => console.error('[SW App] Error de registro:', err));
  }
}
