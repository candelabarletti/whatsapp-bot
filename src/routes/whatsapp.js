const express = require("express");
const controller = require("../controllers/whatsappController");
const verifySignature = require("../middleware/verifySignature");
const config = require("../config/env");

const router = express.Router();

// Meta llama a este endpoint una vez, al configurar el webhook, para verificar que el server es tuyo.
router.get("/", controller.verifyWebhook);

// Meta llama a este endpoint cada vez que llega un mensaje nuevo.
router.post("/", verifySignature(config.meta.appSecret), controller.handleIncomingMessage);

module.exports = router;
