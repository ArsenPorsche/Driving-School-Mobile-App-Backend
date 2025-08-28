const express = require("express");
const InstructorController = require("../controllers/InstructorController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware("student"), InstructorController.getInstructors);

module.exports = router;
