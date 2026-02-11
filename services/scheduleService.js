const Lesson = require("../models/Lesson");
const { User } = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");
const { ROLES, LESSON_STATUS, LESSON_TYPE, SCHEDULE } = require("../config/constants");

class ScheduleService {
  static async generateWeekScheduleForInstructor(
    instructor,
    weekStart,
    type = LESSON_TYPE.LESSON,
    count = SCHEDULE.LESSONS_PER_WEEK,
    existingItems = []
  ) {
    const items = [];
    const durationMs = SCHEDULE.LESSON_DURATION_HOURS * 60 * 60 * 1000;

    for (let attempt = 0; attempt < SCHEDULE.MAX_SCHEDULE_ATTEMPTS && items.length < count; attempt++) {
      const dayOffset = Math.floor(Math.random() * 7);
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + dayOffset);

      const startHour = SCHEDULE.WORK_START_HOUR + Math.floor(Math.random() * SCHEDULE.WORK_HOURS_SPAN);
      currentDay.setHours(startHour, 0, 0, 0);
      const itemDate = new Date(currentDay);

      const hasConflict = [...items, ...existingItems].some((existing) => {
        const existingStart = new Date(existing.date);
        const existingEnd = new Date(existingStart.getTime() + durationMs);
        const newEnd = new Date(itemDate.getTime() + durationMs);
        return itemDate < existingEnd && newEnd > existingStart;
      });

      if (!hasConflict) {
        items.push({
          date: new Date(itemDate),
          instructor: instructor._id,
          status: LESSON_STATUS.AVAILABLE,
          type,
          duration: SCHEDULE.LESSON_DURATION_HOURS,
        });
      }
    }

    return items;
  }

  static async generateTwoWeekSchedule() {
    const instructors = await User.find({ role: ROLES.INSTRUCTOR });
    const today = new Date();
    const { startOfWeek: thisWeekStart } = getWeekBounds(today);

    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);

    const { startOfWeek: nextWeekStartBound, endOfWeek: nextWeekEndBound } = getWeekBounds(nextWeekStart);
    const existingNextWeekLessons = await Lesson.find({
      date: { $gte: nextWeekStartBound, $lte: nextWeekEndBound },
    });

    if (existingNextWeekLessons.length > 0) return; // Already generated

    for (const instructor of instructors) {
      const weekLessons = await ScheduleService.generateWeekScheduleForInstructor(
        instructor,
        nextWeekStart,
        LESSON_TYPE.LESSON,
        SCHEDULE.LESSONS_PER_WEEK
      );

      const weekExams = await ScheduleService.generateWeekScheduleForInstructor(
        instructor,
        nextWeekStart,
        LESSON_TYPE.EXAM,
        SCHEDULE.EXAMS_PER_WEEK,
        weekLessons
      );

      const allItems = [...weekLessons, ...weekExams];
      if (allItems.length > 0) {
        await Lesson.insertMany(allItems);
      }
    }
  }
}

module.exports = ScheduleService;
