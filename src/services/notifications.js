const whatsappService = require("./whatsapp");

function looksLikePhoneNumber(value) {
  return /^\+?[0-9\s-]{6,}$/.test(value);
}

// Avisa al dueño del negocio que una conversación necesita atención humana.
// Si handoffContact es un teléfono, le mandamos un WhatsApp directo (reusando
// el mismo número del negocio). Si es un email, por ahora solo lo logueamos:
// mandar mails de verdad requiere un proveedor de email (TODO a futuro).
async function notifyHandoff(tenant, conversation, reason) {
  if (!tenant.handoffContact) {
    console.log(`[handoff] "${tenant.name}" no tiene contacto de aviso configurado.`);
    return;
  }

  const message =
    `🔔 ${tenant.name}: un cliente necesita atención humana.\n` +
    `Motivo: ${reason}\n` +
    `Canal: ${conversation.channel} (${conversation.externalContactId})`;

  if (looksLikePhoneNumber(tenant.handoffContact) && conversation.channel === "whatsapp") {
    try {
      const to = tenant.handoffContact.replace(/[^\d]/g, "");
      await whatsappService.sendMessage(tenant, to, message);
      console.log(`[handoff] Aviso enviado por WhatsApp a ${tenant.handoffContact}`);
      return;
    } catch (err) {
      console.error(`[handoff] No se pudo avisar por WhatsApp a ${tenant.handoffContact}:`, err.message);
    }
  }

  // TODO: notificación por email cuando handoffContact es un mail.
  console.log(`[handoff] Avisar manualmente a ${tenant.handoffContact}: ${message}`);
}

module.exports = { notifyHandoff };
