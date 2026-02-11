const LessonService = require("../services/lessonService");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/responseHelper");

class LessonController {
  static getAvailableLessons = asyncHandler(async (req, res) => {
    const { type = "lesson" } = req.query;
    const lessons = await LessonService.getAvailableLessons(type);
    success(res, lessons);
  });

  static bookLesson = asyncHandler(async (req, res) => {
    const lesson = await LessonService.bookLesson(req.body.lessonId, req.user._id);
    success(res, { message: `${lesson.type} booked successfully`, lesson });
  });

  static getAllLessons = asyncHandler(async (_req, res) => {
    const lessons = await LessonService.getAllLessons();
    success(res, lessons);
  });

  static getInstructorsLessons = asyncHandler(async (req, res) => {
    const lessons = await LessonService.getInstructorLessons(req.user._id);
    success(res, lessons);
  });

  static getStudentLessons = asyncHandler(async (req, res) => {
    const lessons = await LessonService.getStudentLessons(req.user._id);
    success(res, lessons);
  });

  static getLessonOffer = asyncHandler(async (req, res) => {
    const lessonDate = await LessonService.generateLessonOffer(req.user._id);
    success(res, lessonDate);
  });

  static changeLesson = asyncHandler(async (req, res) => {
    const { oldLessonId, newDate } = req.body;
    const { oldLesson, newLesson } = await LessonService.changeLesson(oldLessonId, newDate);

    success(res, {
      oldLesson: {
        _id: oldLesson._id,
        date: oldLesson.date,
        instructor: oldLesson.instructor,
        status: oldLesson.status,
      },
      newLesson: {
        _id: newLesson._id,
        date: newLesson.date,
        instructor: newLesson.instructor,
        status: newLesson.status,
      },
    });
  });

  static cancelLesson = asyncHandler(async (req, res) => {
    const { lesson, refunded, hoursBefore } = await LessonService.cancelLesson(
      req.body.lessonId,
      req.user._id
    );

    success(res, {
      message: `${lesson.type} cancelled successfully`,
      refunded,
      hoursBefore: hoursBefore.toFixed(1),
      lesson,
    });
  });

  static getLessonHistory = asyncHandler(async (req, res) => {
    const lessons = await LessonService.getLessonHistory(req.user._id);
    success(res, lessons);
  });

  static getInstructorHistory = asyncHandler(async (req, res) => {
    const lessons = await LessonService.getInstructorHistory(req.user._id);
    success(res, lessons);
  });

  static setExamResult = asyncHandler(async (req, res) => {
    const lesson = await LessonService.setExamResult(
      req.params.lessonId,
      req.user._id,
      req.body.wynik
    );
    success(res, { message: "Exam result set successfully", lesson });
  });

  static rateLesson = asyncHandler(async (req, res) => {
    const lesson = await LessonService.rateLesson(
      req.params.lessonId,
      req.user._id,
      req.body.rating
    );
    success(res, { message: "Lesson rated successfully", lesson });
  });
}

module.exports = LessonController;

