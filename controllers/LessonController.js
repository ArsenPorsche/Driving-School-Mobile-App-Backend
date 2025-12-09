const LessonService = require("../services/lessonService");

class LessonController {
  static async getAvailableLessons(req, res) {
    try {
      const { type = "lesson" } = req.query;
      const lessons = await LessonService.getAvailableLessons(type);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async bookLesson(req, res) {
    try {
      const { lessonId } = req.body;
      const studentId = req.user?._id;
      const lesson = await LessonService.bookLesson(lessonId, studentId);
      res.json({ message: `${lesson.type} booked successfully`, lesson });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 
                         error.message.includes("not available") || 
                         error.message.includes("No purchased") ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async getAllLessons(req, res) {
    try {
      const lessons = await LessonService.getAllLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getInstructorsLessons(req, res) {
    try {
      const instructorId = req.user?._id;
      const lessons = await LessonService.getInstructorLessons(instructorId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getStudentLessons(req, res) {
    try {
      const studentId = req.user?._id;
      const lessons = await LessonService.getStudentLessons(studentId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getLessonOffer(req, res) {
    try {
      const instructorId = req.user?._id;
      const lessonDate = await LessonService.generateLessonOffer(instructorId);
      res.json(lessonDate);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async changeLesson(req, res) {
    try {
      const { oldLessonId, newDate } = req.body;
      const { oldLesson, newLesson } = await LessonService.changeLesson(oldLessonId, newDate);
      
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
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async cancelLesson(req, res) {
    try {
      const { lessonId } = req.body;
      const studentId = req.user?._id;
      const { lesson, refunded, hoursBefore } = await LessonService.cancelLesson(lessonId, studentId);
      
      res.json({ 
        message: `${lesson.type} cancelled successfully`,
        refunded,
        hoursBefore: hoursBefore.toFixed(1),
        lesson 
      });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 :
                         error.message.includes("Not authorized") ? 403 :
                         error.message.includes("not booked") ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async getLessonHistory(req, res) {
    try {
      const studentId = req.user?._id;
      const lessons = await LessonService.getLessonHistory(studentId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getInstructorHistory(req, res) {
    try {
      const instructorId = req.user?._id;
      const lessons = await LessonService.getInstructorHistory(instructorId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async setExamResult(req, res) {
    try {
      const { lessonId } = req.params;
      const { wynik } = req.body;
      const instructorId = req.user?._id;
      const lesson = await LessonService.setExamResult(lessonId, instructorId, wynik);
      res.json({ message: "Exam result set successfully", lesson });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 :
                         error.message.includes("Not authorized") ? 403 :
                         error.message.includes("must be") || 
                         error.message.includes("Can only") ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async rateLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const { rating } = req.body;
      const studentId = req.user?._id;
      const lesson = await LessonService.rateLesson(lessonId, studentId, rating);
      res.json({ message: "Lesson rated successfully", lesson });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 :
                         error.message.includes("Not authorized") ? 403 :
                         error.message.includes("must be") || 
                         error.message.includes("Can only") ||
                         error.message.includes("already rated") ||
                         error.message.includes("no student") ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

module.exports = LessonController;

