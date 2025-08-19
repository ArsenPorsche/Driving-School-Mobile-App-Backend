const cron = require("node-cron");
const { generateTwoWeekSchedule } = require("../services/scheduleService");

const scheduleJob = () => {
  cron.schedule("* * * * *", () => {
    console.log("Generating schedule...");
    generateTwoWeekSchedule();
  });
};

module.exports = scheduleJob;
