const axios = require("axios");

const GRAPH_API_VERSION = "v21.0";

// recipientId: instagram-scoped ID (IGSID) del usuario final.
async function sendMessage(tenant, recipientId, text) {
  if (!tenant.instagramAccountId || !tenant.instagramAccessToken) {
    throw new Error(`El negocio "${tenant.name}" no tiene Instagram conectado.`);
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${tenant.instagramAccountId}/messages`;

  await axios.post(
    url,
    {
      recipient: { id: recipientId },
      message: { text },
    },
    {
      headers: {
        Authorization: `Bearer ${tenant.instagramAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

module.exports = { sendMessage };
