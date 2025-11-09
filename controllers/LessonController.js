const Lesson = require("../models/Lesson");
const { User } = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");

class LessonController {
  static async getAvailableLessons(req, res) {
    try {
      const { type = "lesson" } = req.query; 
      const lessons = await Lesson.find({ 
        status: "available",
        type: type 
      }).populate("instructor", "firstName lastName role");
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async bookLesson(req, res) {
    const { lessonId } = req.body;
    const studentId = req.user?._id;

    try {
      const lesson = await Lesson.findById(lessonId);
      const student = await User.findById(studentId);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (lesson.status !== "available") {
        return res.status(400).json({ message: "Lesson not available" });
      }

      if (lesson.type === "lesson" && student.purchasedLessons <= 0) {
        return res.status(400).json({ message: "No purchased lessons available" });
      }
      
      if (lesson.type === "exam" && student.purchasedExams <= 0) {
        return res.status(400).json({ message: "No purchased exams available" });
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

      res.json({ message: `${lesson.type} booked successfully`, lesson });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getAllLessons(req, res) {
    try {
      const lessons = await Lesson.find({})
        .populate("instructor", "firstName lastName role")
        .populate("student", "firstName lastName role")
        .sort({ date: 1 });
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getInstructorsLessons(req, res) {
    try {
      const instructorId = req.user?._id;
      const lessons = await Lesson.find({ instructor: instructorId })
        .populate("instructor", "firstName lastName role")
        .populate("student", "firstName lastName role")
        .sort({ date: 1 });
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getStudentLessons(req, res) {
    try {
      const studentId = req.user?._id;
      const lessons = await Lesson.find({ 
        student: studentId,
        status: "booked" 
      })
        .populate("instructor", "firstName lastName role")
        .populate("student", "firstName lastName role")
        .sort({ date: 1 });
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getLessonOffer(req, res) {
    try {
      const instructorId = req.user?._id;

      const lessons = await Lesson.find({ instructor: instructorId })
        .populate("instructor", "firstName lastName role")
        .populate("student", "firstName lastName role")
        .sort({ date: 1 });

      const today = new Date();
      const { startOfWeek: thisWeekStart } = getWeekBounds(today);

      const nextWeekStart = new Date(thisWeekStart);
      nextWeekStart.setDate(thisWeekStart.getDate() + 7);

      let lessonDate = null;
      let attempt = 0
      while (attempt < 100) {
        attempt++
        const dayOffset = Math.floor(Math.random() * 7); // Random day of week
        const currentDay = new Date(nextWeekStart);
        currentDay.setDate(nextWeekStart.getDate() + dayOffset);

        const startHour = 8 + Math.floor(Math.random() * 11); // 8:00 - 18:00 (last lesson ends at 20:00)

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

      res.json(lessonDate);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async changeLesson(req, res) {
    try {
      const { oldLessonId, newDate } = req.body;

      const oldLesson = await Lesson.findById(oldLessonId)
        .populate("instructor", "firstName lastName pushTokens role")
        .populate("student", "firstName lastName pushTokens role");
      if (!oldLesson) {
        return res.status(404).json({ message: "Lesson not found" });
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

      // Create new lesson as available (not booked)
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
          const { notifyLessonChanged } = require("../services/notificationService");
          await notifyLessonChanged(oldLesson, newLesson, oldLesson.instructor, oldLesson.student);
        } catch (e) {
          console.log("Notification error:", e.message);
        }
      }

      
      res.json({
        oldLesson: {
          _id: oldLesson._id,
          date: oldLesson.date,
          instructor: oldLesson.instructor,
          status: oldLesson.status,
        },
        newLesson: {
          _id: newLesson._id,
          date: newLesson.date,
          instructor: newLesson.instructor,
          status: newLesson.status,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async cancelLesson(req, res) {
    try {
      const { lessonId } = req.body;
      const studentId = req.user?._id;
      const lesson = await Lesson.findById(lessonId)
        .populate("instructor", "firstName lastName pushTokens role")
        .populate("student", "firstName lastName pushTokens role");
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Ensure the requester is the student who booked this lesson
      const lessonStudentIdStr = lesson?.student?._id
        ? lesson.student._id.toString()
        : typeof lesson?.student?.toString === "function"
        ? lesson.student.toString()
        : null;

      if (!lessonStudentIdStr || lessonStudentIdStr !== studentId.toString()) {
        return res.status(403).json({ message: "Not authorized to cancel this lesson" });
      }

      if (lesson.status !== "booked") {
        return res.status(400).json({ message: "Lesson is not booked" });
      }

      
      const lessonDate = new Date(lesson.date);
      const now = new Date();
      const hoursDifference = (lessonDate - now) / (1000 * 60 * 60);

      const refundBalance = hoursDifference >= 24;

      
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


      // notify instructor about student cancellation
      try {
        const { notifyLessonCanceledByStudent } = require("../services/notificationService");
        const student = lesson.student && lesson.student._id ? lesson.student : await User.findById(studentId);
        const instructor = lesson.instructor && lesson.instructor._id ? lesson.instructor : await User.findById(lesson.instructor);
        if (student && instructor) {
          await notifyLessonCanceledByStudent(lesson, student, instructor);
        }
      } catch (e) {
        console.log('Notification error:', e.message);
      }

      res.json({ 
        message: `${lesson.type} cancelled successfully`,
        refunded: refundBalance,
        hoursBefore: hoursDifference.toFixed(1),
        lesson 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}
module.exports = LessonController;
