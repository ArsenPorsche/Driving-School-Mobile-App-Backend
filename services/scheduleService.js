const Lesson = require("../models/Lesson");
const { User } = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");

class ScheduleService {
  static async generateWeekScheduleForInstructor(instructor, 
    weekStart, type = "lesson", count = 16, existingItems = []
  ) {
    const items = [];
    let totalItems = 0;
    const maxAttempts = 100;
    let attempts = 0;

    while (totalItems < count && attempts < maxAttempts) {
      attempts++;

      const dayOffset = Math.floor(Math.random() * 7); 
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + dayOffset);

      const startHour = 8 + Math.floor(Math.random() * 11); 

      currentDay.setHours(startHour, 0, 0, 0);
      const itemDate = new Date(currentDay);

      const hasConflict = [...items, ...existingItems]
      .some((existing) => {
        const existingStart = new Date(existing.date);
        const existingEnd = new Date(
          existingStart.getTime() + 2 * 60 * 60 * 1000
        );
        const newStart = new Date(itemDate);
        const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

        return newStart < existingEnd && newEnd > existingStart;
      });

      if (!hasConflict) {
        const item = {
          date: new Date(itemDate),
          instructor: instructor._id,
          status: "available",
          type: type,
          duration: 2,
        };

        items.push(item);
        totalItems++;
      }
    }

    return items;
  }

  static async generateTwoWeekSchedule() {
    const instructors = await User.find({ role: "instructor" });
    const today = new Date();

    const { startOfWeek: thisWeekStart } = getWeekBounds(today);

    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);

    const { startOfWeek: nextWeekStartBound, endOfWeek: nextWeekEndBound } =
      getWeekBounds(nextWeekStart);
    const existingNextWeekLessons = await Lesson.find({
      date: {
        $gte: nextWeekStartBound,
        $lte: nextWeekEndBound,
      },
    });

    if (existingNextWeekLessons.length === 0) {

      for (const instructor of instructors) {
        const weekLessons =
          await ScheduleService.generateWeekScheduleForInstructor(
            instructor,
            nextWeekStart,
            "lesson",
            16
          );

        const weekExams =
          await ScheduleService.generateWeekScheduleForInstructor(
            instructor,
            nextWeekStart,
            "exam",
            4,
            weekLessons
          );

        const allScheduleItems = [...weekLessons, ...weekExams];
        if (allScheduleItems.length > 0) {
          await Lesson.insertMany(allScheduleItems);
        }
      }
    }
  }
}

module.exports = ScheduleService;
