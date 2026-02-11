const chatService = require("../services/chatService");
const asyncHandler = require("../utils/asyncHandler");
const { success, message } = require("../utils/responseHelper");

class ChatController {
  static listChats = asyncHandler(async (req, res) => {
    const chats = await chatService.listChats(req.user._id);
    success(res, { chats });
  });

  static getMessages = asyncHandler(async (req, res) => {
    const { before, limit = 50 } = req.query;
    const messages = await chatService.getMessages(req.params.chatId, req.user._id, before, limit);
    success(res, { messages });
  });

  static sendMessage = asyncHandler(async (req, res) => {
    const { partnerId, text } = req.body;
    const { message: msg, plainText } = await chatService.sendMessage(req.user._id, partnerId, text);

    success(res, {
      message: {
        _id: msg._id,
        chat: msg.chat,
        sender: msg.sender,
        type: msg.type,
        text: plainText,
        data: msg.data,
        createdAt: msg.createdAt,
      },
    });
  });

  static markRead = asyncHandler(async (req, res) => {
    await chatService.markMessagesAsRead(req.params.chatId, req.user._id);
    message(res, "Marked chat messages as read");
  });
}

module.exports = ChatController;
