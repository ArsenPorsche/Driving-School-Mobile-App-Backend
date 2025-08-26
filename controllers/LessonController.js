const Lesson = require("../models/Lesson");
const {User} = require("../models/User");

class LessonController {
  static async getAvailableLessons(req, res) {
    try {
      const lessons = await Lesson.find({ status: "available" }).populate(
        "instructor", "firstName lastName role"
      );
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async bookLesson(req, res) {
    const { lessonId, studentEmail } = req.body;

    try {
      const lesson = await Lesson.findById(lessonId);
      const student = await User.findOne({ email: studentEmail });

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
}

module.exports = LessonController