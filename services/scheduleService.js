const Lesson = require("../models/Lesson");
const {User} = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");

class ScheduleService {
  // Generating lessons for one week for one instructor
  static async generateWeekScheduleForInstructor(instructor, weekStart) {
    const lessons = [];
    let totalLessons = 0;
    const maxLessonsPerWeek = 20; // 40 hours / 2 hours for lesson = 20 lessons

    // Generating 20 lessons
    while (totalLessons < maxLessonsPerWeek) {
      const dayOffset = Math.floor(Math.random() * 7); // Random day of week
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + dayOffset);

      const startHour = 8 + Math.floor(Math.random() * 11); // 8:00 - 18:00 (last lesson ends at 20:00)

      currentDay.setHours(startHour, 0, 0, 0);
      const lessonDate = new Date(currentDay);

      // Conflict checking with the instructor's other lessons
      const hasConflict = lessons.some((existing) => {
        const existingStart = new Date(existing.date);
        const existingEnd = new Date(
          existingStart.getTime() + 2 * 60 * 60 * 1000
        );
        const newStart = new Date(lessonDate);
        const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

        return newStart < existingEnd && newEnd > existingStart;
      });

      if (!hasConflict) {
        lessons.push({
          date: new Date(lessonDate),
          instructor: instructor._id,
          status: "available",
        });
        totalLessons++;
      }
    }

    return lessons;
  }

  // Generating a plan for one week forward
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

    // Generating a plan if one does not exist
    if (existingNextWeekLessons.length === 0) {
      console.log("Generating schedule for next week:", nextWeekStart);

      for (const instructor of instructors) {
        const weekLessons =
          await ScheduleService.generateWeekScheduleForInstructor(
            instructor,
            nextWeekStart
          );
        if (weekLessons.length > 0) {
          await Lesson.insertMany(weekLessons);
        }
      }
    }
  }
}

module.exports = ScheduleService;
