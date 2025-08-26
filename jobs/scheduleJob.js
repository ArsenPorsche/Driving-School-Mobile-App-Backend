const cron = require("node-cron");
const { generateTwoWeekSchedule } = require("../services/scheduleService");

const scheduleJob = () => {
  cron.schedule("0 0 * * 1", () => {
    console.log("Generating schedule...");
    generateTwoWeekSchedule();
  });
};

module.exports = scheduleJob;
