const express = require("express");
const ChatController = require("../controllers/ChatController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware(), ChatController.listChats);
router.get("/:chatId/messages", authMiddleware(), ChatController.getMessages);
router.post("/send", authMiddleware(), ChatController.sendMessage);
router.patch("/:chatId/read", authMiddleware(), ChatController.markRead);

module.exports = router;
