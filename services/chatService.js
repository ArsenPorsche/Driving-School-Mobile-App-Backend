const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { User } = require("../models/User");
const AppError = require("../utils/AppError");
const { encryptString, decryptString } = require("../utils/crypto");

// -------- Internal helpers --------

async function ensureChatBetween(userAId, userBId) {
  const [userA, userB] = await Promise.all([
    User.findById(userAId).select("role"),
    User.findById(userBId).select("role"),
  ]);

  if (!userA || !userB) throw AppError.notFound("Users not found for chat");

  const instructorId = userA.role === "instructor" ? userAId : userB.role === "instructor" ? userBId : null;
  const studentId = userA.role === "student" ? userAId : userB.role === "student" ? userBId : null;

  if (!instructorId || !studentId) {
    throw AppError.badRequest("Chat participants must include an instructor and a student");
  }

  let chat = await Chat.findOne({ instructor: instructorId, student: studentId });
  if (!chat) {
    chat = await Chat.create({
      instructor: instructorId,
      student: studentId,
      participants: [instructorId, studentId],
      lastMessage: "",
      lastMessageAt: new Date(),
    });
  }
  return chat;
}

async function createMessage(chatId, senderId, { text = "", type = "text", data = {} } = {}) {
  const encText = encryptString(text);
  const message = await Message.create({
    chat: chatId,
    sender: senderId,
    type,
    text: encText,
    data,
    readBy: [senderId],
  });
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: encText || (type === "system" ? "System message" : ""),
    lastMessageAt: message.createdAt,
  });
  return message;
}

async function getUnreadCount(chatId, userId) {
  return Message.countDocuments({
    chat: chatId,
    sender: { $ne: userId },
    readBy: { $ne: userId },
  });
}

// -------- Public API --------

async function sendSystemMessageFromNotification(studentId, instructorId, text, data = {}) {
  const chat = await ensureChatBetween(studentId, instructorId);
  const senderId = data.sender === "instructor" ? instructorId : studentId;
  const message = await createMessage(chat._id, senderId, { text, type: "system", data });

  const { emitChatUpdated } = require("./socket");
  emitChatUpdated(chat._id).catch(() => {});

  return message;
}

async function listChats(userId) {
  const chats = await Chat.find({ participants: userId })
    .populate("instructor", "firstName lastName role")
    .populate("student", "firstName lastName role")
    .sort({ lastMessageAt: -1 });

  return Promise.all(
    chats.map(async (chat) => ({
      _id: chat._id,
      instructor: chat.instructor,
      student: chat.student,
      lastMessage: decryptString(chat.lastMessage || ""),
      lastMessageAt: chat.lastMessageAt,
      unreadCount: await getUnreadCount(chat._id, userId),
    }))
  );
}

async function getMessages(chatId, userId, before, limit = 50) {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.some((p) => p.toString() === userId.toString())) {
    throw AppError.forbidden("Not authorized for this chat");
  }

  const query = { chat: chatId };
  if (before) query.createdAt = { $lt: new Date(before) };

  const docs = await Message.find(query)
    .populate("sender", "firstName lastName role")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  return docs.map((m) => ({
    _id: m._id,
    chat: m.chat,
    sender: m.sender,
    type: m.type,
    text: decryptString(m.text || ""),
    data: m.data,
    readBy: m.readBy,
    createdAt: m.createdAt,
  }));
}

async function sendMessage(userId, partnerId, text) {
  if (!partnerId || !text) {
    throw AppError.badRequest("partnerId and text are required");
  }

  const chat = await ensureChatBetween(userId, partnerId);
  const message = await createMessage(chat._id, userId, { text });
  const plainText = decryptString(message.text || "");

  // Fire-and-forget socket events
  try {
    const { emitToChat, emitChatUpdated } = require("./socket");
    emitToChat(chat._id, "message:new", {
      _id: message._id,
      sender: { _id: message.sender },
      type: message.type,
      text: plainText,
      data: message.data,
      createdAt: message.createdAt,
    });
    emitChatUpdated(chat._id).catch(() => {});
  } catch {
    // Socket not critical for API response
  }

  return { message, plainText };
}

async function markMessagesAsRead(chatId, userId) {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.some((p) => p.toString() === userId.toString())) {
    throw AppError.forbidden("Not authorized for this chat");
  }

  await Message.updateMany(
    { chat: chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
    { $push: { readBy: userId } }
  );

  try {
    const { emitChatUpdated } = require("./socket");
    emitChatUpdated(chatId).catch(() => {});
  } catch {
    // Socket not critical
  }
}

module.exports = {
  ensureChatBetween,
  createMessage,
  getUnreadCount,
  sendSystemMessageFromNotification,
  listChats,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};
