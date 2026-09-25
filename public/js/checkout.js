/* Checkout NaturalMedix -> backend -> Wompi Payment Link */

async function handleWompiCheckout() {
  const currentCart = window.cart || [];
  if (!currentCart.length) {
    alert('Agrega al menos un producto al carrito.');
    return;
  }

  const customer = {
    name: document.getElementById('customer-name')?.value.trim() || '',
    idNum: document.getElementById('customer-id')?.value.trim() || '',
    email: document.getElementById('customer-email')?.value.trim() || '',
    phone: document.getElementById('customer-phone')?.value.trim() || '',
    city: document.getElementById('customer-city')?.value.trim() || '',
    address: document.getElementById('customer-address')?.value.trim() || '',
    notes: document.getElementById('customer-notes')?.value.trim() || '',
  };

  if (!customer.name || !customer.idNum || !customer.email || !customer.phone || !customer.city || !customer.address) {
    alert('Por favor completa todos los datos de envío obligatorios.');
    return;
  }

  const packViolations = typeof window.getPackViolations === 'function' ? window.getPackViolations(currentCart) : [];
  if (packViolations.length) {
    const detail = packViolations.map(group => {
      if (group.quantity < group.packSize) return group.label + ': ' + group.quantity + '/' + group.packSize + ', faltan ' + group.missing + ' unidades de la misma línea.';
      return group.label + ': ' + group.quantity + ' unidades; agrega ' + group.missing + ' para completar el siguiente paquete o quita ' + group.remainder + '.';
    }).join('\n');
    alert('Cada línea debe completar paquetes de 12 unidades. Puedes combinar productos de la misma línea:\n\n' + detail);
    return;
  }

  const button = document.getElementById('btn-wompi-pay');
  const oldText = button?.textContent || '';
  if (button) { button.disabled = true; button.textContent = 'Generando pago…'; }

  try {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: currentCart.map(item => ({ id: item.id, qty: Number(item.qty) })),
        customer,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.paymentUrl) throw new Error(data?.error || 'No se pudo crear el pago.');

    sessionStorage.setItem('naturalmedix_pending_order', data.orderId);
    window.location.href = data.paymentUrl;
  } catch (error) {
    console.error(error);
    alert(error instanceof Error ? error.message : 'No se pudo iniciar el pago.');
    if (button) { button.disabled = false; button.textContent = oldText || '🔒 Pagar con Wompi (Nequi / PSE / Tarjeta)'; }
  }
}

window.handleWompiCheckout = handleWompiCheckout;
