const Lesson = require("../models/Lesson");
const { User } = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");

class LessonController {
  static async getAvailableLessons(req, res) {
    try {
      const lessons = await Lesson.find({ status: "available" }).populate(
        "instructor",
        "firstName lastName role"
      );
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async bookLesson(req, res) {
    const { lessonId, studentId } = req.body;

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

      lesson.student = student._id;
      lesson.status = "booked";
      await lesson.save();

      console.log("Lesson booked successfully:", {
        lessonId: lesson._id,
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        date: lesson.date,
      });

      res.json({ message: "Lesson booked successfully", lesson });
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
      const { instructorId } = req.query;
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
      const { instructorId } = req.query;
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

  static async purchaseItems(req, res) {
    try {
      const { userId, items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }

      let totalLessons = 0;
      let totalExams = 0;

      for (const item of items) {
        if (!item || typeof item !== 'object' || !item.type || typeof item.quantity !== 'number') {
          return res.status(400).json({ error: "Each item must have type and quantity" });
        }
        
        if (item.type === "lesson") {
          totalLessons += item.quantity;
        } else if (item.type === "exam") {
          totalExams += item.quantity;
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            purchasedLessons: totalLessons,
            purchasedExams: totalExams
          }
        },
        { new: true }
      );

      res.json({
        message: "Purchase successful",
        purchasedLessons: updatedUser.purchasedLessons,
        purchasedExams: updatedUser.purchasedExams
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPurchasedLessons(req, res) {
    try {
      const { userId } = req.query;
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const lessons = {
        purchasedLessons: user.purchasedLessons,
        purchasedExams: user.purchasedExams
      };
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}
module.exports = LessonController;
