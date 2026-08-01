/* ==========================================
   INTERFAZ DE USUARIO, MODALES Y EVENTOS
   ========================================== */

function openCartModal() { document.getElementById("cart-modal")?.classList.remove("hidden"); }
function closeCartModal() { document.getElementById("cart-modal")?.classList.add("hidden"); }

/* ==========================================
   MODAL VISTA RÁPIDA (CARGA DE IMAGEN GARANTIZADA)
   ========================================== */

function openMediaModal(src, title) {
  const modal = document.getElementById("image-modal") || document.getElementById("imageModal");
  const videoEl = document.getElementById("modal-video-element");
  const imgEl = document.getElementById("modal-image-element");

  if (!modal || !videoEl || !imgEl) return;

  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");

  if (isVideo) {
    // Ocultamos imagen y preparamos video
    imgEl.style.display = "none";
    videoEl.style.display = "block";
    videoEl.src = src;
    videoEl.load();
    videoEl.play().catch(err => console.log("Auto-play prevenido:", err));
  } else {
    // Ocultamos video y preparamos imagen
    videoEl.pause();
    videoEl.style.display = "none";
    imgEl.style.display = "block";
    imgEl.src = src;
    imgEl.alt = title || "Producto";
  }

  // Bloquear scroll de pantalla y mostrar modal
  document.body.classList.add("modal-open");
  modal.classList.remove("hidden");
}

function closeImageModal() {
  const modal = document.getElementById("image-modal") || document.getElementById("imageModal");
  const videoEl = document.getElementById("modal-video-element");
  const imgEl = document.getElementById("modal-image-element");

  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");

    if (videoEl) {
      videoEl.pause();
      videoEl.src = "";
      videoEl.style.display = "none";
    }
    if (imgEl) {
      imgEl.src = "";
      imgEl.style.display = "none";
    }
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
