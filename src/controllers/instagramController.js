const config = require("../config/env");
const tenantService = require("../services/tenantService");
const instagramService = require("../services/instagram");
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
  res.sendStatus(200);

  processWebhookPayload(req.body).catch((err) => {
    // Solo el mensaje: el objeto completo de axios incluye los headers del
    // request (Authorization con el access token) y no queremos loguearlo.
    console.error("[instagram] Error procesando webhook:", err.message);
  });
}

// El payload de Instagram Messaging tiene la forma del webhook de Messenger:
// entry[].id es la cuenta de Instagram del negocio, entry[].messaging[] trae
// los eventos (uno por mensaje).
async function processWebhookPayload(body) {
  const entries = body.entry || [];

  for (const entry of entries) {
    const instagramAccountId = entry.id;
    const tenant = instagramAccountId
      ? await tenantService.findTenantByInstagramAccountId(instagramAccountId)
      : null;

    if (!tenant) {
      console.warn(`[instagram] instagram_account_id sin negocio asociado: ${instagramAccountId}`);
      continue;
    }

    for (const event of entry.messaging || []) {
      await handleMessagingEvent(tenant, event);
    }
  }
}

async function handleMessagingEvent(tenant, event) {
  // Eco de un mensaje que mandó el propio negocio (por ejemplo, nuestra
  // respuesta rebotando): lo ignoramos para no procesar nuestros propios mensajes.
  if (event.message?.is_echo) return;

  const text = event.message?.text;
  if (!text) {
    // TODO: soportar attachments (imágenes, etc.) en un próximo paso.
    console.log("[instagram] Mensaje sin texto (attachment u otro tipo), lo salteamos.");
    return;
  }

  const from = event.sender?.id;
  if (!from) return;

  await messageHandler.handleIncomingText(tenant, "instagram", from, text, instagramService.sendMessage);
}

module.exports = { verifyWebhook, handleIncomingMessage };
