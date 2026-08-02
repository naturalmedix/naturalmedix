/* ==========================================
   PASARELA DE PAGO WOMPI Y CHECKOUT - STARNATURAL
   ========================================== */

const WOMPI_PUBLIC_KEY = "pub_prod_hTKZ7t71m1Xue0eFgOc3vSvKTvcUl1gZ"; 

// ⚠️ NOTA DE SEGURIDAD: 
// Para producciones estrictas, este hash / secret debe calcularse desde tu servidor backend.
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

async function handleWompiCheckout() {
  // Validación de carrito no vacío
  if (!Array.isArray(cart) || cart.length === 0) {
    alert("Tu carrito está vacío. Agrega al menos un producto antes de pagar.");
    return;
  }

  // Captura y sanitización de campos del formulario
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

  // Verificar que el SDK del widget de Wompi se haya cargado
  if (typeof WidgetCheckout === 'undefined') {
    alert("El sistema de pago Wompi no está disponible. Revisa tu conexión a internet o intenta recargar la página.");
    return;
  }

  const totalPrice = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const amountInCents = Math.round(totalPrice * 100);
  const currency = "COP";
  const reference = `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

    checkout.open(function (result) {
      const transaction = result ? (result.transaction || result) : null;

      if (transaction && transaction.status === 'APPROVED') {
        const referenceId = transaction.id || reference;
        
        // 1. Construir resumen detallado para WhatsApp
        const orderSummary = cart.map(i => 
          `• *${i.name}* (x${i.qty}) - $${(i.price * i.qty).toLocaleString("es-CO")}\n` +
          `    - Fabricado por: ${i.fabricado || 'N/A'}\n` +
          `    - Contenido: ${i.netContent || 'N/A'}\n` +
          `    - Invima: ${i.invima || 'N/A'}`
        ).join("\n\n");

        const message = 
`✅ *¡NUEVO PEDIDO PAGADO EN STARNATURAL.APP!*
----------------------------------
📌 *Referencia Wompi:* ${referenceId}
💰 *Monto Pagado:* $${totalPrice.toLocaleString("es-CO")} COP

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
            cart: [...cart],
            customer: { name, idNum, email, phone, city, address, notes },
            whatsappUrl: whatsappUrl
          });
        }

        // 3. Vaciar el carrito sin reasignar la variable directamente
        cart.length = 0;
        if (typeof saveAndRefreshCart === 'function') {
          saveAndRefreshCart();
        } else if (typeof updateCartUI === 'function') {
          updateCartUI();
        }

        if (typeof closeCartModal === 'function') {
          closeCartModal();
        }

      } else if (transaction && transaction.status === 'DECLINED') {
        alert("La transacción fue rechazada por la entidad financiera. Verifica tus datos o intenta con otro método de pago.");
      } else if (transaction && transaction.status === 'ERROR') {
        alert("Ocurrió un inconveniente al procesar el pago con la entidad bancaria.");
      }
    });

  } catch (error) {
    console.error("[Checkout] Error al iniciar la transacción con Wompi:", error);
    alert("Ocurrió un error al preparar la transacción. Intenta nuevamente.");
  }
}
