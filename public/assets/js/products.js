/* ==========================================
   CATÁLOGO DE PRODUCTOS Y RENDERIZADO
   ========================================== */

const PRODUCTS = [
  {
    id: "aguaje-pawer",
    name: "AGUAJE Pawer",
    badge: "Estrella",
    fabricado: "StarNatural (Perú)",
    netContent: "Cont. Neto: 100 Cápsulas | Cápsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 cápsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "public/assets/images/natural-medix.mp4"
  },
  {
    id: "aguaje-plus",
    name: "Aguaje Plus",
    badge: "Estrella",
    fabricado: "StarNatural (Perú)",
    netContent: "Cont. Neto: 100 Cápsulas | Cápsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 cápsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "public/assets/images/natural-medix.mp4"
  },
  {
    id: "aguaje-hinojo",
    name: "Aguaje Hinojo",
    badge: "Estrella",
    fabricado: "StarNatural (Perú)",
    netContent: "Cont. Neto: 100 Cápsulas | Cápsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 cápsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "public/assets/images/natural-medix.mp4"
  },
  {
    id: "aguaje-siempre-bella",
    name: "Aguaje Siempre Bella",
    badge: "Estrella",
    fabricado: "StarNatural (Perú)",
    netContent: "Cont. Neto: 100 Cápsulas | Cápsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 cápsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "public/assets/images/natural-medix.mp4"
  },
  {
    id: "vitamina-a",
    name: "VITAMINA A",
    badge: "Estrella",
    fabricado: "StarNatural (Perú)",
    netContent: "Cont. Neto: 100 Cápsulas | Cápsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 cápsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "public/assets/images/natural-medix.mp4"
  },
  {
    id: "vitamina-c",
    name: "VITAMINA C",
    badge: "Estrella",
    fabricado: "StarNatural (Perú)",
    netContent: "Cont. Neto: 100 Cápsulas | Cápsula 500mg.",
    invima: "Producto sin registro",
    benefit: "Regenera articulaciones, fortalece cabello, uñas y elasticidad de la piel.",
    usage: "Tomar 3 cápsulas diarias, una cada media hora antes de las comidas.",
    price: 11000,
    originalPrice: 22000,
    image: "public/assets/images/natural-medix.mp4"
  },
  {
    id: "vitamina-e-1000-IU",
    name: "VITAMINA E con Selenium de 1000 IU",
    badge: "Estrella",
    fabricado: "Natural Encounter (USA)",
    netContent: "Cont. Neto: 100 SOFTGELS",
    invima: "Producto sin registro",
    benefit: "Potente suplemento antioxidante que protege las células contra el daño oxidativo, apoya el sistema inmune y cuida la salud de la piel.",
    usage: "Tomar una cápsula blanda al día con la comida principal.",
    price: 38900,
    originalPrice: 55600,
    image: "public/assets/images/natural-medix.mp4"
  }
];

// URLs de emojis animados Noto Emoji
const EMOJIS = {
  fire: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp",
  package: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/512.webp",
  factory: "https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.webp",
  shield: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.webp",
  calendar: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4c5/512.webp",
  cart: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f6d2/512.webp"
};

/**
 * Escapa caracteres HTML de forma segura incluyendo comillas simples
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderProducts(filterText = "") {
  const container = document.getElementById("product-grid");
  if (!container) return;

  const rawQuery = (filterText || "").toLowerCase().trim();
  const searchTokens = rawQuery.split(/\s+/).filter(Boolean);

  const filteredProducts = PRODUCTS.filter(p => {
    if (searchTokens.length === 0) return true;

    const searchableContent = [
      p.name,
      p.benefit,
      p.fabricado,
      p.netContent,
      p.invima,
      p.usage
    ].filter(Boolean).join(" ").toLowerCase();

    // Comprueba que todos los términos buscados estén presentes
    return searchTokens.every(token => searchableContent.includes(token));
  });

  if (filteredProducts.length === 0) {
    const safeQuery = escapeHTML(filterText);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: #64748b;">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No se encontraron productos para "${safeQuery}"</p>
        <p style="font-size: 0.9rem;">Intenta con otros términos como "vitamina", "aguaje" o "salud".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const numPrice = Number(product.price) || 0;
    const numOriginalPrice = Number(product.originalPrice) || 0;
    const ahorro = numOriginalPrice - numPrice;

    const ahorroFormateado = ahorro > 0 
      ? `<span class="savings-tag"><img src="${EMOJIS.fire}" class="animated-emoji" alt="Ahorro"> ¡Ahorras $${ahorro.toLocaleString("es-CO")}!</span>` 
      : '';

    // Detección de tipo de medio (video vs imagen)
    const mediaPath = product.image || '';
    const isVideo = mediaPath.endsWith('.mp4') || mediaPath.endsWith('.webm');

    // Se configura preload="metadata" para no saturar el rendimiento con vídeos simultáneos
    const mediaHtml = isVideo
      ? `<video src="${mediaPath}" autoplay loop muted playsinline preload="metadata" class="product-img"></video>`
      : `<img src="${mediaPath}" alt="${escapeHTML(product.name)}" class="product-img" loading="lazy" />`;

    const safeId = escapeHTML(product.id);
    const safeName = escapeHTML(product.name);
    const safeFabricado = escapeHTML(product.fabricado || 'StarNatural');
    const safeNetContent = escapeHTML(product.netContent || '');
    const safeBenefit = product.benefit ? escapeHTML(product.benefit) : '';
    const safeUsage = escapeHTML(product.usage || '');
    const safeInvima = product.invima ? escapeHTML(product.invima) : '';

    return `
      <div class="product-card">
        ${product.image ? `
          <div class="product-image-wrapper" onclick="openMediaModal('${escapeHTML(product.image)}', '${safeName}')">
            ${mediaHtml}
            <span class="expand-badge">👁️ Vista rápida</span>
          </div>
        ` : ''}

        <div class="product-header" style="flex-direction: column; align-items: flex-start; gap: 0.2rem;">
          <div style="font-size:0.8rem; color:#475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
            <img src="${EMOJIS.factory}" class="animated-emoji" alt="Fabricado por"> Fabricado por: ${safeFabricado}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 2px;">
            <h4 class="product-title" style="margin: 0;">${safeName}</h4>
            ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ''}
          </div>
        </div>

        <div style="font-size:0.85rem; color:#334155; margin: 0.8rem 0; line-height: 1.4;">
          <p style="margin-bottom:0.3rem; color:#0f172a; font-weight:600; display: flex; align-items: center; gap: 4px;">
            <img src="${EMOJIS.package}" class="animated-emoji" alt="Contenido"> ${safeNetContent}
          </p>
          ${safeBenefit ? `<p style="margin-bottom:0.3rem;"><strong>• Beneficio:</strong> ${safeBenefit}</p>` : ''}
          ${safeUsage ? `<p style="margin-bottom:0.3rem;"><strong>• Modo de Uso:</strong> ${safeUsage}</p>` : ''}

          <div style="display:flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.6rem; font-size:0.8rem; align-items: center;">
            ${safeInvima ? `<span style="color:#166534; font-weight:600; display: flex; align-items: center; gap: 4px;"><img src="${EMOJIS.shield}" class="animated-emoji" alt="Escudo"> Invima: ${safeInvima}</span>` : ''}
          </div>
        </div>
        
        <div class="price-container">
          <div class="prices-row">
            <span class="product-price">$${numPrice.toLocaleString("es-CO")} COP</span>
            ${numOriginalPrice > numPrice ? `<span class="original-price">$${numOriginalPrice.toLocaleString("es-CO")}</span>` : ''}
          </div>
          ${ahorroFormateado}
        </div>

        <div class="product-footer" style="margin-top: 0.8rem;">
          <button class="btn-add-cart" onclick="addToCart('${safeId}')">+ Agregar al Carrito</button>
        </div>
      </div>
    `;
  }).join("");
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});
