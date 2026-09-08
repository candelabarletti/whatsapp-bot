const axios = require("axios");

const GRAPH_API_VERSION = "v21.0";

// to: número del cliente final (wa_id), en formato E.164 sin "+".
async function sendMessage(tenant, to, text) {
  if (!tenant.whatsappPhoneNumberId || !tenant.whatsappAccessToken) {
    throw new Error(`El negocio "${tenant.name}" no tiene WhatsApp conectado.`);
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${tenant.whatsappPhoneNumberId}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${tenant.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

module.exports = { sendMessage };
