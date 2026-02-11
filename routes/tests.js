const express = require("express");
const TestController = require("../controllers/TestController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/categories", authMiddleware(), TestController.getCategories);
router.get("/:topic", authMiddleware(), TestController.getTestByCategory);

module.exports = router;
