const express = require("express");

const whatsappRoutes = require("./routes/whatsapp");
const instagramRoutes = require("./routes/instagram");

const app = express();

// Guardamos el body crudo (rawBody) porque la validación de firma de Meta
// (verifySignature) necesita hashear los bytes exactos que mandaron, no el
// JSON re-serializado.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/webhooks/whatsapp", whatsappRoutes);
app.use("/webhooks/instagram", instagramRoutes);

module.exports = app;
