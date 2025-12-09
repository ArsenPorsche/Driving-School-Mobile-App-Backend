const Lesson = require("../models/Lesson");
const { User } = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");
const { notifyLessonChanged, notifyLessonCanceledByStudent } = require("./notificationService");

class LessonService {
  static async getAvailableLessons(type = "lesson") {
    return await Lesson.find({ 
      status: "available",
      type: type 
    }).populate("instructor", "firstName lastName role");
  }

  static async bookLesson(lessonId, studentId) {
    const lesson = await Lesson.findById(lessonId);
    const student = await User.findById(studentId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (!student) {
      throw new Error("Student not found");
    }

    if (lesson.status !== "available") {
      throw new Error("Lesson not available");
    }

    if (lesson.type === "lesson" && student.purchasedLessons <= 0) {
      throw new Error("No purchased lessons available");
    }
    
    if (lesson.type === "exam" && student.purchasedExams <= 0) {
      throw new Error("No purchased exams available");
    }

    lesson.student = student._id;
    lesson.status = "booked";
    await lesson.save();

    if (lesson.type === "lesson") {
      student.purchasedLessons = student.purchasedLessons - 1;
    } else if (lesson.type === "exam") {
      student.purchasedExams = student.purchasedExams - 1;
    }
    await student.save();

    return lesson;
  }

  static async getAllLessons() {
    return await Lesson.find({})
      .populate("instructor", "firstName lastName role")
      .populate("student", "firstName lastName role")
      .sort({ date: 1 });
  }

  static async getInstructorLessons(instructorId) {
    return await Lesson.find({ instructor: instructorId })
      .populate("instructor", "firstName lastName role")
      .populate("student", "firstName lastName role")
      .sort({ date: 1 });
  }

  static async getStudentLessons(studentId) {
    return await Lesson.find({ 
      student: studentId,
      status: "booked" 
    })
      .populate("instructor", "firstName lastName role")
      .populate("student", "firstName lastName role")
      .sort({ date: 1 });
  }

  static async generateLessonOffer(instructorId) {
    const lessons = await Lesson.find({ instructor: instructorId })
      .populate("instructor", "firstName lastName role")
      .populate("student", "firstName lastName role")
      .sort({ date: 1 });

    const today = new Date();
    const { startOfWeek: thisWeekStart } = getWeekBounds(today);

    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);

    let lessonDate = null;
    let attempt = 0;
    
    while (attempt < 100) {
      attempt++;
      const dayOffset = Math.floor(Math.random() * 7);
      const currentDay = new Date(nextWeekStart);
      currentDay.setDate(nextWeekStart.getDate() + dayOffset);

      const startHour = 8 + Math.floor(Math.random() * 11);
      currentDay.setHours(startHour, 0, 0, 0);

      const newStart = new Date(currentDay);
      const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

      const hasConflict = lessons.some((existing) => {
        const existingStart = new Date(existing.date);
        const existingEnd = new Date(
          existingStart.getTime() + 2 * 60 * 60 * 1000
        );

        return newStart < existingEnd && newEnd > existingStart;
      });
      
      if (!hasConflict) {
        lessonDate = newStart;
        break;
      }
    }

    return lessonDate;
  }

  static async changeLesson(oldLessonId, newDate) {
    const oldLesson = await Lesson.findById(oldLessonId)
      .populate("instructor", "firstName lastName pushTokens role")
      .populate("student", "firstName lastName pushTokens role");
      
    if (!oldLesson) {
      throw new Error("Lesson not found");
    }

    const wasBooked = oldLesson.status === "booked" && oldLesson.student;
    
    if (wasBooked) {
      const student = await User.findById(oldLesson.student._id);
      if (student) {
        if (oldLesson.type === "lesson") {
          student.purchasedLessons += 1;
        } else if (oldLesson.type === "exam") {
          student.purchasedExams += 1;
        }
        await student.save();
      }
    }
    
    oldLesson.status = "canceled";
    await oldLesson.save();

    const newLesson = new Lesson({
      date: new Date(newDate),
      instructor: oldLesson.instructor,
      status: "available",
      type: oldLesson.type,
      duration: oldLesson.duration,
    });
    await newLesson.save();

    if (wasBooked) {
      try {
        await notifyLessonChanged(oldLesson, newLesson, oldLesson.instructor, oldLesson.student);
      } catch (e) {
        console.log("Notification error:", e.message);
      }
    }

    return { oldLesson, newLesson };
  }

  static async cancelLesson(lessonId, studentId) {
    const lesson = await Lesson.findById(lessonId)
      .populate("instructor", "firstName lastName pushTokens role")
      .populate("student", "firstName lastName pushTokens role");
      
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const lessonStudentIdStr = lesson?.student?._id
      ? lesson.student._id.toString()
      : typeof lesson?.student?.toString === "function"
      ? lesson.student.toString()
      : null;

    if (!lessonStudentIdStr || lessonStudentIdStr !== studentId.toString()) {
      throw new Error("Not authorized to cancel this lesson");
    }

    if (lesson.status !== "booked") {
      throw new Error("Lesson is not booked");
    }

    const lessonDate = new Date(lesson.date);
    const now = new Date();
    const hoursDifference = (lessonDate - now) / (1000 * 60 * 60);
    const refundBalance = hoursDifference >= 24;

    const studentData = lesson.student;
    const instructorData = lesson.instructor;
    
    lesson.status = "available";
    lesson.student = undefined;
    await lesson.save();

    if (refundBalance) {
      const student = await User.findById(studentId);
      if (lesson.type === "lesson") {
        student.purchasedLessons += 1;
      } else if (lesson.type === "exam") {
        student.purchasedExams += 1;
      }
      await student.save();
    }

    try {
      const student = studentData && studentData._id ? studentData : await User.findById(studentId);
      const instructor = instructorData && instructorData._id ? instructorData : await User.findById(lesson.instructor);
      if (student && instructor) {
        await notifyLessonCanceledByStudent(lesson, student, instructor);
      }
    } catch (e) {
      console.log('Notification error:', e.message);
    }

    return { lesson, refunded: refundBalance, hoursBefore: hoursDifference };
  }

  static async getLessonHistory(studentId) {
    return await Lesson.find({ 
      student: studentId,
      status: { $in: ["completed", "canceled"] }
    })
      .populate("instructor", "firstName lastName role")
      .sort({ date: -1 });
  }

  static async getInstructorHistory(instructorId) {
    return await Lesson.find({ 
      instructor: instructorId,
      status: { $in: ["completed", "canceled"] }
    })
      .populate("student", "firstName lastName role")
      .sort({ date: -1 });
  }

  static async setExamResult(lessonId, instructorId, wynik) {
    if (!wynik || !["passed", "failed", "pending"].includes(wynik)) {
      throw new Error("Result must be 'passed', 'failed', or 'pending'");
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (lesson.instructor.toString() !== instructorId.toString()) {
      throw new Error("Not authorized to set result for this lesson");
    }

    if (lesson.type !== "exam") {
      throw new Error("Can only set results for exams");
    }

    if (lesson.status !== "completed") {
      throw new Error("Can only set results for completed exams");
    }

    lesson.wynik = wynik;
    await lesson.save();

    return lesson;
  }

  static async rateLesson(lessonId, studentId, rating) {
    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (!lesson.student) {
      throw new Error("This lesson has no student assigned");
    }

    if (lesson.student.toString() !== studentId.toString()) {
      throw new Error("Not authorized to rate this lesson");
    }

    if (lesson.status !== "completed" && lesson.status !== "canceled") {
      throw new Error("Can only rate completed or canceled lessons");
    }

    if (lesson.rated) {
      throw new Error("Lesson already rated");
    }

    lesson.rating = rating;
    lesson.rated = true;
    await lesson.save();

    return lesson;
  }
}

module.exports = LessonService;
