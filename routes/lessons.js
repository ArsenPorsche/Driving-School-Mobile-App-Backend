const express = require("express")
const LessonController = require("../controllers/LessonController")
const authMiddleware = require("../middleware/auth");

const router = express.Router()

router.get("/", authMiddleware("student"), LessonController.getAvailableLessons)
router.post("/book", authMiddleware("student"), LessonController.bookLesson)
router.get("/student", authMiddleware("student"), LessonController.getStudentLessons)
router.post("/cancel", authMiddleware("student"), LessonController.cancelLesson)
router.get("/all", authMiddleware("instructor"), LessonController.getAllLessons)
router.get("/instructors", authMiddleware("instructor"), LessonController.getInstructorsLessons)
router.get("/offer", authMiddleware("instructor"), LessonController.getLessonOffer)
router.post("/change", authMiddleware("instructor"), LessonController.changeLesson)

module.exports = router