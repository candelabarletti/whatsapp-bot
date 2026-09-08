const express = require("express");
const controller = require("../controllers/instagramController");
const verifySignature = require("../middleware/verifySignature");
const config = require("../config/env");

const router = express.Router();

router.get("/", controller.verifyWebhook);
router.post("/", verifySignature(config.meta.instagramAppSecret), controller.handleIncomingMessage);

module.exports = router;
