const cron = require("node-cron");
const { generateTwoWeekSchedule } = require("../services/scheduleService");
const LessonStatusService = require("../services/lessonStatusService");

const scheduleJob = () => {
  cron.schedule("* * * * *", async () => { //0 0 * * 1
    try {
      await generateTwoWeekSchedule();
    } catch (error) {
      console.error("Error generating schedule:", error.message);
    }
  });

  cron.schedule("* * * * *", async () => {
    try {
      await LessonStatusService.updateExpiredBookedLessons();
    } catch (error) {
      console.error("Error updating lesson statuses:", error.message);
      // Don't crash the server, just log and continue
    }
  });

  cron.schedule("* * * * *", async () => {
    try {
      await LessonStatusService.cleanupOldAvailableSlots();
    } catch (error) {
      console.error("Error cleaning up old slots:", error.message);
      // Don't crash the server, just log and continue
    }
  });

  console.log("Scheduled jobs initialized successfully");
};

module.exports = scheduleJob;
