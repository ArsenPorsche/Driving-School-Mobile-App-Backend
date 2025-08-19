const express = require("express")
const LessonController = require("../controllers/LessonController")

const router = express.Router()

router.get("/", LessonController.getAvailableLessons)
router.post("/book", LessonController.bookLesson)
router.get("/all", LessonController.getAllLessons)

module.exports = router