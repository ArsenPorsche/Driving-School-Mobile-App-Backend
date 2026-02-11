const ROLES = Object.freeze({
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
});

const LESSON_STATUS = Object.freeze({
  AVAILABLE: "available",
  BOOKED: "booked",
  COMPLETED: "completed",
  CANCELED: "canceled",
});

const LESSON_TYPE = Object.freeze({
  LESSON: "lesson",
  EXAM: "exam",
});

const EXAM_RESULT = Object.freeze({
  PASSED: "passed",
  FAILED: "failed",
  PENDING: "pending",
});

const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
});

const PRODUCT_CATEGORY = Object.freeze({
  SINGLE: "single",
  BUNDLE: "bundle",
  COURSE: "course",
});

const MESSAGE_TYPE = Object.freeze({
  TEXT: "text",
  SYSTEM: "system",
});

const NOTIFICATION_TYPE = Object.freeze({
  LESSON_CANCELED: "lesson_canceled",
  LESSON_COMPLETED: "lesson_completed",
  ORDER_CONFIRMED: "order_confirmed",
  SYSTEM: "system",
});

// Schedule config
const SCHEDULE = Object.freeze({
  LESSONS_PER_WEEK: 16,
  EXAMS_PER_WEEK: 4,
  LESSON_DURATION_HOURS: 2,
  WORK_START_HOUR: 8,
  WORK_HOURS_SPAN: 11, // 8..18
  CANCEL_REFUND_HOURS: 24,
  MAX_SCHEDULE_ATTEMPTS: 100,
});

// Rating
const RATING = Object.freeze({
  MIN: 1,
  MAX: 5,
});

module.exports = {
  ROLES,
  LESSON_STATUS,
  LESSON_TYPE,
  EXAM_RESULT,
  ORDER_STATUS,
  PRODUCT_CATEGORY,
  MESSAGE_TYPE,
  NOTIFICATION_TYPE,
  SCHEDULE,
  RATING,
};
