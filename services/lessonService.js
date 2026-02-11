const Lesson = require("../models/Lesson");
const { User } = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");
const AppError = require("../utils/AppError");
const { LESSON_STATUS, LESSON_TYPE, EXAM_RESULT, SCHEDULE, RATING } = require("../config/constants");
const { notifyLessonChanged, notifyLessonCanceledByStudent } = require("./notificationService");

const POPULATE_INSTRUCTOR = "firstName lastName role";
const POPULATE_STUDENT = "firstName lastName role";
const POPULATE_WITH_TOKENS = "firstName lastName pushTokens role";

class LessonService {
  static async getAvailableLessons(type = LESSON_TYPE.LESSON) {
    return Lesson.find({ status: LESSON_STATUS.AVAILABLE, type })
      .populate("instructor", POPULATE_INSTRUCTOR);
  }

  static async bookLesson(lessonId, studentId) {
    const [lesson, student] = await Promise.all([
      Lesson.findById(lessonId),
      User.findById(studentId),
    ]);

    if (!lesson) throw AppError.notFound("Lesson not found");
    if (!student) throw AppError.notFound("Student not found");
    if (lesson.status !== LESSON_STATUS.AVAILABLE) {
      throw AppError.badRequest("Lesson not available");
    }

    if (lesson.type === LESSON_TYPE.LESSON && student.purchasedLessons <= 0) {
      throw AppError.badRequest("No purchased lessons available");
    }
    if (lesson.type === LESSON_TYPE.EXAM && student.purchasedExams <= 0) {
      throw AppError.badRequest("No purchased exams available");
    }

    lesson.student = student._id;
    lesson.status = LESSON_STATUS.BOOKED;

    if (lesson.type === LESSON_TYPE.LESSON) {
      student.purchasedLessons -= 1;
    } else {
      student.purchasedExams -= 1;
    }

    await Promise.all([lesson.save(), student.save()]);
    return lesson;
  }

  static async getAllLessons() {
    return Lesson.find()
      .populate("instructor", POPULATE_INSTRUCTOR)
      .populate("student", POPULATE_STUDENT)
      .sort({ date: 1 });
  }

  static async getInstructorLessons(instructorId) {
    return Lesson.find({ instructor: instructorId })
      .populate("instructor", POPULATE_INSTRUCTOR)
      .populate("student", POPULATE_STUDENT)
      .sort({ date: 1 });
  }

  static async getStudentLessons(studentId) {
    return Lesson.find({ student: studentId, status: LESSON_STATUS.BOOKED })
      .populate("instructor", POPULATE_INSTRUCTOR)
      .populate("student", POPULATE_STUDENT)
      .sort({ date: 1 });
  }

  static async generateLessonOffer(instructorId) {
    const lessons = await Lesson.find({ instructor: instructorId }).sort({ date: 1 });

    const today = new Date();
    const { startOfWeek: thisWeekStart } = getWeekBounds(today);
    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);

    const durationMs = SCHEDULE.LESSON_DURATION_HOURS * 60 * 60 * 1000;

    for (let attempt = 0; attempt < SCHEDULE.MAX_SCHEDULE_ATTEMPTS; attempt++) {
      const dayOffset = Math.floor(Math.random() * 7);
      const currentDay = new Date(nextWeekStart);
      currentDay.setDate(nextWeekStart.getDate() + dayOffset);

      const startHour = SCHEDULE.WORK_START_HOUR + Math.floor(Math.random() * SCHEDULE.WORK_HOURS_SPAN);
      currentDay.setHours(startHour, 0, 0, 0);

      const newStart = new Date(currentDay);
      const newEnd = new Date(newStart.getTime() + durationMs);

      const hasConflict = lessons.some((existing) => {
        const existingStart = new Date(existing.date);
        const existingEnd = new Date(existingStart.getTime() + durationMs);
        return newStart < existingEnd && newEnd > existingStart;
      });

      if (!hasConflict) return newStart;
    }

    return null;
  }

  static async changeLesson(oldLessonId, newDate) {
    const oldLesson = await Lesson.findById(oldLessonId)
      .populate("instructor", POPULATE_WITH_TOKENS)
      .populate("student", POPULATE_WITH_TOKENS);

    if (!oldLesson) throw AppError.notFound("Lesson not found");

    const wasBooked = oldLesson.status === LESSON_STATUS.BOOKED && oldLesson.student;

    // Refund balance if lesson was booked
    if (wasBooked) {
      const student = await User.findById(oldLesson.student._id);
      if (student) {
        if (oldLesson.type === LESSON_TYPE.LESSON) student.purchasedLessons += 1;
        else student.purchasedExams += 1;
        await student.save();
      }
    }

    oldLesson.status = LESSON_STATUS.CANCELED;
    await oldLesson.save();

    const newLesson = await Lesson.create({
      date: new Date(newDate),
      instructor: oldLesson.instructor,
      status: LESSON_STATUS.AVAILABLE,
      type: oldLesson.type,
      duration: oldLesson.duration,
    });

    if (wasBooked) {
      notifyLessonChanged(oldLesson, newLesson, oldLesson.instructor, oldLesson.student).catch((e) =>
        console.error("Notification error:", e.message)
      );
    }

    return { oldLesson, newLesson };
  }

  static async cancelLesson(lessonId, studentId) {
    const lesson = await Lesson.findById(lessonId)
      .populate("instructor", POPULATE_WITH_TOKENS)
      .populate("student", POPULATE_WITH_TOKENS);

    if (!lesson) throw AppError.notFound("Lesson not found");

    const lessonStudentId = lesson.student?._id?.toString() ?? lesson.student?.toString();
    if (!lessonStudentId || lessonStudentId !== studentId.toString()) {
      throw AppError.forbidden("Not authorized to cancel this lesson");
    }

    if (lesson.status !== LESSON_STATUS.BOOKED) {
      throw AppError.badRequest("Lesson is not booked");
    }

    const hoursDifference = (new Date(lesson.date) - new Date()) / (1000 * 60 * 60);
    const refundBalance = hoursDifference >= SCHEDULE.CANCEL_REFUND_HOURS;

    const studentData = lesson.student;
    const instructorData = lesson.instructor;

    lesson.status = LESSON_STATUS.AVAILABLE;
    lesson.student = undefined;
    await lesson.save();

    if (refundBalance) {
      const student = await User.findById(studentId);
      if (lesson.type === LESSON_TYPE.LESSON) student.purchasedLessons += 1;
      else student.purchasedExams += 1;
      await student.save();
    }

    // Background notification — don't block response
    const student = studentData?._id ? studentData : await User.findById(studentId);
    const instructor = instructorData?._id ? instructorData : await User.findById(lesson.instructor);
    if (student && instructor) {
      notifyLessonCanceledByStudent(lesson, student, instructor).catch((e) =>
        console.error("Notification error:", e.message)
      );
    }

    return { lesson, refunded: refundBalance, hoursBefore: hoursDifference };
  }

  static async getLessonHistory(studentId) {
    return Lesson.find({
      student: studentId,
      status: { $in: [LESSON_STATUS.COMPLETED, LESSON_STATUS.CANCELED] },
    })
      .populate("instructor", POPULATE_INSTRUCTOR)
      .sort({ date: -1 });
  }

  static async getInstructorHistory(instructorId) {
    return Lesson.find({
      instructor: instructorId,
      status: { $in: [LESSON_STATUS.COMPLETED, LESSON_STATUS.CANCELED] },
    })
      .populate("student", POPULATE_STUDENT)
      .sort({ date: -1 });
  }

  static async setExamResult(lessonId, instructorId, wynik) {
    if (!Object.values(EXAM_RESULT).includes(wynik)) {
      throw AppError.badRequest("Result must be 'passed', 'failed', or 'pending'");
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw AppError.notFound("Lesson not found");

    if (lesson.instructor.toString() !== instructorId.toString()) {
      throw AppError.forbidden("Not authorized to set result for this lesson");
    }
    if (lesson.type !== LESSON_TYPE.EXAM) {
      throw AppError.badRequest("Can only set results for exams");
    }
    if (lesson.status !== LESSON_STATUS.COMPLETED) {
      throw AppError.badRequest("Can only set results for completed exams");
    }

    lesson.wynik = wynik;
    await lesson.save();
    return lesson;
  }

  static async rateLesson(lessonId, studentId, rating) {
    if (!rating || rating < RATING.MIN || rating > RATING.MAX) {
      throw AppError.badRequest(`Rating must be between ${RATING.MIN} and ${RATING.MAX}`);
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw AppError.notFound("Lesson not found");
    if (!lesson.student) throw AppError.badRequest("This lesson has no student assigned");

    if (lesson.student.toString() !== studentId.toString()) {
      throw AppError.forbidden("Not authorized to rate this lesson");
    }
    if (lesson.status !== LESSON_STATUS.COMPLETED && lesson.status !== LESSON_STATUS.CANCELED) {
      throw AppError.badRequest("Can only rate completed or canceled lessons");
    }
    if (lesson.rated) {
      throw AppError.badRequest("Lesson already rated");
    }

    lesson.rating = rating;
    lesson.rated = true;
    await lesson.save();
    return lesson;
  }
}

module.exports = LessonService;
