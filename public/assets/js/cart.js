/* ==========================================
   GESTIÓN Y ESTADO DEL CARRITO DE COMPRAS
   ========================================== */

// Carga segura desde localStorage con bloque try-catch
let cart = [];
try {
  const savedCart = localStorage.getItem("starnatural_cart");
  cart = savedCart ? JSON.parse(savedCart) : [];
} catch (e) {
  console.warn("[Cart] Error al leer el carrito desde localStorage, reiniciando:", e);
  cart = [];
}

/**
 * Agrega un producto al carrito o incrementa su cantidad
 */
function addToCart(productId) {
  if (typeof PRODUCTS === 'undefined') {
    console.error("[Cart] La lista de productos no está definida.");
    return;
  }

  const existing = cart.find(item => item.id === productId);
  if (existing) { 
    existing.qty += 1; 
  } else { 
    const itemToAdd = PRODUCTS.find(p => p.id === productId);
    if (itemToAdd) {
      cart.push({ ...itemToAdd, qty: 1 }); 
    }
  }

  saveAndRefreshCart();

  if (typeof openCartModal === 'function') {
    openCartModal();
  }
}

/**
 * Actualiza la cantidad de un ítem. Elimina el elemento mutando el arreglo si la cantidad baja a <= 0
 */
function updateQty(productId, delta) {
  const itemIndex = cart.findIndex(i => i.id === productId);
  if (itemIndex === -1) return;

  cart[itemIndex].qty += delta;

  if (cart[itemIndex].qty <= 0) { 
    // Mutación in-place para mantener la referencia viva en todo el sistema
    cart.splice(itemIndex, 1); 
  }

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
 * Renderiza los elementos del carrito en el DOM
 */
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
      const cartEmoji = typeof EMOJIS !== 'undefined' && EMOJIS.cart 
        ? EMOJIS.cart 
        : 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f6d2/512.webp';

      itemsContainer.innerHTML = `
        <div style="text-align: center; color: #64748b; padding: 2.5rem 1rem;">
          <img src="${cartEmoji}" class="animated-emoji" alt="Carrito vacío" style="width: 64px; height: 64px; margin-bottom: 0.5rem;" />
          <p style="font-size: 1rem; font-weight: 600; margin: 0; color: #0f172a;">Tu carrito está vacío</p>
          <p style="font-size: 0.85rem; margin-top: 4px; color: #64748b;">Agrega productos para comenzar tu compra.</p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div>
            <div style="font-weight:700; color:#0f172a;">${item.name}</div>
            <div style="font-size:0.85rem; color:#64748b;">$${(item.price * item.qty).toLocaleString("es-CO")} COP</div>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)" aria-label="Disminuir cantidad">-</button>
            <span style="font-weight:600;">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
      `).join("");
    }
  }
}
