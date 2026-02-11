const express = require("express");
const InstructorController = require("../controllers/InstructorController");
const authMiddleware = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.get("/", authMiddleware(ROLES.STUDENT), InstructorController.getInstructors);
router.get("/rating", authMiddleware(ROLES.INSTRUCTOR), InstructorController.getInstructorRating);

module.exports = router;
