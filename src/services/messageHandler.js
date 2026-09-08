const conversationService = require("./conversationService");
const claudeService = require("./claude");
const notificationsService = require("./notifications");

// Lógica de conversación compartida entre canales (WhatsApp, Instagram, los
// que vengan): guarda el mensaje, le pregunta a Claude, contesta, y escala a
// humano si hace falta. Cada canal solo aporta cómo llegó el mensaje y cómo
// se manda la respuesta (sendReply).
//
// sendReply: async (tenant, externalContactId, text) => void
async function handleIncomingText(tenant, channel, externalContactId, text, sendReply) {
  const conversation = await conversationService.getOrCreateConversation(
    tenant.id,
    channel,
    externalContactId
  );

  // Un humano ya tomó esta conversación: guardamos el mensaje pero no
  // respondemos automático (TODO: UI para que el negocio la reactive).
  if (conversation.paused) {
    await conversationService.addMessage(conversation.id, "user", text);
    return;
  }

  const history = await conversationService.getRecentHistory(conversation.id, 20);
  await conversationService.addMessage(conversation.id, "user", text);

  const reply = await claudeService.generateReply(tenant, history, text);
  await conversationService.addMessage(conversation.id, "assistant", reply.text);

  await sendReply(tenant, externalContactId, reply.text);

  if (reply.escalated) {
    const updatedConversation = await conversationService.markNeedsHuman(conversation.id);
    console.log(
      `[handoff] "${tenant.name}" — conversación ${conversation.id} escalada: ${reply.escalationReason}`
    );
    await notificationsService.notifyHandoff(tenant, updatedConversation, reply.escalationReason);
  }
}

module.exports = { handleIncomingText };
