const cron = require("node-cron");
const { generateTwoWeekSchedule } = require("../services/scheduleService");
const LessonStatusService = require("../services/lessonStatusService");

const scheduleJob = () => {
  cron.schedule("* * * * *", () => { //0 0 * * 1
    console.log("Generating schedule...");
    generateTwoWeekSchedule();
  });

  cron.schedule("* * * * *", async () => {
    console.log("Updating expired lesson statuses...");
    try {
      await LessonStatusService.updateExpiredBookedLessons();
    } catch (error) {
      console.error("Error updating lesson statuses:", error);
    }
  });

  cron.schedule("* * * * *", async () => {
    console.log("Cleaning up old available lesson slots...");
    try {
      await LessonStatusService.cleanupOldAvailableSlots();
    } catch (error) {
      console.error("Error cleaning up old slots:", error);
    }
  });
};

module.exports = scheduleJob;
