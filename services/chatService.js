const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { User } = require("../models/User");

async function ensureChatBetween(userAId, userBId) {
  // Determine roles by fetching users
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

module.exports = { ensureChatBetween, createMessage, getUnreadCount };
