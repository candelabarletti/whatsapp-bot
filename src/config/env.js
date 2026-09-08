require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.warn(`[config] Falta la variable de entorno ${name}`);
  }
  return value;
}

// Variables globales de la app (una sola app de Meta, un solo Claude, para
// todos los negocios-cliente). Las credenciales de cada negocio viven en la
// base de datos (tabla Tenant), no acá.
module.exports = {
  port: process.env.PORT || 3000,

  anthropicApiKey: required("ANTHROPIC_API_KEY"),

  meta: {
    webhookVerifyToken: required("META_WEBHOOK_VERIFY_TOKEN"),
    // WhatsApp Cloud API firma sus webhooks con el App Secret de la app
    // principal (App settings > Basic).
    appSecret: required("META_APP_SECRET"),
    // La API directa de Instagram (Instagram Login) es un sub-app dentro de
    // la misma app de Meta, con su propio "Instagram app secret" — firma sus
    // webhooks con ese secret, no con el de la app principal.
    instagramAppSecret: required("META_INSTAGRAM_APP_SECRET"),
  },
};
