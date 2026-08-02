/* ==========================================
   PASARELA DE PAGO WOMPI Y CHECKOUT
   ========================================== */

const WOMPI_PUBLIC_KEY = "pub_prod_hTKZ7t71m1Xue0eFgOc3vSvKTvcUl1gZ"; 
const WOMPI_INTEGRITY_SECRET = "prod_integrity_DcxdEMXNcfNVP0vLgE2RDmIK61d3ldNU";

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

    checkout.open(function ( result ) {
      const transaction = result.transaction;

      if (transaction.status === 'APPROVED') {
        const referenceId = transaction.id || reference;
        
        // 1. Construir resumen para WhatsApp
        const orderSummary = cart.map(i => 
          `• *${i.name}* (x${i.qty}) - $${(i.price * i.qty).toLocaleString("es-CO")}\n` +
          `   - Fabricado por: ${i.fabricado || 'N/A'}\n` +
          `   - Contenido: ${i.netContent || 'N/A'}\n` +
          `   - Invima: ${i.invima || 'N/A'}`
        ).join("\n\n");

        const message = 
`✅ *¡NUEVO PEDIDO PAGADO EN NATURAL MEDIX!*
----------------------------------
📌 *Referencia Wompi:* ${referenceId}
💰 *Monto Pagado:* $${totalPrice.toLocaleString("es-CO")} COP

🛒 *DETALLE DE PRODUCTOS:*
${orderSummary}

👤 *DATOS DE ENVÍO:*
• *Nombre:* ${name}
• *CC/NIT:* ${idNum}
• *Teléfono:* ${phone}
• *Ciudad:* ${city}
• *Dirección:* ${address}
${notes ? `• *Notas:* ${notes}` : ''}`;

        const whatsappUrl = `https://wa.me/573027109685?text=${encodeURIComponent(message)}`;

        // 2. Desplegar la pantalla interna de respaldo
        showOrderReceipt({
          ref: referenceId,
          total: totalPrice,
          cart: [...cart],
          customer: { name, idNum, email, phone, city, address, notes },
          whatsappUrl: whatsappUrl
        });

        // 3. Limpiar carrito y cerrar modal del checkout
        cart = [];
        saveAndRefreshCart();
        closeCartModal();

      } else if (transaction.status === 'DECLINED') {
        alert("La transacción fue rechazada por la entidad financiera.");
      }
    });

  } catch (error) {
    console.error("Error al generar la firma de Wompi:", error);
    alert("Error al preparar la transacción. Intenta de nuevo.");
  }
}
