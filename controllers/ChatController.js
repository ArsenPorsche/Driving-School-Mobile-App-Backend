const chatService = require("../services/chatService");

class ChatController {
  static async listChats(req, res) {
    try {
      const userId = req.user._id;
      const chats = await chatService.listChats(userId);
      res.json({ chats });
    } catch (e) {
      console.error("[ChatController] listChats error", e);
      res.status(500).json({ message: "Server error", error: e.message });
    }
  }

  static async getMessages(req, res) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { before, limit = 50 } = req.query;
      
      const messages = await chatService.getMessages(chatId, userId, before, limit);
      res.json({ messages });
    } catch (e) {
      console.error("[ChatController] getMessages error", e);
      const statusCode = e.message.includes("Not authorized") ? 403 : 500;
      res.status(statusCode).json({ message: e.message });
    }
  }

  static async sendMessage(req, res) {
    try {
      const userId = req.user._id;
      const { partnerId, text } = req.body;
      
      const { message, plainText } = await chatService.sendMessage(userId, partnerId, text);
      
      res.json({ message: {
        _id: message._id,
        chat: message.chat,
        sender: message.sender,
        type: message.type,
        text: plainText,
        data: message.data,
        createdAt: message.createdAt,
      }});
    } catch (e) {
      console.error("[ChatController] sendMessage error", e);
      const statusCode = e.message.includes("required") ? 400 : 500;
      res.status(statusCode).json({ message: e.message });
    }
  }

  static async markRead(req, res) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      
      await chatService.markMessagesAsRead(chatId, userId);
      res.json({ message: "Marked chat messages as read" });
    } catch (e) {
      console.error("[ChatController] markRead error", e);
      const statusCode = e.message.includes("Not authorized") ? 403 : 500;
      res.status(statusCode).json({ message: e.message });
    }
  }
}

module.exports = ChatController;
