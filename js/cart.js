/* ==========================================
   GESTIÓN Y ESTADO DEL CARRITO DE COMPRAS
   ========================================== */

let cart = JSON.parse(localStorage.getItem("starnatural_cart") || "[]");

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
