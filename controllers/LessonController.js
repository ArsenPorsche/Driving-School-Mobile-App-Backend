const Lesson = require("../models/Lesson");
const { User } = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");

class LessonController {
  static async getAvailableLessons(req, res) {
    try {
      const { type = "lesson" } = req.query; // Add type filter
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

      // Check balance based on lesson type
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

      console.log(`${lesson.type} booked successfully:`, {
        lessonId: lesson._id,
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        date: lesson.date,
        type: lesson.type,
      });

      res.json({ message: `${lesson.type} booked successfully`, lesson });
    } catch (error) {
      console.error("Error booking lesson:", error);
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

        // Conflict checking with the instructor's other lessons
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

      const oldLesson = await Lesson.findById(oldLessonId);
      if (!oldLesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      oldLesson.status = "canceled";
      await oldLesson.save();

      
      const newLesson = new Lesson({
        date: new Date(newDate),
        instructor: oldLesson.instructor,
        status: "available",
      });
      await newLesson.save();

      
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
      console.log("Server error details:", error.stack); 
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}
module.exports = LessonController;
