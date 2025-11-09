const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");

class LessonStatusService {
  static async updateExpiredBookedLessons() {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Check if connection is ready
        if (mongoose.connection.readyState !== 1) {
          console.warn("MongoDB not connected, skipping expired lesson update");
          return 0;
        }

        const now = new Date();
        
        const result = await Lesson.updateMany(
          {
            date: { $lt: now },
            status: "booked",
            student: { $exists: true }
          },
          {
            $set: { status: "completed" }
          },
          {
            maxTimeMS: 10000 // 10 second timeout
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`Updated ${result.modifiedCount} expired booked lessons to completed`);
        }

        return result.modifiedCount;

      } catch (error) {
        attempt++;
        console.error(`Error updating expired booked lessons (attempt ${attempt}/${maxRetries}):`, error.message);
        
        // Check if error is retryable
        const isRetryable = 
          error.name === "MongoNetworkError" ||
          error.code === "ECONNRESET" ||
          error.errorLabels?.includes("RetryableWriteError");

        if (isRetryable && attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
  }

  static async cleanupOldAvailableSlots() {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Check if connection is ready
        if (mongoose.connection.readyState !== 1) {
          console.warn("MongoDB not connected, skipping old slots cleanup");
          return 0;
        }

        const now = new Date();
        
        const result = await Lesson.deleteMany(
          {
            date: { $lt: now },
            status: "available",
            student: { $exists: false }
          },
          {
            maxTimeMS: 10000 // 10 second timeout
          }
        );

        if (result.deletedCount > 0) {
          console.log(`Cleaned up ${result.deletedCount} old available slots`);
        }

        return result.deletedCount;

      } catch (error) {
        attempt++;
        console.error(`Error cleaning up old available slots (attempt ${attempt}/${maxRetries}):`, error.message);
        
        // Check if error is retryable
        const isRetryable = 
          error.name === "MongoNetworkError" ||
          error.code === "ECONNRESET" ||
          error.errorLabels?.includes("RetryableWriteError");

        if (isRetryable && attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
  }
}

module.exports = LessonStatusService;