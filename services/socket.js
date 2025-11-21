const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat");
const { getUnreadCount } = require("./chatService");
const { decryptString } = require("../utils/crypto");

let io;

function init(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      socket.user = { _id: decoded._id, role: decoded.role };
      next();
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userRoom = `user:${socket.user._id}`;
    socket.join(userRoom);

    socket.on("chat:join", async ({ chatId }) => {
      try {
        if (!chatId) return;
        const chat = await Chat.findById(chatId).select("participants");
        if (!chat) return;
        const uid = String(socket.user._id);
        const isMember = chat.participants.some((p) => String(p) === uid);
        if (!isMember) return;
        socket.join(`chat:${chatId}`);
      } catch (e) {
        console.log('Error in chat:join:', e.message);
      }
    });

    socket.on("chat:leave", ({ chatId }) => {
      if (!chatId) return;
      socket.leave(`chat:${chatId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

function emitToChat(chatId, event, payload) {
  if (!io) return;
  io.to(`chat:${chatId}`).emit(event, payload);
}

function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

async function emitChatUpdated(chatId) {
  if (!io) return;
  try {
    const chat = await Chat.findById(chatId)
      .populate("instructor", "firstName lastName role")
      .populate("student", "firstName lastName role");
    if (!chat) return;

    const lastMessage = decryptString(chat.lastMessage || "");
    const base = {
      _id: chat._id,
      instructor: chat.instructor,
      student: chat.student,
      lastMessage,
      lastMessageAt: chat.lastMessageAt,
    };

    for (const uid of chat.participants) {
      const unreadCount = await getUnreadCount(chat._id, uid);
      emitToUser(uid, "chat:updated", { ...base, unreadCount });
    }
  } catch {}
}

module.exports = { init, getIO, emitToChat, emitToUser, emitChatUpdated }; 
