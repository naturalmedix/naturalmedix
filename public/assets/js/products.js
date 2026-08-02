/* ==========================================
   CATÁLOGO DE PRODUCTOS Y RENDERIZADO
   ========================================== */

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
    image: "public/assets/images/natural-medix.mp4"
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
    image: "public/assets/images/natural-medix.mp4"
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
    image: "public/assets/images/natural-medix.mp4"
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
    image: "public/assets/images/natural-medix.mp4"
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
    image: "public/assets/images/natural-medix.mp4"
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
    image: "public/assets/images/natural-medix.mp4"
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
    image: "public/assets/images/natural-medix.mp4"
  }
];

// URLs de emojis animados
const EMOJIS = {
  fire: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp",
  package: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/512.webp",
  factory: "https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/512.webp",
  shield: "https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.webp",
  calendar: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4c5/512.webp",
  cart: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f6d2/512.webp"
};

function renderProducts(filterText = "") {
  const container = document.getElementById("product-grid");
  if (!container) return;

  const query = (filterText || "").toLowerCase().trim();

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
