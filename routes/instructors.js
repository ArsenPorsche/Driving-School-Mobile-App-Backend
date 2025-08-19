const express = require("express");
const InstructorController = require("../controllers/InstructorController");

const router = express.Router();

router.get("/", InstructorController.getInstructors);

module.exports = router;
