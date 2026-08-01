/* ==========================================
   INTERFAZ DE USUARIO, MODALES Y EVENTOS
   ========================================== */

function openCartModal() { document.getElementById("cart-modal")?.classList.remove("hidden"); }
function closeCartModal() { document.getElementById("cart-modal")?.classList.add("hidden"); }

/* ==========================================
   MODAL VISTA RÁPIDA - SOLUCIÓN BLINDADA
   ========================================== */

function openMediaModal(src, title) {
  // 1. Verificar o crear el contenedor principal si no existe
  let modal = document.getElementById("image-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "image-modal";
    document.body.appendChild(modal);
  }

  // 2. Normalizar la ruta de la imagen o video
  const cleanSrc = src.startsWith("./") ? src : `./${src.replace(/^\/+/, '')}`;
  const isVideo = cleanSrc.endsWith(".mp4") || cleanSrc.endsWith(".webm");

  // 3. Estilos de pantalla completa aplicados directamente por JS (Anula cualquier CSS previo)
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
  `;

  // 4. Inyectar el contenido con manejador de errores de imagen
  modal.innerHTML = `
    <div style="position: relative; max-width: 90vw; max-height: 70dvh; display: flex; align-items: center; justify-content: center;">
      <button onclick="closeImageModal()" style="
        position: absolute;
        top: -15px;
        right: -15px;
        width: 40px;
        height: 40px;
        background: #ef4444;
        color: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 50%;
        font-size: 22px;
        font-weight: bold;
        line-height: 1;
        cursor: pointer;
        z-index: 10000000;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      ">&times;</button>
      
      ${isVideo ? `
        <video src="${cleanSrc}" autoplay loop muted playsinline style="
          max-width: 85vw;
          max-height: 65dvh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 12px;
          background: #000;
        "></video>
      ` : `
        <img src="${cleanSrc}" alt="${title || 'Producto'}" 
          onerror="console.error('Error cargando imagen en:', this.src); alert('No se pudo cargar la imagen: ' + this.src);"
          style="
            max-width: 85vw;
            max-height: 65dvh;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 12px;
            background: #000;
            display: block !important;
        " />
      `}
    </div>
  `;

  // Bloquear scroll de fondo
  document.body.style.overflow = "hidden";
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.style.display = "none";
    modal.innerHTML = "";
    document.body.style.overflow = "";
  }
}
// --- MODAL DE RECIBO / CONFIRMACIÓN ---
function showOrderReceipt(data) {
  const container = document.getElementById("receipt-details-container");
  const modal = document.getElementById("receipt-modal");
  
  if (!container || !modal) return;

  const itemsHtml = data.cart.map(i => `
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
      <p style="margin: 2px 0;"><strong>Referencia Wompi:</strong> ${data.ref}</p>
      <p style="margin: 2px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString("es-CO")}</p>
      <p style="margin: 2px 0; font-size: 1rem; color: #166534;"><strong>Total Pagado:</strong> $${data.total.toLocaleString("es-CO")} COP</p>
    </div>

    <h4 style="margin: 0.5rem 0; color: #0f172a;">Detalle del Pedido:</h4>
    ${itemsHtml}

    <h4 style="margin: 0.8rem 0 0.4rem; color: #0f172a;">Datos de Envío:</h4>
    <p style="margin: 2px 0;"><strong>Cliente:</strong> ${data.customer.name} (CC/NIT: ${data.customer.idNum})</p>
    <p style="margin: 2px 0;"><strong>Teléfono:</strong> ${data.customer.phone}</p>
    <p style="margin: 2px 0;"><strong>Correo:</strong> ${data.customer.email}</p>
    <p style="margin: 2px 0;"><strong>Dirección:</strong> ${data.customer.address}, ${data.customer.city}</p>
    ${data.customer.notes ? `<p style="margin: 2px 0;"><strong>Notas:</strong> ${data.customer.notes}</p>` : ''}
  `;

  const btnWa = document.getElementById("btn-whatsapp-copy");
  if (btnWa) {
    btnWa.href = data.whatsappUrl;
  }

  modal.classList.remove("hidden");
}

function closeReceiptModal() {
  document.getElementById("receipt-modal")?.classList.add("hidden");
}

// --- BOTÓN VOLVER ARRIBA ---
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

// --- EVENT LISTENERS GENERALES ---
function setupEventListeners() {
  document.getElementById("cart-icon-btn")?.addEventListener("click", openCartModal);
  document.getElementById("close-cart-btn")?.addEventListener("click", closeCartModal);
  document.getElementById("btn-wompi-pay")?.addEventListener("click", handleWompiCheckout);
  
  const imageModal = document.getElementById("image-modal") || document.getElementById("imageModal");
  if (imageModal) {
    imageModal.addEventListener("click", (e) => {
      if (e.target === imageModal || e.target.classList.contains("image-modal-content")) {
        closeImageModal();
      }
    });
  }

  const searchInput = document.getElementById("product-search-input");
  const clearBtn = document.getElementById("clear-search-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const value = e.target.value;
      renderProducts(value);

      if (clearBtn) {
        if (value.trim().length > 0) {
          clearBtn.classList.remove("hidden");
        } else {
          clearBtn.classList.add("hidden");
        }
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        renderProducts("");
        searchInput.focus();
      }
      clearBtn.classList.add("hidden");
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeImageModal();
      closeCartModal();
    }
  });
}
