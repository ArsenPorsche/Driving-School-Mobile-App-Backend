const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware(), NotificationController.getUserNotifications);
router.get("/instructors", authMiddleware(), NotificationController.getInstructorChats);
router.get("/instructors/:instructorId", authMiddleware(), NotificationController.getInstructorNotifications);
router.patch("/:notificationId/read", authMiddleware(), NotificationController.markAsRead);
router.patch("/read-all", authMiddleware(), NotificationController.markAllAsRead);
router.patch("/instructors/:instructorId/read-all", authMiddleware(), NotificationController.markInstructorAsRead);
router.delete("/:notificationId", authMiddleware(), NotificationController.deleteNotification);

module.exports = router;
