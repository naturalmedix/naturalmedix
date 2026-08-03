/* ==========================================
   GESTIÓN Y ESTADO DEL CARRITO DE COMPRAS
   ========================================== */

let cart = [];

// Carga inicial segura desde localStorage
try {
  const savedCart = localStorage.getItem("starnatural_cart");
  cart = savedCart ? JSON.parse(savedCart) : [];
} catch (e) {
  console.warn("[Cart] Error al leer el carrito desde localStorage, reiniciando:", e);
  cart = [];
}

/**
 * Función auxiliar para escapar strings y prevenir ataques XSS
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

/**
 * Agrega un producto al carrito o incrementa su cantidad
 */
function addToCart(productId) {
  if (typeof PRODUCTS === 'undefined' || !Array.isArray(PRODUCTS)) {
    console.error("[Cart] La lista de productos no está definida.");
    return;
  }

  const strProductId = String(productId);
  const existing = cart.find(item => String(item.id) === strProductId);

  if (existing) { 
    existing.qty += 1; 
  } else { 
    const itemToAdd = PRODUCTS.find(p => String(p.id) === strProductId);
    if (itemToAdd) {
      // Guardamos solo la información indispensable para prevenir cuellos de botella en localStorage
      cart.push({
        id: itemToAdd.id,
        name: itemToAdd.name,
        price: Number(itemToAdd.price) || 0,
        qty: 1,
        fabricado: itemToAdd.fabricado || 'N/A',
        netContent: itemToAdd.netContent || 'N/A',
        invima: itemToAdd.invima || 'N/A'
      }); 
    }
  }

  saveAndRefreshCart();

  if (typeof openCartModal === 'function') {
    openCartModal();
  }
}

/**
 * Actualiza la cantidad de un ítem. Elimina el elemento si la cantidad cae a <= 0
 */
function updateQty(productId, delta) {
  const strProductId = String(productId);
  const itemIndex = cart.findIndex(i => String(i.id) === strProductId);
  if (itemIndex === -1) return;

  cart[itemIndex].qty += delta;

  if (cart[itemIndex].qty <= 0) { 
    cart.splice(itemIndex, 1); 
  }

  saveAndRefreshCart();
}

/**
 * Elimina un ítem por completo del carrito independientemente de la cantidad
 */
function removeFromCart(productId) {
  const strProductId = String(productId);
  const itemIndex = cart.findIndex(i => String(i.id) === strProductId);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    saveAndRefreshCart();
  }
}

/**
 * Vacía completamente el carrito de compras
 */
function clearCart() {
  cart.length = 0; // Mutación limpia in-place
  saveAndRefreshCart();
}

/**
 * Sincroniza el estado del carrito con localStorage y actualiza la interfaz
 */
function saveAndRefreshCart() {
  try {
    localStorage.setItem("starnatural_cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("[Cart] No se pudo guardar en localStorage:", e);
  }
  updateCartUI();
}

/**
 * Renderiza los elementos del carrito en el DOM de forma segura
 */
function updateCartUI() {
  const totalCount = cart.reduce((acc, i) => acc + (Number(i.qty) || 0), 0);
  const totalPrice = cart.reduce((acc, i) => acc + ((Number(i.price) || 0) * (Number(i.qty) || 0)), 0);

  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  
  if (cartCountEl) cartCountEl.innerText = totalCount;
  if (cartTotalEl) cartTotalEl.innerText = `$${totalPrice.toLocaleString("es-CO")} COP`;

  const itemsContainer = document.getElementById("cart-items-container");
  if (itemsContainer) {
    if (cart.length === 0) {
      const cartEmoji = typeof EMOJIS !== 'undefined' && EMOJIS.cart 
        ? EMOJIS.cart 
        : 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f6d2/512.webp';

      itemsContainer.innerHTML = `
        <div style="text-align: center; color: #64748b; padding: 2.5rem 1rem;">
          <img src="${escapeHTML(cartEmoji)}" class="animated-emoji" alt="Carrito vacío" style="width: 64px; height: 64px; margin-bottom: 0.5rem;" />
          <p style="font-size: 1rem; font-weight: 600; margin: 0; color: #0f172a;">Tu carrito está vacío</p>
          <p style="font-size: 0.85rem; margin-top: 4px; color: #64748b;">Agrega productos para comenzar tu compra.</p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map(item => {
        const safeId = escapeHTML(String(item.id));
        const safeName = escapeHTML(item.name);
        const itemSubtotal = (Number(item.price) || 0) * (Number(item.qty) || 0);

        return `
          <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;">
            <div style="flex: 1; padding-right: 0.5rem;">
              <div style="font-weight:700; color:#0f172a; font-size: 0.95rem;">${safeName}</div>
              <div style="font-size:0.85rem; color:#64748b;">$${itemSubtotal.toLocaleString("es-CO")} COP</div>
            </div>
            <div class="qty-controls" style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="qty-btn" onclick="updateQty('${safeId}', -1)" aria-label="Disminuir cantidad" style="width: 28px; height: 28px; cursor: pointer;">-</button>
              <span style="font-weight:600; min-width: 20px; text-align: center;">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty('${safeId}', 1)" aria-label="Aumentar cantidad" style="width: 28px; height: 28px; cursor: pointer;">+</button>
              <button onclick="removeFromCart('${safeId}')" title="Eliminar ítem" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 0.25rem; font-size: 1.1rem; line-height: 1;">&times;</button>
            </div>
          </div>
        `;
      }).join("");
    }
  }
}

// Ejecutar sincronización visual al cargar el script
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
});
