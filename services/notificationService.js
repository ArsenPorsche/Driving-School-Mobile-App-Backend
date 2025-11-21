const { Expo } = require("expo-server-sdk");
const Notification = require("../models/Notification");
const expo = new Expo();

async function sendToTokens(tokens, message) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return;
  }
  const messages = [];
  for (const token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
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
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (e) {
      console.log("Push send error:", e.message);
    }
  }
}

async function notifyLessonChanged(oldLesson, newLesson, instructor, student) {
  if (!student?._id) {
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
  const body = `Your ${typeLabel.toLowerCase()} on ${oldWhen} was canceled by ${instructor.firstName} ${instructor.lastName}. A new slot is available on ${newWhen}. Student's balance was refunded.`;
  const data = { 
    oldLessonId: String(oldLesson._id), 
    newLessonId: String(newLesson._id), 
    type: oldLesson.type, 
    reason: "instructor_change",
    sender: "instructor",
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
    
    try {
      const { sendSystemMessageFromNotification } = require("./chatService");
      await sendSystemMessageFromNotification(student._id, instructor._id, body, { ...data, action: 'reschedule' });
    } catch (chatErr) {
      console.log('Chat message error:', chatErr.message);
    }
  } catch (e) {
    console.log("Notification save error:", e.message);
  }

  if (student?.pushTokens?.length) {
    await sendToTokens(student.pushTokens, { title, body, data });
  }
}

async function notifyLessonCanceledByStudent(lesson, student, instructor) {
  try {

    const typeLabel = lesson.type === 'exam' ? 'Exam' : 'Lesson';
    const when = new Date(lesson.date).toLocaleString('pl-PL', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const title = `${typeLabel} canceled by student`;
    const body = `${student.firstName || ''} ${student.lastName || ''} cancelled their ${typeLabel.toLowerCase()} scheduled on ${when}.`;
    const data = {
      oldLessonId: String(lesson._id),
      type: lesson.type,
      reason: 'student_cancel',
      sender: 'student',
    };

    try {
      await Notification.create({
        user: instructor._id,
        instructor: student._id,
        title,
        body,
        type: 'lesson_canceled',
        data,
      });
      
      try {
        const { sendSystemMessageFromNotification } = require("./chatService");
        await sendSystemMessageFromNotification(student._id, instructor._id, body, { ...data, action: 'cancel' });
      } catch (chatErr) {
        console.log('Chat message error:', chatErr.message);
      }
    } catch (e) {
      console.log('Notification save error:', e.message);
    }

    // Send push to instructor if tokens
    if (instructor?.pushTokens?.length) {
      await sendToTokens(instructor.pushTokens, { title, body, data });
    }
  } catch (e) {
    console.log('notifyLessonCanceledByStudent error:', e.message);
  }
}

module.exports = { notifyLessonChanged, notifyLessonCanceledByStudent };
