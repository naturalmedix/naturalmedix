/* ==========================================
   INTERFAZ DE USUARIO, MODALES Y EVENTOS (js/ui.js)
   ========================================== */

// --- MODALES DEL CARRITO ---
function openCartModal() { 
  document.getElementById("cart-modal")?.classList.remove("hidden"); 
}

function closeCartModal() { 
  document.getElementById("cart-modal")?.classList.add("hidden"); 
}

// --- MODAL VISTA RÁPIDA MULTIMEDIA ---
function openQuickView(productId) {
  if (typeof products === 'undefined') return;
  const product = products.find(p => p.id === productId);
  if (product) {
    // Abre el modal con la imagen/video del producto
    openMediaModal(product.image, product.name);
  }
}

function openMediaModal(src, title) {
  const modal = document.getElementById("image-modal") || document.getElementById("imageModal");
  if (!modal) return;

  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");

  // Inyectamos la estructura completa por si .image-modal-content no existe en el HTML
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeImageModal()">
      <div class="modal-media-wrapper" onclick="event.stopPropagation()">
        <button id="close-image-modal" class="modal-close-btn" onclick="closeImageModal()">&times;</button>
        ${isVideo 
          ? `<video src="${src}" autoplay loop muted playsinline class="modal-animated-video"></video>`
          : `<img src="${src}" alt="${title || 'Producto'}" style="max-width: 100%; max-height: 80vh; border-radius: 12px;" />`
        }
        <h3 style="margin-top: 10px; color: #fff; text-align: center;">${title || ''}</h3>
      </div>
    </div>
  `;
  
  modal.classList.remove("hidden");
  modal.style.display = "flex"; // Garantiza visibilidad
}

function closeImageModal() {
  const modal = document.getElementById("image-modal") || document.getElementById("imageModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
    modal.innerHTML = "";
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

// --- RENDERIZADO DE PRODUCTOS ---
function renderProductCard(product) {
  const optionsHTML = product.options.map((opt) => 
    `<option value="${opt.price}">${opt.size} - $${opt.price.toLocaleString('es-CO')} COP (${opt.label})</option>`
  ).join('');

  return `
    <div class="product-card">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-img" />
        
        <!-- Botón Circular Flotante con Ojo Animado -->
        <button class="btn-quick-view-circular" onclick="openQuickView('${product.id}')" aria-label="Vista Rápida">
          <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f441/512.webp" alt="Ojo" class="quick-view-eye-icon" />
        </button>
      </div>

      <h3>${product.name}</h3>
      <p class="product-tagline">${product.tagline}</p>
      
      <div class="size-selector-wrapper">
        <label for="select-${product.id}">Presentación:</label>
        <select id="select-${product.id}" class="product-size-select">
          ${optionsHTML}
        </select>
      </div>

      <button class="btn-add-cart" onclick="addToCart('${product.id}')">
        Agregar al Carrito 🛒
      </button>
    </div>
  `;
}

function displayProducts(productsArray) {
  const container = document.getElementById('product-grid');
  if (!container) return;
  
  if (!productsArray || productsArray.length === 0) {
    container.innerHTML = `<p class="no-results" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No se encontraron productos.</p>`;
    return;
  }

  container.innerHTML = productsArray.map(product => renderProductCard(product)).join('');
}

// --- EVENT LISTENERS GENERALES ---
function setupEventListeners() {
  document.getElementById("cart-icon-btn")?.addEventListener("click", openCartModal);
  document.getElementById("close-cart-btn")?.addEventListener("click", closeCartModal);
  
  // Si existe el botón de pago con Wompi
  if (typeof handleWompiCheckout === 'function') {
    document.getElementById("btn-wompi-pay")?.addEventListener("click", handleWompiCheckout);
  }
  
  setupBackToTop();

  const searchInput = document.getElementById("product-search-input");
  const clearBtn = document.getElementById("clear-search-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      // Filtrar productos por nombre o descripción
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.tagline.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );

      displayProducts(filtered);

      if (clearBtn) {
        if (query.length > 0) {
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
        displayProducts(products);
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
