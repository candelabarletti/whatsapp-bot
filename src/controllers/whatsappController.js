const config = require("../config/env");
const tenantService = require("../services/tenantService");
const whatsappService = require("../services/whatsapp");
const messageHandler = require("../services/messageHandler");

function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.meta.webhookVerifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

function handleIncomingMessage(req, res) {
  // Meta espera un ack rápido o reintenta el webhook; respondemos ya y
  // seguimos procesando (llamar a Claude puede tardar un par de segundos).
  res.sendStatus(200);

  processWebhookPayload(req.body).catch((err) => {
    // Solo el mensaje: el objeto completo de axios incluye los headers del
    // request (Authorization con el access token) y no queremos loguearlo.
    console.error("[whatsapp] Error procesando webhook:", err.message);
  });
}

async function processWebhookPayload(body) {
  const entries = body.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};

      // El campo "messages" solo está presente cuando llega un mensaje nuevo
      // (otros eventos, como "statuses" de entrega/lectura, no lo traen).
      if (!value.messages) continue;

      const phoneNumberId = value.metadata?.phone_number_id;
      const tenant = phoneNumberId
        ? await tenantService.findTenantByWhatsappPhoneNumberId(phoneNumberId)
        : null;

      if (!tenant) {
        console.warn(`[whatsapp] phone_number_id sin negocio asociado: ${phoneNumberId}`);
        continue;
      }

      for (const message of value.messages) {
        await handleMessage(tenant, message);
      }
    }
  }
}

async function handleMessage(tenant, message) {
  if (message.type !== "text") {
    // TODO: soportar audio/imagen/documentos en un próximo paso.
    console.log(`[whatsapp] Tipo de mensaje no soportado todavía: ${message.type}`);
    return;
  }

  const from = message.from;
  const text = message.text?.body || "";

  await messageHandler.handleIncomingText(tenant, "whatsapp", from, text, whatsappService.sendMessage);
}

module.exports = { verifyWebhook, handleIncomingMessage };
