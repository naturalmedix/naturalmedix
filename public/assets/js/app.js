
/* ==========================================
   INICIALIZACIÓN DE LA APLICACIÓN (ENTRYPOINT)
   ========================================== */

const APP_VERSION = "1.2.1";

if (localStorage.getItem("app_version") !== APP_VERSION) {
  localStorage.setItem("app_version", APP_VERSION);
  window.location.reload(true); 
}

let deferredPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();
  setupPWAInstall();
  setupEventListeners();
  setupBackToTop();
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
      if (outcome === 'accepted' && banner) { banner.classList.add("hidden"); }
      deferredPrompt = null;
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
  }
}
