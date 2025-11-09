const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { ensureChatBetween, createMessage, getUnreadCount } = require("../services/chatService");

class ChatController {
  static async listChats(req, res) {
    try {
      const userId = req.user._id;
      const { decryptString } = require("../utils/crypto");
      const chats = await Chat.find({ participants: userId })
        .populate("instructor", "firstName lastName role")
        .populate("student", "firstName lastName role")
        .sort({ lastMessageAt: -1 });

      const data = [];
      for (const chat of chats) {
        const unread = await getUnreadCount(chat._id, userId);
        data.push({
          _id: chat._id,
            instructor: chat.instructor,
            student: chat.student,
            lastMessage: decryptString(chat.lastMessage || ""),
            lastMessageAt: chat.lastMessageAt,
            unreadCount: unread,
        });
      }
      res.json({ chats: data });
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
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({ message: "Not authorized for this chat" });
      }
      const findQuery = { chat: chatId };
      if (before) {
        findQuery.createdAt = { $lt: new Date(before) };
      }
      const docs = await Message.find(findQuery)
        .populate("sender", "firstName lastName role")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
      const { decryptString } = require("../utils/crypto");
      const messages = docs.map((m) => ({
        _id: m._id,
        chat: m.chat,
        sender: m.sender,
        type: m.type,
        text: decryptString(m.text || ""),
        data: m.data,
        readBy: m.readBy,
        createdAt: m.createdAt,
      }));
      res.json({ messages });
    } catch (e) {
      console.error("[ChatController] getMessages error", e);
      res.status(500).json({ message: "Server error", error: e.message });
    }
  }

  static async sendMessage(req, res) {
    try {
      const userId = req.user._id;
      const { partnerId, text } = req.body;
      if (!partnerId || !text) {
        return res.status(400).json({ message: "partnerId and text are required" });
      }
      const chat = await ensureChatBetween(userId, partnerId);
      const message = await createMessage(chat._id, userId, { text });

      // Decrypt text for response and emit
      const { decryptString } = require("../utils/crypto");
      const plainText = decryptString(message.text || "");

      try {
        const { emitToChat, emitChatUpdated } = require("../services/socket");
        emitToChat(chat._id, "message:new", {
          _id: message._id,
          sender: { _id: message.sender },
          type: message.type,
          text: plainText,
          data: message.data,
          createdAt: message.createdAt,
        });
        emitChatUpdated(chat._id); // notify lists to refresh
      } catch {}

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
      res.status(500).json({ message: "Server error", error: e.message });
    }
  }

  static async markRead(req, res) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({ message: "Not authorized for this chat" });
      }
      await Message.updateMany({ chat: chatId, sender: { $ne: userId }, readBy: { $ne: userId } }, { $push: { readBy: userId } });
      try {
        const { emitChatUpdated } = require("../services/socket");
        emitChatUpdated(chatId);
      } catch {}
      res.json({ message: "Marked chat messages as read" });
    } catch (e) {
      console.error("[ChatController] markRead error", e);
      res.status(500).json({ message: "Server error", error: e.message });
    }
  }
}

module.exports = ChatController;
