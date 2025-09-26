const express = require("express")
const LessonController = require("../controllers/LessonController")
const authMiddleware = require("../middleware/auth");

const router = express.Router()

router.get("/", authMiddleware("student"), LessonController.getAvailableLessons)
router.post("/book", authMiddleware("student"), LessonController.bookLesson)
router.get("/all", authMiddleware("instructor"), LessonController.getAllLessons)
router.get("/instructors", authMiddleware("instructor"), LessonController.getInstructorsLessons)
router.get("/offer", authMiddleware("instructor"), LessonController.getLessonOffer)
router.post("/change", authMiddleware("instructor"), LessonController.changeLesson)
router.post("/purchase", authMiddleware("student"), LessonController.purchaseItems)
router.get("/purchased", authMiddleware("student"), LessonController.getPurchasedLessons)

module.exports = router