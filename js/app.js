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
  }
];

let cart = JSON.parse(localStorage.getItem("naturalmedix_cart") || "[]");
let deferredPrompt = null;

// Configuración de Wompi
const WOMPI_PUBLIC_KEY = "pub_prod_hTKZ7t71m1Xue0eFgOc3vSvKTvcUl1gZ"; 
const WOMPI_INTEGRITY_SECRET = "prod_integrity_DcxdEMXNcfNVP0vLgE2RDmIK61d3ldNU";

// URLs de emojis animados
const EMOJIS = {
  fire: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp",
  package: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/512.webp",
  factory: "https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.webp",
  shield: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.webp",
  calendar: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4c5/512.webp"
};

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();
  setupPWAInstall();
  setupEventListeners();
  setupBackToTop();
});

function renderProducts() {
  const container = document.getElementById("product-grid");
  if (!container) return;

  container.innerHTML = PRODUCTS.map(product => {
    const ahorro = product.originalPrice - product.price;
    const ahorroFormateado = ahorro > 0 
      ? `<span class="savings-tag"><img src="${EMOJIS.fire}" class="animated-emoji" alt="Fuego"> ¡Ahorras $${ahorro.toLocaleString("es-CO")}!</span>` 
      : '';

    return `
<div class="product-card">
    <div class="product-image-wrapper">
      <img src="${product.image}" alt="${product.title}" class="product-img" />
      <span class="expand-badge">👁️ Vista rápida</span>
    </div>
    <!-- Resto del contenido de la tarjeta -->
  </div>
`;
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

// --- MODAL DE REPRODUCCIÓN EN PANTALLA COMPLETA 9:16 ---
function openMediaModal(src, title) {
  const modal = document.getElementById("image-modal");
  const modalContent = document.querySelector(".image-modal-content");
  const modalCaption = document.getElementById("modal-img-caption");

  if (modal && modalContent) {
    modalContent.innerHTML = `
      <div class="modal-media-wrapper">
        <video src="${src}" autoplay loop muted playsinline></video>
      </div>
    `;
    if (modalCaption) modalCaption.innerText = title || "";
    modal.classList.remove("hidden");
  }
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.classList.add("hidden");
    const modalContent = document.querySelector(".image-modal-content");
    if (modalContent) modalContent.innerHTML = ""; // Limpia el video al cerrar para ahorrar consumo de memoria
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
  localStorage.setItem("naturalmedix_cart", JSON.stringify(cart));
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
      itemsContainer.innerHTML = `<p style="text-align:center; color:#64748b; padding:1rem;">Tu carrito está vacío</p>`;
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

function setupEventListeners() {
  document.getElementById("cart-icon-btn")?.addEventListener("click", openCartModal);
  document.getElementById("close-cart-btn")?.addEventListener("click", closeCartModal);
  document.getElementById("btn-wompi-pay")?.addEventListener("click", handleWompiCheckout);
  document.getElementById("close-image-modal")?.addEventListener("click", closeImageModal);
  
  const imageModal = document.getElementById("image-modal");
  if (imageModal) {
    imageModal.addEventListener("click", (e) => {
      if (e.target === imageModal) closeImageModal();
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
      },
      redirectUrl: 'https://naturalmedix.app/'
    });

    checkout.open(function ( result ) {
      const transaction = result.transaction;
      if (transaction.status === 'APPROVED') {
        const message = 
`✅ *¡NUEVO PEDIDO PAGADO EN Natural Medix!*
----------------------------------
📌 *Referencia Wompi:* ${transaction.id || reference}
💰 *Monto Pagado:* $${totalPrice.toLocaleString("es-CO")} COP

🛒 *PRODUCTOS:*
${orderSummary}

👤 *DATOS DE ENVÍO Y FACTURACIÓN:*
• *Nombre/Razón Social:* ${name}
• *CC / NIT:* ${idNum}
• *Correo:* ${email}
• *Teléfono:* ${phone}
• *Ciudad:* ${city}
• *Dirección:* ${address}
${notes ? `• *Notas:* ${notes}` : ''}

----------------------------------
_Pago verificado exitosamente vía Wompi._`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/573027109685?text=${encodedMessage}`;

        alert(`¡Pago Aprobado con éxito! Presiona Aceptar para enviar la confirmación de envío por WhatsApp.`);
        
        cart = [];
        saveAndRefreshCart();
        closeCartModal();

        window.open(whatsappUrl, '_blank');
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
