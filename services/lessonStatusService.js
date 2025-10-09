const Lesson = require("../models/Lesson");

class LessonStatusService {
  static async updateExpiredBookedLessons() {
    try {
      const now = new Date();
      
      const result = await Lesson.updateMany(
        {
          date: { $lt: now },
          status: "booked",
          student: { $exists: true }
        },
        {
          $set: { status: "completed" }
        }
      );

      console.log(`Updated ${result.modifiedCount} booked lessons to completed`);
      return result.modifiedCount;

    } catch (error) {
      console.error("Error updating expired booked lessons:", error);
      throw error;
    }
  }

  static async cleanupOldAvailableSlots() {
    try {
      const now = new Date();
      
      const result = await Lesson.deleteMany({
        date: { $lt: now },
        status: "available",
        student: { $exists: false }
      });

      console.log(`Deleted ${result.deletedCount} old available lesson slots`);
      return result.deletedCount;

    } catch (error) {
      console.error("Error cleaning up old available slots:", error);
      throw error;
    }
  }
}

module.exports = LessonStatusService;