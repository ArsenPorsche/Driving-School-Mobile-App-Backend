const express = require("express");
const router = express.Router();
const TestController = require("../controllers/TestController");
const auth = require("../middleware/auth");

router.get("/categories", auth(), TestController.getCategories);
router.get("/:topic", auth(), TestController.getTestByCategory);

module.exports = router;
