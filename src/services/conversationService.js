const prisma = require("../config/db");

function getOrCreateConversation(tenantId, channel, externalContactId) {
  return prisma.conversation.upsert({
    where: {
      tenantId_channel_externalContactId: { tenantId, channel, externalContactId },
    },
    update: {},
    create: { tenantId, channel, externalContactId },
  });
}

function addMessage(conversationId, role, content) {
  return prisma.message.create({ data: { conversationId, role, content } });
}

// Últimos `limit` mensajes en orden cronológico, para pasarle contexto a Claude.
async function getRecentHistory(conversationId, limit = 20) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return messages.reverse();
}

// TODO (próximo paso): llamar esto cuando Claude decida escalar la conversación.
function markNeedsHuman(conversationId) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { needsHuman: true, paused: true },
  });
}

module.exports = {
  getOrCreateConversation,
  addMessage,
  getRecentHistory,
  markNeedsHuman,
};
