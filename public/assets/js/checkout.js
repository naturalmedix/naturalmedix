/* ==========================================
   PASARELA DE PAGO WOMPI Y CHECKOUT - STARNATURAL
   ========================================== */

const WOMPI_PUBLIC_KEY = "pub_prod_hTKZ7t71m1Xue0eFgOc3vSvKTvcUl1gZ"; 

// ⚠️ NOTA DE SEGURIDAD: 
// Para una implementación de alta seguridad, la firma de integridad debe provenir de un backend/serverless function.
const WOMPI_INTEGRITY_SECRET = "prod_integrity_DcxdEMXNcfNVP0vLgE2RDmIK61d3ldNU";

/**
 * Genera la firma SHA-256 exigida por Wompi para asegurar la integridad de la transacción.
 */
async function generateIntegritySignature(reference, amountInCents, currency, secret) {
  const cadenaConcatenada = `${reference}${amountInCents}${currency}${secret}`;
  const encodedText = new TextEncoder().encode(cadenaConcatenada);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedText);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validadores Regex básicos
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Acepta números colombianos de 10 dígitos (fijos o móviles)
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 7 && cleanPhone.length <= 10;
}

let isProcessingCheckout = false;

async function handleWompiCheckout() {
  if (isProcessingCheckout) return;

  // 1. Validación de carrito no vacío
  if (!Array.isArray(cart) || cart.length === 0) {
    alert("Tu carrito está vacío. Agrega al menos un producto antes de pagar.");
    return;
  }

  // 2. Captura y sanitización de campos del formulario
  const name = document.getElementById("customer-name")?.value.trim() || "";
  const idNum = document.getElementById("customer-id")?.value.trim() || "";
  const email = document.getElementById("customer-email")?.value.trim() || "";
  const phone = document.getElementById("customer-phone")?.value.trim() || "";
  const city = document.getElementById("customer-city")?.value.trim() || "";
  const address = document.getElementById("customer-address")?.value.trim() || "";
  const notes = document.getElementById("customer-notes")?.value.trim() || "";

  if (!name || !idNum || !email || !phone || !city || !address) {
    alert("Por favor completa todos los campos obligatorios de envío (Nombre, CC/NIT, Correo, Teléfono, Ciudad y Dirección).");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Por favor ingresa un correo electrónico válido.");
    document.getElementById("customer-email")?.focus();
    return;
  }

  if (!isValidPhone(phone)) {
    alert("Por favor ingresa un número de teléfono válido (mínimo 7 a 10 dígitos).");
    document.getElementById("customer-phone")?.focus();
    return;
  }

  // 3. Verificar disponibilidad del SDK de Wompi
  if (typeof WidgetCheckout === 'undefined') {
    alert("El sistema de pago Wompi no se ha cargado correctamente. Revisa tu conexión a internet o intenta recargar la página.");
    return;
  }

  const btnPay = document.getElementById("btn-wompi-pay");
  const originalBtnText = btnPay ? btnPay.innerText : "";

  try {
    isProcessingCheckout = true;
    if (btnPay) {
      btnPay.disabled = true;
      btnPay.innerText = "Cargando pasarela de pago...";
    }

    const totalPrice = cart.reduce((acc, i) => acc + (Number(i.price) * Number(i.qty)), 0);
    const amountInCents = Math.round(totalPrice * 100);
    const currency = "COP";
    const reference = `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
        phoneNumber: phone.replace(/\D/g, ''),
        phoneNumberPrefix: '+57',
        legalId: idNum.replace(/\D/g, ''),
        legalIdType: 'CC'
      }
    });

    checkout.open((result) => {
      // Restaurar estado del botón al cerrar/completar el widget
      isProcessingCheckout = false;
      if (btnPay) {
        btnPay.disabled = false;
        btnPay.innerText = originalBtnText;
      }

      const transaction = result ? (result.transaction || result) : null;

      if (!transaction) {
        // El usuario cerró el widget sin completar la transacción
        return;
      }

      const status = transaction.status;
      const referenceId = transaction.id || reference;

      if (status === 'APPROVED' || status === 'PENDING') {
        const isPending = status === 'PENDING';

        // 1. Construir resumen detallado para WhatsApp
        const orderSummary = cart.map(i => 
          `• *${i.name}* (x${i.qty}) - $${(i.price * i.qty).toLocaleString("es-CO")}\n` +
          `    - Fabricado por: ${i.fabricado || 'N/A'}\n` +
          `    - Contenido: ${i.netContent || 'N/A'}\n` +
          `    - Invima: ${i.invima || 'N/A'}`
        ).join("\n\n");

        const statusMessage = isPending 
          ? "⏳ *¡PEDIDO EN PROCESO DE PAGO (PENDIENTE PSE/TRANSFERENCIA)!*" 
          : "✅ *¡NUEVO PEDIDO PAGADO EN STARNATURAL.APP!*";

        const message = 
`${statusMessage}
----------------------------------
📌 *Referencia Wompi:* ${referenceId}
💰 *Monto:* $${totalPrice.toLocaleString("es-CO")} COP
📊 *Estado:* ${isPending ? 'PENDIENTE DE CONFIRMACIÓN' : 'APROBADO'}

🛒 *DETALLE DE PRODUCTOS:*
${orderSummary}

👤 *DATOS DE ENVÍO:*
• *Nombre:* ${name}
• *CC/NIT:* ${idNum}
• *Teléfono:* ${phone}
• *Correo:* ${email}
• *Ciudad:* ${city}
• *Dirección:* ${address}
${notes ? `• *Notas:* ${notes}` : ''}`;

        const whatsappUrl = `https://wa.me/573027109685?text=${encodeURIComponent(message)}`;

        // 2. Mostrar la pantalla de recibo/confirmación en la App
        if (typeof showOrderReceipt === 'function') {
          showOrderReceipt({
            ref: referenceId,
            total: totalPrice,
            status: status,
            cart: [...cart],
            customer: { name, idNum, email, phone, city, address, notes },
            whatsappUrl: whatsappUrl
          });
        }

        // 3. Vaciar el carrito únicamente si la compra se procesó
        if (typeof clearCart === 'function') {
          clearCart();
        } else {
          cart.length = 0;
          if (typeof saveAndRefreshCart === 'function') {
            saveAndRefreshCart();
          }
        }

        if (typeof closeCartModal === 'function') {
          closeCartModal();
        }

        if (isPending) {
          alert("Tu pago se encuentra PENDIENTE de aprobación por parte de tu entidad bancaria (ej. PSE). Guarda tu número de referencia.");
        }

      } else if (status === 'DECLINED') {
        alert("La transacción fue RECHAZADA por la entidad financiera. Revisa el saldo de tu cuenta o intenta con otro método de pago.");
      } else if (status === 'VOIDED') {
        alert("La transacción fue anulada.");
      } else if (status === 'ERROR') {
        alert("Ocurrió un inconveniente al procesar el pago con la entidad bancaria. Intenta nuevamente.");
      }
    });

  } catch (error) {
    console.error("[Checkout] Error al iniciar la transacción con Wompi:", error);
    alert("Ocurrió un error al preparar la transacción. Intenta nuevamente.");
  } finally {
    isProcessingCheckout = false;
    if (btnPay) {
      btnPay.disabled = false;
      btnPay.innerText = originalBtnText;
    }
  }
}
