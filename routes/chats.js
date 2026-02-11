const express = require("express");
const ChatController = require("../controllers/ChatController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { sendMessageSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", authMiddleware(), ChatController.listChats);
router.get("/:chatId/messages", authMiddleware(), ChatController.getMessages);
router.post("/send", authMiddleware(), validate(sendMessageSchema), ChatController.sendMessage);
router.patch("/:chatId/read", authMiddleware(), ChatController.markRead);

module.exports = router;
