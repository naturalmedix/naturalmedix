/* ==========================================
   INTERFAZ DE USUARIO, MODALES Y EVENTOS
   ========================================== */

function openCartModal() { 
  document.getElementById("cart-modal")?.classList.remove("hidden"); 
  document.body.style.overflow = "hidden";
}

function closeCartModal() { 
  document.getElementById("cart-modal")?.classList.add("hidden"); 
  document.body.style.overflow = "";
}

/* ==========================================
   MODAL VISTA RÁPIDA (IMÁGENES Y VIDEOS)
   ========================================== */

function openMediaModal(src, title) {
  if (!src) return;

  let modal = document.getElementById("image-modal");
  
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "image-modal";
    modal.className = "modal-overlay hidden";
    document.body.appendChild(modal);
  }

  // Normalización segura de URLs
  const isExternal = src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:");
  const cleanSrc = isExternal ? src : `/${src.replace(/^\/+/, '')}`;
  const isVideo = cleanSrc.endsWith(".mp4") || cleanSrc.endsWith(".webm");

  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    background-color: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    z-index: 9999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 20px !important;
    box-sizing: border-box !important;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    pointer-events: none;
    -webkit-tap-highlight-color: transparent !important;
  `;
    
  let revealed = false;
  const revealModal = () => {
    if (revealed) return;
    revealed = true;
    document.body.style.overflow = "hidden";
    modal.classList.remove("hidden");
    modal.style.pointerEvents = "auto";
    requestAnimationFrame(() => {
      modal.style.opacity = "1";
    });
  };

  if (isVideo) {
    modal.innerHTML = `
      <div style="position: relative; max-width: 90vw; max-height: 70dvh; display: flex; align-items: center; justify-content: center;">
        <button onclick="closeMediaModal()" aria-label="Cerrar modal" style="
          position: absolute; top: -15px; right: -15px; width: 40px; height: 40px;
          background: #ef4444; color: #ffffff; border: 2px solid #ffffff; border-radius: 50%;
          font-size: 22px; font-weight: bold; line-height: 1; cursor: pointer; z-index: 10000000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        ">&times;</button>
        <video src="${cleanSrc}" autoplay loop muted playsinline style="
          max-width: 85vw; max-height: 65dvh; width: auto; height: auto;
          object-fit: contain; border-radius: 12px; background: #000;
        "></video>
      </div>
    `;
    const videoEl = modal.querySelector("video");
    if (videoEl) {
      videoEl.onloadeddata = revealModal;
      setTimeout(revealModal, 300);
    } else {
      revealModal();
    }
  } else {
    const imgLoader = new Image();
    imgLoader.src = cleanSrc;

    const renderImageModal = () => {
      modal.innerHTML = `
        <div style="position: relative; max-width: 90vw; max-height: 70dvh; display: flex; align-items: center; justify-content: center;">
          <button onclick="closeMediaModal()" aria-label="Cerrar modal" style="
            position: absolute; top: -15px; right: -15px; width: 40px; height: 40px;
            background: #ef4444; color: #ffffff; border: 2px solid #ffffff; border-radius: 50%;
            font-size: 22px; font-weight: bold; line-height: 1; cursor: pointer; z-index: 10000000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          ">&times;</button>
          <img src="${cleanSrc}" alt="${title || 'Producto'}" style="
            max-width: 85vw; max-height: 65dvh; width: auto; height: auto;
            object-fit: contain; border-radius: 12px; background: #000; display: block !important;
          " />
        </div>
      `;
      revealModal();
    };

    if (imgLoader.complete) {
      renderImageModal();
    } else {
      imgLoader.onload = renderImageModal;
      imgLoader.onerror = renderImageModal;
    }
  }
}

function closeMediaModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    const videoEl = modal.querySelector("video");
    if (videoEl) {
      videoEl.pause();
      videoEl.src = "";
    }

    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";
    document.body.style.overflow = "";

    setTimeout(() => {
      modal.innerHTML = "";
      modal.classList.add("hidden");
    }, 200);
  }
}

/* ==========================================
   MODAL DE RECIBO / CONFIRMACIÓN
   ========================================== */

function showOrderReceipt(data) {
  const container = document.getElementById("receipt-details-container");
  const modal = document.getElementById("receipt-modal");
  
  if (!container || !modal) return;

  const itemsHtml = (data.cart || []).map(i => `
    <div style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
      <div style="font-weight: 700; color: #0f172a;">${i.name} (x${i.qty})</div>
      <div style="color: #475569; font-size: 0.8rem;">
        • Fabricado: ${i.fabricado || 'N/A'}<br>
        • Contenido: ${i.netContent || 'N/A'}<br>
        • Invima: ${i.invima || 'N/A'}<br>
        • Subtotal: $${(i.price * i.qty).toLocaleString("es-CO")} COP
      </div>
    </div>
  `).join("");

  container.innerHTML = `
    <div style="margin-bottom: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
      <p style="margin: 2px 0;"><strong>Referencia Wompi:</strong> ${data.ref || 'N/A'}</p>
      <p style="margin: 2px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString("es-CO")}</p>
      <p style="margin: 2px 0; font-size: 1rem; color: #166534;"><strong>Total Pagado:</strong> $${(data.total || 0).toLocaleString("es-CO")} COP</p>
    </div>

    <h4 style="margin: 0.5rem 0; color: #0f172a;">Detalle del Pedido:</h4>
    ${itemsHtml}

    <h4 style="margin: 0.8rem 0 0.4rem; color: #0f172a;">Datos de Envío:</h4>
    <p style="margin: 2px 0;"><strong>Cliente:</strong> ${data.customer?.name || 'N/A'} (CC/NIT: ${data.customer?.idNum || 'N/A'})</p>
    <p style="margin: 2px 0;"><strong>Teléfono:</strong> ${data.customer?.phone || 'N/A'}</p>
    <p style="margin: 2px 0;"><strong>Correo:</strong> ${data.customer?.email || 'N/A'}</p>
    <p style="margin: 2px 0;"><strong>Dirección:</strong> ${data.customer?.address || 'N/A'}, ${data.customer?.city || 'N/A'}</p>
    ${data.customer?.notes ? `<p style="margin: 2px 0;"><strong>Notas:</strong> ${data.customer.notes}</p>` : ''}
  `;

  const btnWa = document.getElementById("btn-whatsapp-copy");
  if (btnWa && data.whatsappUrl) {
    btnWa.href = data.whatsappUrl;
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeReceiptModal() {
  document.getElementById("receipt-modal")?.classList.add("hidden");
  document.body.style.overflow = "";
}

/* ==========================================
   BOTÓN VOLVER ARRIBA
   ========================================== */

function setupBackToTop() {
  const btnTop = document.getElementById("btn-back-to-top");
  if (!btnTop) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btnTop.classList.remove("hidden");
    } else {
      btnTop.classList.add("hidden");
    }
  });

  btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==========================================
   EVENT LISTENERS GENERALES
   ========================================== */

function setupEventListeners() {
  document.getElementById("cart-icon-btn")?.addEventListener("click", openCartModal);
  document.getElementById("close-cart-btn")?.addEventListener("click", closeCartModal);
  document.getElementById("btn-wompi-pay")?.addEventListener("click", typeof handleWompiCheckout === 'function' ? handleWompiCheckout : () => {});
  
  const imageModal = document.getElementById("image-modal");
  if (imageModal) {
    imageModal.addEventListener("click", (e) => {
      if (e.target === imageModal || e.target.classList.contains("modal-media-wrapper")) {
        closeMediaModal();
      }
    });
  }

  const searchInput = document.getElementById("product-search-input");
  const clearBtn = document.getElementById("clear-search-btn");

  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const value = e.target.value;

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (typeof renderProducts === 'function') {
          renderProducts(value);
        }
      }, 150);

      if (clearBtn) {
        clearBtn.classList.toggle("hidden", value.trim().length === 0);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        if (typeof renderProducts === 'function') {
          renderProducts("");
        }
        searchInput.focus();
      }
      clearBtn.classList.add("hidden");
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMediaModal();
      closeCartModal();
      closeReceiptModal();
    }
  });
}
