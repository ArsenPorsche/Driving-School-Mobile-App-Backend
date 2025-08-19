const Lesson = require("../models/Lesson");
const User = require("../models/User");
const getWeekBounds = require("../utils/getWeekBounds");

class ScheduleService {
  // Генерація уроків для одного тижня для одного інструктора
  static async generateWeekScheduleForInstructor(instructor, weekStart) {
    const lessons = [];
    let totalLessons = 0;
    const maxLessonsPerWeek = 20; // 40 годин / 2 години = 20 уроків

    // Генеруємо уроки поки не досягнемо 20 уроків на тиждень
    while (totalLessons < maxLessonsPerWeek) {
      const dayOffset = Math.floor(Math.random() * 7); // Випадковий день тижня
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + dayOffset);

      const startHour = 8 + Math.floor(Math.random() * 11); // 8:00 - 16:00 (щоб урок закінчився до 18:00)

      currentDay.setHours(startHour, 0, 0, 0);
      const lessonDate = new Date(currentDay);

      // Перевіряємо конфлікти з іншими уроками цього інструктора
      const hasConflict = lessons.some((existing) => {
        const existingStart = new Date(existing.date);
        const existingEnd = new Date(
          existingStart.getTime() + 2 * 60 * 60 * 1000
        );
        const newStart = new Date(lessonDate);
        const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (existingStart >= newStart && existingStart < newEnd)
        );
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

  // Генерація розкладу на два тижні
  static async generateTwoWeekSchedule() {
    const instructors = await User.find({ role: "instructor" });
    const today = new Date();

    // Отримуємо межі поточного тижня
    const { startOfWeek: thisWeekStart } = getWeekBounds(today);

    // Наступний тиждень
    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);

    // Перевіряємо, чи є уроки на наступний тиждень
    const { startOfWeek: nextWeekStartBound, endOfWeek: nextWeekEndBound } =
      getWeekBounds(nextWeekStart);
    const existingNextWeekLessons = await Lesson.find({
      date: {
        $gte: nextWeekStartBound,
        $lte: nextWeekEndBound,
      },
    });

    // Якщо немає уроків на наступний тиждень, генеруємо їх
    if (existingNextWeekLessons.length === 0) {
      console.log("Generating schedule for next week:", nextWeekStart);

      for (const instructor of instructors) {
        const weekLessons = await ScheduleService.generateWeekScheduleForInstructor(
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

module.exports = ScheduleService
