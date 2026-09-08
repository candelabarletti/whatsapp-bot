const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5";

// Claude decide solo cuándo escalar: no lo detectamos con reglas/keywords,
// se lo dejamos a su criterio con esta herramienta.
const ESCALATE_TOOL = {
  name: "escalate_to_human",
  description:
    "Usala cuando no puedas resolver el pedido del cliente con la información " +
    "que tenés del negocio: quejas, pedidos explícitos de hablar con una persona, " +
    "precios o casos especiales, o cualquier cosa fuera de lo que sabés. No inventes " +
    "una respuesta si no estás seguro: escalá.",
  input_schema: {
    type: "object",
    properties: {
      reason: { type: "string", description: "Motivo breve del escalamiento, en español." },
    },
    required: ["reason"],
    additionalProperties: false,
  },
  strict: true,
};

function buildSystemPrompt(tenant) {
  return (
    `${tenant.systemPrompt}\n\n` +
    "Sos un asistente virtual que responde mensajes de WhatsApp/Instagram en " +
    "nombre de este negocio. Respondé siempre en español, de forma breve y " +
    "natural (es un chat, no un email). Si no podés resolver el pedido con la " +
    "información que tenés, usá la herramienta escalate_to_human en vez de " +
    "inventar una respuesta."
  );
}

function toMessageParams(history) {
  return history.map((m) => ({ role: m.role, content: m.content }));
}

// history: mensajes previos de la conversación (sin el mensaje actual).
// userMessage: el mensaje nuevo del cliente.
// Devuelve { text, escalated, escalationReason? }
async function generateReply(tenant, history, userMessage) {
  const messages = [...toMessageParams(history), { role: "user", content: userMessage }];
  const system = buildSystemPrompt(tenant);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: "low" },
    system,
    tools: [ESCALATE_TOOL],
    messages,
  });

  const toolUse = response.content.find(
    (block) => block.type === "tool_use" && block.name === "escalate_to_human"
  );

  if (!toolUse) {
    const textBlock = response.content.find((block) => block.type === "text");
    return { text: textBlock?.text || "", escalated: false };
  }

  // Segunda vuelta: le contamos a Claude que ya escalamos, para que redacte
  // el aviso al cliente en su propio tono (no una respuesta enlatada).
  const followup = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    output_config: { effort: "low" },
    system,
    tools: [ESCALATE_TOOL],
    messages: [
      ...messages,
      { role: "assistant", content: response.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content:
              "Listo, ya se avisó a una persona del equipo. Contale al cliente " +
              "que en breve lo va a atender alguien.",
          },
        ],
      },
    ],
  });

  const followupText = followup.content.find((block) => block.type === "text");

  return {
    text: followupText?.text || "Ya avisamos a alguien del equipo, en breve te responden.",
    escalated: true,
    escalationReason: toolUse.input.reason,
  };
}

module.exports = { generateReply };
