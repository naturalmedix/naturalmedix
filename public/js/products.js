/* ==========================================
   CATÁLOGO DE PRODUCTOS Y RENDERIZADO
   ========================================== */

const PRODUCTS = [
  {
    id: "origen_30_comprimidos",
    name: "ORIGEN Natural 30 Comprimidos",
    badge: "Línea ORIGEN Natural",
    laboratorio: "ORIGEN Natural",
    netContent: "Cont. Neto: Frasco x 30 Comprimidos (30 Porciones)",
    netWeight: 18,
    invima: "PSA-0005343-2024",
    price: 30000,
    originalPrice: 42900,
    minimumOrderQuantity: 1,
    priceTiers: [
      { minimumQuantity: 1, price: 30000, label: "Detal" }
    ],
    image: "/images/origen_30_comprimidos.mp4",
    modalVideo: "/videos/origen-natural-720-1280.mp4",
    badges: [
      { text: "Producto Más Vendido", bg: "badge-purple", icon: "https://aimg.kwcdn.com/upload_aimg/pho/05f39254-a4b9-4289-9174-56337e13689e.png.slim.png" },
      { text: "Marca ORIGEN Natural™", bg: "badge-teal", icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.webp" },
      { text: "30 Porciones Rendidoras", bg: "badge-green", icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.webp" }
    ]
  },

  {
    id: "origen-15-discos",
    name: "ORIGEN Natural 15 Discos Comprimidos",
    badge: "Línea ORIGEN Natural",
    laboratorio: "Star Natural",
    netContent: "Cont. Neto: Frasco x 15 Comprimidos (15 Porciones)",
    netWeight: 9,
    invima: "PSA-0005343-2024",
    price: 18000,
    originalPrice: 42900,
    minimumOrderQuantity: 1,
    priceTiers: [
      { minimumQuantity: 1, price: 18000, label: "Detal" }
    ],
    image: "/images/origen-15-discos.mp4",
    modalVideo: "/videos/origen-15-discos-720-1280.mp4",
    badges: [
      { text: "Producto Más Vendido", bg: "badge-purple", icon: "https://aimg.kwcdn.com/upload_aimg/pho/05f39254-a4b9-4289-9174-56337e13689e.png.slim.png" },
      { text: "Marca ORIGEN Natural™", bg: "badge-teal", icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.webp" },
      { text: "30 Porciones Rendidoras", bg: "badge-green", icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.webp" }
    ]
  }
];

const EMOJIS = {
  fire: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp",
  package: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/512.webp",
  factory: "https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.webp",
  shield: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.webp",
  calendar: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4c5/512.webp",
  cart: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f6d2/512.webp"
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

/**
 * Devuelve el nivel de precio aplicable según la cantidad.
 * Se elige siempre el nivel con el mayor minimumQuantity que no supere qty.
 */
function getPriceTier(product, qty = 1) {
  const quantity = Math.max(1, Number(qty) || 1);
  const tiers = Array.isArray(product?.priceTiers) && product.priceTiers.length
    ? product.priceTiers
    : [{ minimumQuantity: 1, price: Number(product?.price) || 0, label: "Detal" }];

  return [...tiers]
    .filter(tier => Number(tier.minimumQuantity) <= quantity && Number(tier.price) >= 0)
    .sort((a, b) => Number(b.minimumQuantity) - Number(a.minimumQuantity))[0]
    || tiers.slice().sort((a, b) => Number(a.minimumQuantity) - Number(b.minimumQuantity))[0];
}

function getProductUnitPrice(product, qty = 1) {
  const tier = getPriceTier(product, qty);
  return Number(tier?.price ?? product?.price ?? 0);
}

function getMinimumOrderQuantity(product) {
  return Math.max(1, Number(product?.minimumOrderQuantity) || 1);
}

function formatPriceTierSummary(product) {
  const tiers = Array.isArray(product?.priceTiers)
    ? [...product.priceTiers].sort((a, b) => Number(a.minimumQuantity) - Number(b.minimumQuantity))
    : [];

  if (tiers.length <= 1) return '';

  return `<div class="product-price-tiers">${tiers.map((tier, index) => {
    const next = tiers[index + 1];
    const from = Number(tier.minimumQuantity);
    const to = next ? Number(next.minimumQuantity) - 1 : null;
    const range = to ? `${from}–${to} uds.` : `Desde ${from} uds.`;
    return `<span><strong>${escapeHTML(range)}</strong>: ${currencyFormatter.format(Number(tier.price))}</span>`;
  }).join('')}</div>`;
}

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[match]);
}

function renderProducts(filterText = "") {
  const container = document.getElementById("product-grid");
  if (!container) return;

  const query = (filterText || "").toLowerCase().trim();

  const filteredProducts = PRODUCTS.filter(p => {
    if (!query) return true;
    return (p.name && p.name.toLowerCase().includes(query)) ||
           (p.benefit && p.benefit.toLowerCase().includes(query)) ||
           (p.laboratorio && p.laboratorio.toLowerCase().includes(query)) ||
           (p.netContent && p.netContent.toLowerCase().includes(query)) ||
           (p.invima && p.invima.toLowerCase().includes(query));
  });

  if (filteredProducts.length === 0) {
    const safeFilterText = escapeHTML(filterText);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No se encontraron productos para "${safeFilterText}"</p>
        <p style="font-size: 0.9rem;">Intenta con otros términos como "origen", "vcol" o "colageno".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const ahorro = product.originalPrice - product.price;
    const ahorroFormateado = ahorro > 0 
      ? `<span class="savings-tag"><img src="${EMOJIS.fire}" class="animated-emoji" alt="Fuego"> ¡Ahorras ${currencyFormatter.format(ahorro)}!</span>` 
      : '';

    const isVideo = product.image && product.image.toLowerCase().endsWith('.mp4');

    const rawBadges = (product.badges || []).map(b => `
      <div class="badge-item ${b.bg}">
        <img src="${b.icon}" alt="" aria-hidden="true" width="16" height="16">
        <span>${escapeHTML(b.text)}</span>
      </div>
    `).join("");

    const badgesList = rawBadges + rawBadges;

    return `
      <article class="product-card">
        <div class="product-image-wrapper">
          ${
            isVideo
              ? `<video src="${product.image}" autoplay loop muted playsinline controlsList="nodownload noplaybackrate" disablePictureInPicture oncontextmenu="return false" class="..."></video>`
              : `<img src="${product.image}" alt="${escapeHTML(product.name)}" class="product-img" loading="lazy" />`
          }
          
          <button type="button" class="btn-quick-view-circular" onclick="openQuickView('${product.id}')" aria-label="Vista Rápida de ${escapeHTML(product.name)}">
            <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f441/512.webp" alt="Ojo" class="quick-view-eye-icon" />
          </button>
        </div>

        <div class="product-header" style="flex-direction: column; align-items: flex-start; gap: 0.2rem;">
          <div style="font-size:0.8rem; color:#475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
            <img src="${EMOJIS.factory}" class="animated-emoji" alt="" aria-hidden="true"> Laboratorio: ${escapeHTML(product.laboratorio)}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 2px;">
            <h4 class="product-title" style="margin: 0;">${escapeHTML(product.name)}</h4>
            ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ''}
          </div>
        </div>

          <div style="display:flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.6rem; font-size:0.8rem; align-items: center;">
            ${product.invima ? `<span style="color:#166534; font-weight:600; display: flex; align-items: center; gap: 4px;"><img src="${EMOJIS.shield}" class="animated-emoji" alt="" aria-hidden="true"> Invima: ${escapeHTML(product.invima)}</span>` : ''}
          </div>
        </div>
        
        <div class="price-container">
  <div class="prices-row">
    <span class="product-price" data-product-price="${product.id}">${currencyFormatter.format(getProductUnitPrice(product, ((window.cart || []).find(i => i.id === product.id)?.qty || 1)))} COP</span>
    <span class="original-price">${currencyFormatter.format(product.originalPrice)}</span>
  </div>

  ${formatPriceTierSummary(product)}

  ${product.netWeight > 0 ? `
    <div class="product-pum" id="product-pum-${product.id}">
      PUM: Gramo a ${currencyFormatter.format(getProductUnitPrice(product, ((window.cart || []).find(i => i.id === product.id)?.qty || 1)) / product.netWeight)}
    </div>
  ` : ''}

  ${ahorroFormateado}
</div>

        ${rawBadges ? `
          <div class="product-slider-badge-container">
            <div class="product-slider-badge-track">
              ${badgesList}
            </div>
          </div>
        ` : ''}

        <div class="product-footer product-cart-controls" style="margin-top: 0.4rem;">
  <button
    type="button"
    class="qty-btn qty-minus"
    onclick="changeProductQty('${product.id}', -1)"
    aria-label="Disminuir cantidad"
  >−</button>

  <span
    class="qty-value"
    id="product-qty-${product.id}"
  >${(() => {
    const cartItem = (window.cart || []).find(i => i.id === product.id);
    return cartItem ? cartItem.qty : 0;
  })()}</span>

  <button
    type="button"
    class="qty-btn qty-plus"
    onclick="changeProductQty('${product.id}', 1)"
    aria-label="Aumentar cantidad"
  >+</button>
</div>

<div
  class="product-subtotal"
  id="product-subtotal-${product.id}"
  style="margin-top: 0.4rem; font-size: 0.85rem; font-weight: 700; color: #0d9488; text-align: center;"
>
  Subtotal: ${(() => {
    const cartItem = (window.cart || []).find(i => i.id === product.id);
    const qty = cartItem ? cartItem.qty : 0;
    return currencyFormatter.format(getProductUnitPrice(product, qty) * qty);
  })()} COP
</div>
      </article>
    `;
  }).join("");
}

function changeProductQty(productId, delta) {
  updateQty(productId, delta);

  const item = (window.cart || []).find(i => i.id === productId);
  const qty = item ? item.qty : 0;

  const element = document.getElementById(`product-qty-${productId}`);

  if (element) {
    element.textContent = qty;
  }

  // Actualizar subtotal de la tarjeta
  const subtotalElement =
    document.getElementById(`product-subtotal-${productId}`);

  if (subtotalElement) {
    const product = (window.PRODUCTS || []).find(
      p => p.id === productId
    );

    if (product) {
      const unitPrice = getProductUnitPrice(product, Math.max(qty, 1));
      subtotalElement.textContent =
        `Subtotal: ${currencyFormatter.format(unitPrice * qty)} COP`;

      const cardPrice = document.querySelector(`.product-card [data-product-price="${product.id}"]`);
      if (cardPrice) cardPrice.textContent = `${currencyFormatter.format(unitPrice)} COP`;

      const pum = document.getElementById(`product-pum-${product.id}`);
      if (pum && product.netWeight > 0) {
        pum.textContent = `PUM: Gramo a ${currencyFormatter.format(unitPrice / product.netWeight)}`;
      }
    }
  }
}

function changeModalProductQty(productId, delta) {
  updateQty(productId, delta);

  const item = (window.cart || []).find(i => i.id === productId);
  const qty = item ? item.qty : 0;

  // Actualizar cantidad en la vista previa
  const modalElement =
    document.getElementById(`modal-product-qty-${productId}`);

  if (modalElement) {
    modalElement.textContent = qty;
  }

  // Actualizar cantidad en la tarjeta principal
  const productElement =
    document.getElementById(`product-qty-${productId}`);

  if (productElement) {
    productElement.textContent = qty;
  }
}

/* ==========================================
   LÓGICA DEL MODAL (VIDEO VERTICAL 9:16)
   ========================================== */

function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("image-modal");
  if (!modal) return;

  const videoSrc = product.modalVideo;

console.log("VIDEO MODAL FORZADO:", videoSrc);
  const isVideo = videoSrc && videoSrc.toLowerCase().endsWith('.mp4');

  modal.innerHTML = `
    <div class="modal-content product-detail-modal">
      <button type="button" class="close-btn" onclick="closeQuickView()" aria-label="Cerrar vista rápida">&times;</button>
      
      <!-- CONTENEDOR ESPECÍFICO 9:16 VERTICAL -->
      <div class="modal-video-wrapper">
        ${
          isVideo
            ? `<video id="modal-video-player" src="${videoSrc}" autoplay loop muted playsinline controlsList="nodownload noplaybackrate" disablePictureInPicture oncontextmenu="return false" class="modal-vertical-media"></video>`
            : `<img src="${product.image}" alt="${escapeHTML(product.name)}" class="modal-vertical-media" />`
        }
      </div>

      <div class="modal-product-info">
        <span class="product-badge" style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${escapeHTML(product.badge || 'Producto')}</span>
        <h3 style="margin: 0.5rem 0; color: #0f172a;">${escapeHTML(product.name)}</h3>
        <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.4rem;"><strong>Laboratorio:</strong> ${escapeHTML(product.laboratorio)}</p>
        <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.4rem;"><strong>Contenido:</strong> ${escapeHTML(product.netContent)}</p>
        <p style="font-size: 0.85rem; color: #334155; margin-bottom: 0.4rem;"><strong>Beneficio:</strong> ${escapeHTML(product.benefit)}</p>
        <p style="font-size: 0.85rem; color: #334155; margin-bottom: 0.8rem;"><strong>Modo de Uso:</strong> ${escapeHTML(product.usage)}</p>
        
        <div style="
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
">
  <div>
    <span style="font-size: 1.2rem; font-weight: bold; color: #0d9488;">
      ${currencyFormatter.format(getProductUnitPrice(product, ((window.cart || []).find(i => i.id === product.id)?.qty || 1)))} COP
    </span>
    ${
      product.netWeight > 0
        ? `<div style="
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f766e;
  background: #ecfdf5;
  border-left: 3px solid #14b8a6;
  padding: 4px 8px;
  margin-top: 5px;
  border-radius: 5px;
  display: inline-block;
  white-space: nowrap;
">
            PUM: Gramo a ${currencyFormatter.format(getProductUnitPrice(product, ((window.cart || []).find(i => i.id === product.id)?.qty || 1)) / product.netWeight)}
          </div>`
        : ''
    }
  </div>
          <div class="modal-cart-controls">
  <button
    type="button"
    class="qty-btn qty-minus"
    onclick="changeModalProductQty('${product.id}', -1)"
    aria-label="Disminuir cantidad"
  >−</button>

  <span
  class="qty-value"
  id="modal-product-qty-${product.id}"
>${(() => {
  const cartItem = (window.cart || []).find(i => i.id === product.id);
  return cartItem ? cartItem.qty : 0;
})()}</span>

  <button
    type="button"
    class="qty-btn qty-plus"
    onclick="changeModalProductQty('${product.id}', 1)"
    aria-label="Aumentar cantidad"
  >+</button>
</div>

<div
  class="modal-product-subtotal"
  id="modal-product-subtotal-${product.id}"
  style="margin-top: 0.5rem; padding: 5px 9px; font-size: 0.82rem; font-weight: 800; color: #0f766e; background: rgba(204, 251, 241, 0.95); border: 1px solid rgba(13, 148, 136, 0.35); border-radius: 8px; text-align: center; line-height: 1.25; box-shadow: 0 2px 6px rgba(15, 118, 110, 0.12);"
>
  Subtotal: ${(() => {
    const cartItem = (window.cart || []).find(i => i.id === product.id);
    const qty = cartItem ? cartItem.qty : 0;
    return currencyFormatter.format(getProductUnitPrice(product, qty) * qty);
  })()} COP
</div>

</div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("active");
  modal.style.display = "flex";

  const modalVideo = document.getElementById("modal-video-player");
  if (modalVideo) {
    modalVideo.play().catch(() => {
      /* Prevención de bloqueo Autoplay en iOS / Android */
    });
  }
}

function closeQuickView() {
  const modal = document.getElementById("image-modal");
  if (!modal) return;

  const video = modal.querySelector("video");
  if (video) {
    video.pause();
    video.currentTime = 0;
  }

  modal.classList.add("hidden");
  modal.classList.remove("active");
  modal.style.display = "none";
}

function syncProductQtyDisplays() {
  const products = PRODUCTS || [];

  products.forEach(product => {
    const cartItem =
      (window.cart || []).find(item => item.id === product.id);

    const qty = cartItem ? cartItem.qty : 0;

    // Actualizar cantidad en la tarjeta
    const productElement =
      document.getElementById(`product-qty-${product.id}`);

    if (productElement) {
      productElement.textContent = qty;
    }

    // Actualizar cantidad en la vista previa
    const modalElement =
      document.getElementById(`modal-product-qty-${product.id}`);

    if (modalElement) {
      modalElement.textContent = qty;
    }

    // Actualizar subtotal de la tarjeta
    const productSubtotal =
      document.getElementById(`product-subtotal-${product.id}`);

    if (productSubtotal) {
      productSubtotal.textContent =
        `Subtotal: ${currencyFormatter.format(getProductUnitPrice(product, Math.max(qty, 1)) * qty)} COP`;
    }

    const cardPrice = document.querySelector(`.product-card [data-product-price="${product.id}"]`);
    if (cardPrice) {
      cardPrice.textContent = `${currencyFormatter.format(getProductUnitPrice(product, Math.max(qty, 1)))} COP`;
    }

    const pum = document.getElementById(`product-pum-${product.id}`);
    if (pum && product.netWeight > 0) {
      pum.textContent = `PUM: Gramo a ${currencyFormatter.format(getProductUnitPrice(product, Math.max(qty, 1)) / product.netWeight)}`;
    }

    // Actualizar subtotal de la vista previa
    const modalSubtotal =
      document.getElementById(`modal-product-subtotal-${product.id}`);

    if (modalSubtotal) {
      modalSubtotal.textContent =
        `Subtotal: ${currencyFormatter.format(getProductUnitPrice(product, Math.max(qty, 1)) * qty)} COP`;
    }
  });
}



window.getPriceTier = getPriceTier;
window.getProductUnitPrice = getProductUnitPrice;
window.getMinimumOrderQuantity = getMinimumOrderQuantity;

/**
 * Intenta cargar el catálogo autoritativo desde D1 mediante /api/products.
 * Si la API todavía no está desplegada, conserva el catálogo local como fallback.
 */
async function loadProductsFromAPI() {
  try {
    const response = await fetch('/api/products', { headers: { accept: 'application/json' } });
    if (!response.ok) return false;
    const payload = await response.json();
    if (!Array.isArray(payload.products) || !payload.products.length) return false;

    const normalized = payload.products.map(product => ({
      ...product,
      price: Number(product.priceTiers?.[0]?.price ?? product.price ?? 0),
      originalPrice: Number(product.original_price ?? product.originalPrice ?? 0),
      minimumOrderQuantity: Number(product.minimumOrderQuantity ?? product.minimum_order_quantity ?? 1),
      netWeight: Number(product.netWeight ?? product.net_weight_g ?? 0),
      image: product.videoUrl || product.video_url || product.image || product.images?.[0] || '',
      modalVideo: product.videoUrl || product.video_url || product.modalVideo || '',
      badges: Array.isArray(product.badges) ? product.badges : []
    }));

    PRODUCTS.splice(0, PRODUCTS.length, ...normalized);
    window.PRODUCTS = PRODUCTS;
    return true;
  } catch (error) {
    console.warn('No fue posible cargar el catálogo desde D1; se usa el catálogo local.', error);
    return false;
  }
}

window.PRODUCTS = PRODUCTS;
window.loadProductsFromAPI = loadProductsFromAPI;
window.renderProducts = renderProducts;
window.changeProductQty = changeProductQty;
window.changeModalProductQty = changeModalProductQty;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.syncProductQtyDisplays = syncProductQtyDisplays;

