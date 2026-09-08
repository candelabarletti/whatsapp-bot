const crypto = require("node:crypto");
const config = require("../config/env");

// Valida que el POST venga realmente de Meta: recalcula el HMAC-SHA256 del
// body crudo con el App Secret correspondiente y lo compara contra el header
// que manda Meta. `secret` es un valor fijo o una función (req) => secret,
// porque WhatsApp e Instagram firman con secrets distintos.
function verifySignature(secret) {
  return function (req, res, next) {
    const resolvedSecret = typeof secret === "function" ? secret(req) : secret;
    const signatureHeader = req.get("x-hub-signature-256");

    if (!signatureHeader || !resolvedSecret) {
      return res.sendStatus(401);
    }

    const expected = crypto
      .createHmac("sha256", resolvedSecret)
      .update(req.rawBody || Buffer.alloc(0))
      .digest("hex");

    const provided = signatureHeader.replace("sha256=", "");

    const expectedBuffer = Buffer.from(expected, "hex");
    const providedBuffer = Buffer.from(provided, "hex");

    const valid =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!valid) {
      return res.sendStatus(401);
    }

    next();
  };
}

module.exports = verifySignature;
