const { Expo } = require("expo-server-sdk");
const Notification = require("../models/Notification");
const expo = new Expo();

async function sendToTokens(tokens, message) {
  console.log("[notificationService] sendToTokens called with", tokens?.length, "tokens");
  if (!Array.isArray(tokens) || tokens.length === 0) {
    console.log("[notificationService] No tokens to send to");
    return;
  }
  const messages = [];
  for (const token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
      console.log("[notificationService] Invalid token:", token);
      continue;
    }
    messages.push({
      to: token,
      sound: "default",
      title: message.title,
      body: message.body,
      data: message.data || {},
    });
  }
  console.log("[notificationService] Prepared", messages.length, "messages");
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log("[notificationService] Sent chunk, receipts:", receipts);
    } catch (e) {
      console.log("[notificationService] Error sending chunk:", e.message);
    }
  }
}

async function notifyLessonChanged(oldLesson, newLesson, instructor, student) {
  console.log("[notificationService] notifyLessonChanged called");
  console.log("[notificationService] student:", student?._id);
  
  if (!student?._id) {
    console.log("[notificationService] No student provided");
    return;
  }

  const typeLabel = oldLesson.type === "exam" ? "Exam" : "Lesson";
  const oldWhen = new Date(oldLesson.date).toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  const newWhen = new Date(newLesson.date).toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const title = `${typeLabel} canceled`;
  const body = `Your ${typeLabel.toLowerCase()} on ${oldWhen} was canceled by ${instructor.firstName} ${instructor.lastName}. A new slot is available on ${newWhen}. Your balance was refunded.`;
  const data = { 
    oldLessonId: String(oldLesson._id), 
    newLessonId: String(newLesson._id), 
    type: oldLesson.type, 
    reason: "instructor_change" 
  };

  try {
    await Notification.create({
      user: student._id,
      instructor: instructor._id,
      title,
      body,
      type: "lesson_canceled",
      data,
    });
    console.log("[notificationService] Notification saved to DB");
  } catch (e) {
    console.log("[notificationService] Error saving to DB:", e.message);
  }

  if (student?.pushTokens?.length) {
    console.log("[notificationService] Sending push notification to", student.pushTokens.length, "tokens");
    await sendToTokens(student.pushTokens, { title, body, data });
  } else {
    console.log("[notificationService] No push tokens, skipping push notification");
  }
}

module.exports = { notifyLessonChanged };
