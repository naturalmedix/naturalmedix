const PRODUCTS = [
   {
    id: "aguaje-pawer",
    name: "AGUAJE pawer",
    badge: "Estrella",
    fabricado: "Natural Medix (Peru)",
    netContent: "Cont. Neto: 100 Capsulas | Capsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 capsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "assets/images/natural-medix.mp4"
  },
  {
    id: "aguaje-plus",
    name: "Aguaje Plus",
    badge: "Estrella",
    fabricado: "Natural Medix (Peru)",
    netContent: "Cont. Neto: 100 Capsulas | Capsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 capsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "assets/images/natural-medix.mp4"
  },
  {
    id: "aguaje-hinojo",
    name: "Aguaje Hinojo",
    badge: "Estrella",
    fabricado: "Natural Medix (Peru)",
    netContent: "Cont. Neto: 100 Capsulas | Capsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 capsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "assets/images/natural-medix.mp4"
  },
  {
    id: "aguaje-siempre-bella",
    name: "Aguaje Siempre Bella",
    badge: "Estrella",
    fabricado: "Natural Medix (Peru)",
    netContent: "Cont. Neto: 100 Capsulas | Capsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 capsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "assets/images/natural-medix.mp4"
  },
  {
    id: "vitamina-a",
    name: "VITAMINA A",
    badge: "Estrella",
    fabricado: "Natural Medix (Peru)",
    netContent: "Cont. Neto: 100 Capsulas | Capsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 capsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "assets/images/natural-medix.mp4"
  },
   {
    id: "vitamina-c",
    name: "VITAMINA C",
    badge: "Estrella",
    fabricado: "Natural Medix (Peru)",
    netContent: "Cont. Neto: 100 Capsulas | Capsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 capsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "assets/images/natural-medix.mp4"
  },
   {
    id: "vitamina-e-1000-IU",
    name: "VITAMINA E con Selenium de 1000 IU",
    badge: "Estrella",
    fabricado: "Natural encounter (USA)",
    netContent: "Cont. Neto: 100 SOFTGELS",
    invima: "Producto sin registro",
    benefit: "sirve como un potente suplemento antioxidante que protege a las células contra el daño oxidativo, apoya el sistema inmune y cuida la salud de la piel.",
    usage: "Tomar una cápsula blanda al día con la comida principal.",
    price: 38900,
    originalPrice: 55600,
    image: "assets/images/natural-medix.mp4"
  }
];

const APP_VERSION = "1.1.4";
if (localStorage.getItem("app_version") !== APP_VERSION) {
  localStorage.setItem("app_version", APP_VERSION);
  window.location.reload(true); 
}

let cart = JSON.parse(localStorage.getItem("starnatural_cart") || "[]");
let deferredPrompt = null;

// Configuración de Wompi
const WOMPI_PUBLIC_KEY = "pub_prod_hTKZ7t71m1Xue0eFgOc3vSvKTvcUl1gZ"; 
const WOMPI_INTEGRITY_SECRET = "prod_integrity_DcxdEMXNcfNVP0vLgE2RDmIK61d3ldNU";

// URLs de emojis animados
const EMOJIS = {
  fire: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp",
  botella: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/512.webp",
  factory: "https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.webp",
  shield: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.webp",
  calendar: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4c5/512.webp"
  hojas: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f343/512.webp"
};

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();
  setupPWAInstall();
  setupEventListeners();
  setupBackToTop();
});

// --- RENDERIZADO CON BUSCADOR ---
function renderProducts(filterText = "") {
  const container = document.getElementById("product-grid");
  if (!container) return;

  const query = (filterText || "").toLowerCase().trim();

  // Filtrar por nombre, beneficio, fabricante, contenido o invima
  const filteredProducts = PRODUCTS.filter(p => {
    if (!query) return true;
    return (p.name && p.name.toLowerCase().includes(query)) ||
           (p.benefit && p.benefit.toLowerCase().includes(query)) ||
           (p.fabricado && p.fabricado.toLowerCase().includes(query)) ||
           (p.netContent && p.netContent.toLowerCase().includes(query)) ||
           (p.invima && p.invima.toLowerCase().includes(query));
  });

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No se encontraron productos para "${filterText}"</p>
        <p style="font-size: 0.9rem;">Intenta con otros términos como "origen", "vcol" o "colageno".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const ahorro = product.originalPrice - product.price;
    const ahorroFormateado = ahorro > 0 
      ? `<span class="savings-tag"><img src="${EMOJIS.fire}" class="animated-emoji" alt="Fuego"> ¡Ahorras $${ahorro.toLocaleString("es-CO")}!</span>` 
      : '';

    return `
      <div class="product-card">
        ${product.image ? `
          <div class="product-image-wrapper" onclick="openMediaModal('${product.image}', '${product.name}')">
            <video src="${product.image}" autoplay loop muted playsinline class="product-img"></video>
            <span class="expand-badge">👁️ Vista rápida</span>
          </div>
        ` : ''}

        <div class="product-header" style="flex-direction: column; align-items: flex-start; gap: 0.2rem;">
          <div style="font-size:0.8rem; color:#475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
            <img src="${EMOJIS.factory}" class="animated-emoji" alt="Fabricado por"> Fabricado por: ${product.fabricado}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 2px;">
            <h4 class="product-title" style="margin: 0;">${product.name}</h4>
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          </div>
        </div>

        <div style="font-size:0.85rem; color:#334155; margin: 0.8rem 0; line-height: 1.4;">
          <p style="margin-bottom:0.3rem; color:#0f172a; font-weight:600; display: flex; align-items: center; gap: 4px;">
            <img src="${EMOJIS.package}" class="animated-emoji" alt="Contenido"> ${product.netContent}
          </p>
          ${product.benefit ? `<p style="margin-bottom:0.3rem;"><strong>• Beneficio:</strong> ${product.benefit}</p>` : ''}
          <p style="margin-bottom:0.3rem;"><strong>• Modo de Uso:</strong> ${product.usage}</p>

          <div style="display:flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.6rem; font-size:0.8rem; align-items: center;">
            ${product.invima ? `<span style="color:#166534; font-weight:600; display: flex; align-items: center; gap: 4px;"><img src="${EMOJIS.shield}" class="animated-emoji" alt="Escudo"> Invima: ${product.invima}</span>` : ''}
          </div>
        </div>
        
        <div class="price-container">
          <div class="prices-row">
            <span class="product-price">$${product.price.toLocaleString("es-CO")} COP</span>
            <span class="original-price">$${product.originalPrice.toLocaleString("es-CO")}</span>
          </div>
          ${ahorroFormateado}
        </div>

        <div class="product-footer" style="margin-top: 0.8rem;">
          <button class="btn-add-cart" onclick="addToCart('${product.id}')">+ Agregar al Carrito</button>
        </div>
      </div>
    `;
  }).join("");
}

// --- MODAL VISTA RÁPIDA ---
function openMediaModal(src, title) {
  const modal = document.getElementById("image-modal") || document.getElementById("imageModal");
  const modalContent = modal?.querySelector(".image-modal-content");

  if (modal && modalContent) {
    const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");
    
    modalContent.innerHTML = `
      <div class="modal-media-wrapper">
        <button id="close-image-modal" class="modal-close-btn" onclick="closeImageModal()">&times;</button>
        ${isVideo 
          ? `<video src="${src}" autoplay loop muted playsinline class="modal-animated-video"></video>`
          : `<img src="${src}" alt="${title || 'Producto'}" />`
        }
      </div>
    `;
    modal.classList.remove("hidden");
  }
}

function closeImageModal() {
  const modal = document.getElementById("image-modal") || document.getElementById("imageModal");
  if (modal) {
    modal.classList.add("hidden");
    const modalContent = modal.querySelector(".image-modal-content");
    if (modalContent) modalContent.innerHTML = "";
  }
}

// --- LÓGICA DEL CARRITO ---
function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) { 
    existing.qty += 1; 
  } else { 
    const itemToAdd = PRODUCTS.find(p => p.id === productId);
    if (itemToAdd) cart.push({ ...itemToAdd, qty: 1 }); 
  }
  saveAndRefreshCart();
  openCartModal();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { 
    cart = cart.filter(i => i.id !== productId); 
  }
  saveAndRefreshCart();
}

function saveAndRefreshCart() {
  localStorage.setItem("starnatural_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((acc, i) => acc + i.qty, 0);
  const totalPrice = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);

  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  if (cartCountEl) cartCountEl.innerText = totalCount;
  if (cartTotalEl) cartTotalEl.innerText = `$${totalPrice.toLocaleString("es-CO")} COP`;

  const itemsContainer = document.getElementById("cart-items-container");
  if (itemsContainer) {
    if (cart.length === 0) {
  itemsContainer.innerHTML = `
    <div style="text-align: center; color: #64748b; padding: 2rem 1rem;">
      <img src="${EMOJIS.cart}" class="animated-emoji" alt="Carrito vacío" style="width: 64px; height: 64px; margin-bottom: 0.5rem;">
      <p style="font-size: 1rem; font-weight: 600; margin: 0;">Tu carrito está vacío</p>
      <p style="font-size: 0.85rem; margin-top: 4px;">Agrega productos para comenzar tu compra.</p>
    </div>
  `;
} else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div>
            <div style="font-weight:700;">${item.name}</div>
            <div style="font-size:0.85rem; color:#64748b;">$${(item.price * item.qty).toLocaleString("es-CO")} COP</div>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `).join("");
    }
  }
}

function openCartModal() { document.getElementById("cart-modal")?.classList.remove("hidden"); }
function closeCartModal() { document.getElementById("cart-modal")?.classList.add("hidden"); }

// --- ESCUCHADORES DE EVENTOS Y BUSCADOR ---
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

// --- PASARELA DE PAGO WOMPI ---
async function generateIntegritySignature(reference, amountInCents, currency, secret) {
  const cadenaConcatenada = `${reference}${amountInCents}${currency}${secret}`;
  const encondedText = new TextEncoder().encode(cadenaConcatenada);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleWompiCheckout() {
  if (cart.length === 0) {
    alert("Agrega al menos un producto al carrito.");
    return;
  }

  const name = document.getElementById("customer-name")?.value.trim() || "";
  const idNum = document.getElementById("customer-id")?.value.trim() || "";
  const email = document.getElementById("customer-email")?.value.trim() || "";
  const phone = document.getElementById("customer-phone")?.value.trim() || "";
  const city = document.getElementById("customer-city")?.value.trim() || "";
  const address = document.getElementById("customer-address")?.value.trim() || "";
  const notes = document.getElementById("customer-notes")?.value.trim() || "";

  if (!name || !idNum || !email || !phone || !city || !address) {
    alert("Por favor completa todos los datos de envío (Nombre, CC/NIT, Correo, Teléfono, Ciudad y Dirección).");
    return;
  }

  if (typeof WidgetCheckout === 'undefined') {
    alert("El sistema de Wompi no se cargó correctamente. Revisa tu conexión.");
    return;
  }

  const totalPrice = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const amountInCents = Math.round(totalPrice * 100);
  const currency = "COP";
  const reference = `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderSummary = cart.map(i => `• ${i.name} (x${i.qty}) - $${(i.price * i.qty).toLocaleString("es-CO")}`).join("\n");

  try {
    const signature = await generateIntegritySignature(reference, amountInCents, currency, WOMPI_INTEGRITY_SECRET);

    const checkout = new WidgetCheckout({
      currency: currency,
      amountInCents: amountInCents,
      reference: reference,
      publicKey: WOMPI_PUBLIC_KEY,
      signature: { integrity: signature },
      customerData: {
        email: email,
        fullName: name,
        phoneNumber: phone,
        phoneNumberPrefix: '+57',
        legalId: idNum,
        legalIdType: 'CC'
      }
    });

checkout.open(function ( result ) {
  const transaction = result.transaction;

  if (transaction.status === 'APPROVED') {
    const referenceId = transaction.id || reference;
    
    // 1. Construir resumen para WhatsApp
    const orderSummary = cart.map(i => 
      `• *${i.name}* (x${i.qty}) - $${(i.price * i.qty).toLocaleString("es-CO")}\n` +
      `   - Fabricado por: ${i.fabricado || 'N/A'}\n` +
      `   - Contenido: ${i.netContent || 'N/A'}\n` +
      `   - Invima: ${i.invima || 'N/A'}`
    ).join("\n\n");

    const message = 
`✅ *¡NUEVO PEDIDO PAGADO EN NATURAL MEDIX!*
----------------------------------
📌 *Referencia Wompi:* ${referenceId}
💰 *Monto Pagado:* $${totalPrice.toLocaleString("es-CO")} COP

🛒 *DETALLE DE PRODUCTOS:*
${orderSummary}

👤 *DATOS DE ENVÍO:*
• *Nombre:* ${name}
• *CC/NIT:* ${idNum}
• *Teléfono:* ${phone}
• *Ciudad:* ${city}
• *Dirección:* ${address}
${notes ? `• *Notas:* ${notes}` : ''}`;

    const whatsappUrl = `https://wa.me/573027109685?text=${encodeURIComponent(message)}`;

    // 2. Desplegar la pantalla interna de respaldo
    showOrderReceipt({
      ref: referenceId,
      total: totalPrice,
      cart: [...cart],
      customer: { name, idNum, email, phone, city, address, notes },
      whatsappUrl: whatsappUrl
    });

    // 3. Limpiar carrito y cerrar modal del checkout
    cart = [];
    saveAndRefreshCart();
    closeCartModal();

  } else if (transaction.status === 'DECLINED') {
    alert("La transacción fue rechazada por la entidad financiera.");
  }
});

  } catch (error) {
    console.error("Error al generar la firma de Wompi:", error);
    alert("Error al preparar la transacción. Intenta de nuevo.");
  }
}

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
// --- FUNCIONES DEL MODAL DE CONFIRMACIÓN / RECIBO ---
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

  // Asignar enlace directo de WhatsApp al botón opcional
  const btnWa = document.getElementById("btn-whatsapp-copy");
  if (btnWa) {
    btnWa.href = data.whatsappUrl;
  }

  modal.classList.remove("hidden");
}

function closeReceiptModal() {
  document.getElementById("receipt-modal")?.classList.add("hidden");
}
