/* ==========================================
   INICIALIZACIÓN DE LA APLICACIÓN (ENTRYPOINT)
   ========================================== */

const APP_VERSION = "1.2.10";

// Control de versión para refrescar caché si cambia la versión
if (localStorage.getItem("app_version") !== APP_VERSION) {
  localStorage.setItem("app_version", APP_VERSION);
  window.location.reload(); 
}

let deferredPrompt = null;

// Captura el evento antes de DOMContentLoaded para no perder el prompt.
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  document.getElementById("pwa-install-banner")?.classList.remove("hidden");
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  document.getElementById("pwa-install-banner")?.classList.add("hidden");
});

// Inicialización unificada al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const startCatalog = async () => {
    if (typeof window.loadProductsFromAPI === "function") {
      await window.loadProductsFromAPI();
    }
    if (typeof window.renderProducts === "function") {
      window.renderProducts();
    }
    if (typeof window.syncProductQtyDisplays === "function") {
      window.syncProductQtyDisplays();
    }
  };
  startCatalog();
  if (typeof window.updateCartUI === "function") {
    window.updateCartUI();
  }
  
  setupPWAInstall();
  setupEventListeners();
  setupBackToTop();
});

/* ==========================================
   SOPORTE E INSTALACIÓN DE PWA
   ========================================== */
function setupPWAInstall() {
  const banner = document.getElementById("pwa-install-banner");
  const alreadyInstalled = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (banner && !alreadyInstalled) banner.classList.remove("hidden");


  const btnInstall = document.getElementById("btn-install-app");
  if (btnInstall) {
    btnInstall.addEventListener("click", async () => {
      if (!deferredPrompt) {
        const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const instructions = isAppleMobile
          ? "En Safari, toca Compartir y luego Añadir a pantalla de inicio."
          : "Abre el menú del navegador y elige Instalar NaturalMedix o Instalar página como aplicación.";
        window.alert(instructions);
        return;
      }
      const prompt = deferredPrompt;
      deferredPrompt = null;
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted' && banner) banner.classList.add("hidden");
    });
  }

  // Registro del Service Worker servido desde la raíz de public/
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error("Error al registrar el Service Worker:", err);
    });
  }
}

/* ==========================================
   LISTENERS Y NAVEGACIÓN AUXILIAR
   ========================================== */
function setupEventListeners() {
  // Cierre de modal al hacer clic en el backdrop
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeMediaModal();
      }
    });
  }
}

function setupBackToTop() {
  const btnTop = document.getElementById("btn-back-to-top");
  if (!btnTop) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
  btnTop.classList.add("visible");
} else {
  btnTop.classList.remove("visible");
}
  });

  btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==========================================
   SOPORTE GLOBAL DE MODAL MULTIMEDIA
   ========================================== */
function closeMediaModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("active");
    
    // Limpia el contenedor y detiene la reproducción de audio/video
    const contentContainer = document.getElementById("modal-media-content");
    if (contentContainer) {
      const video = contentContainer.querySelector("video");
      if (video) {
        video.pause();
        video.src = "";
      }
      contentContainer.innerHTML = "";
    }
  }
}

// Exponer funciones necesarias globalmente
window.closeMediaModal = closeMediaModal;


