const express = require("express");
const InstructorController = require("../controllers/InstructorController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware("student"), InstructorController.getInstructors);
router.get("/rating", authMiddleware("instructor"), InstructorController.getInstructorRating);

module.exports = router;
