const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { User } = require("../models/User");

async function ensureChatBetween(userAId, userBId) {
  const [userA, userB] = await Promise.all([
    User.findById(userAId).select("role"),
    User.findById(userBId).select("role"),
  ]);

  if (!userA || !userB) throw new Error("Users not found for chat");

  const instructorId = userA.role === "instructor" ? userAId : userB.role === "instructor" ? userBId : null;
  const studentId = userA.role === "student" ? userAId : userB.role === "student" ? userBId : null;

  if (!instructorId || !studentId) {
    throw new Error("Chat participants must include an instructor and a student");
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
  const { encryptString } = require("../utils/crypto");
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
  const count = await Message.countDocuments({
    chat: chatId,
    sender: { $ne: userId },
    readBy: { $ne: userId },
  });
  return count;
}

async function sendSystemMessageFromNotification(studentId, instructorId, text, data = {}) {
  try {
    const chat = await ensureChatBetween(studentId, instructorId);
    
    const message = await createMessage(chat._id, data.sender === 'instructor' ? instructorId : studentId, {
      text,
      type: 'system',
      data,
    });
    
    const { emitChatUpdated } = require("./socket");
    await emitChatUpdated(chat._id);
    
    return message;
  } catch (err) {
    console.log('Error saving system message:', err.message);
    throw err;
  }
}

async function listChats(userId) {
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
  return data;
}

async function getMessages(chatId, userId, before, limit = 50) {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.some(p => p.toString() === userId.toString())) {
    throw new Error("Not authorized for this chat");
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
  
  return messages;
}

async function sendMessage(userId, partnerId, text) {
  if (!partnerId || !text) {
    throw new Error("partnerId and text are required");
  }
  
  const chat = await ensureChatBetween(userId, partnerId);
  const message = await createMessage(chat._id, userId, { text });
  
  const { decryptString } = require("../utils/crypto");
  const plainText = decryptString(message.text || "");
  
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
    emitChatUpdated(chat._id);
  } catch (e) {
    console.log('Socket emit error:', e.message);
  }
  
  return { message, plainText };
}

async function markMessagesAsRead(chatId, userId) {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.some(p => p.toString() === userId.toString())) {
    throw new Error("Not authorized for this chat");
  }
  
  await Message.updateMany(
    { chat: chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
    { $push: { readBy: userId } }
  );
  
  try {
    const { emitChatUpdated } = require("./socket");
    emitChatUpdated(chatId);
  } catch (e) {
    console.log('Socket emit error:', e.message);
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
  markMessagesAsRead
};
