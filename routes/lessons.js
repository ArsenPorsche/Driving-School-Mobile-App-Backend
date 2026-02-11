const express = require("express");
const LessonController = require("../controllers/LessonController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ROLES } = require("../config/constants");
const {
  bookLessonSchema,
  cancelLessonSchema,
  changeLessonSchema,
  examResultSchema,
  rateLessonSchema,
} = require("../validators/schemas");

const router = express.Router();

// -------- Student routes --------
router.get("/", authMiddleware(ROLES.STUDENT), LessonController.getAvailableLessons);
router.post("/book", authMiddleware(ROLES.STUDENT), validate(bookLessonSchema), LessonController.bookLesson);
router.get("/student", authMiddleware(ROLES.STUDENT), LessonController.getStudentLessons);
router.post("/cancel", authMiddleware(ROLES.STUDENT), validate(cancelLessonSchema), LessonController.cancelLesson);
router.get("/history", authMiddleware(ROLES.STUDENT), LessonController.getLessonHistory);
router.post("/:lessonId/rate", authMiddleware(ROLES.STUDENT), validate(rateLessonSchema), LessonController.rateLesson);

// -------- Instructor routes --------
router.get("/all", authMiddleware(ROLES.INSTRUCTOR), LessonController.getAllLessons);
router.get("/instructors", authMiddleware(ROLES.INSTRUCTOR), LessonController.getInstructorsLessons);
router.get("/instructor-history", authMiddleware(ROLES.INSTRUCTOR), LessonController.getInstructorHistory);
router.post("/:lessonId/result", authMiddleware(ROLES.INSTRUCTOR), validate(examResultSchema), LessonController.setExamResult);
router.get("/offer", authMiddleware(ROLES.INSTRUCTOR), LessonController.getLessonOffer);
router.post("/change", authMiddleware(ROLES.INSTRUCTOR), validate(changeLessonSchema), LessonController.changeLesson);

module.exports = router;