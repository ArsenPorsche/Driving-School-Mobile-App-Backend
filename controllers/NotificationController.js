const Notification = require("../models/Notification");

class NotificationController {
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user._id;
      const { limit = 50, skip = 0, unreadOnly = false } = req.query;

      const filter = { user: userId };
      if (unreadOnly === "true") {
        filter.read = false;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const unreadCount = await Notification.countDocuments({
        user: userId,
        read: false,
      });

      res.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error("[NotificationController] getUserNotifications error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user._id;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Marked as read", notification });
    } catch (error) {
      console.error("[NotificationController] markAsRead error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.user._id;

      const result = await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );

      res.json({
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("[NotificationController] markAllAsRead error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user._id;

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId,
      });

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("[NotificationController] deleteNotification error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get list of instructors with whom user has notifications (chats)
  static async getInstructorChats(req, res) {
    try {
      const userId = req.user._id;

      console.log("[getInstructorChats] userId:", userId);

      // Get all notifications with instructor field
      const notifications = await Notification.find({ 
        user: userId, 
        instructor: { $exists: true, $ne: null } 
      })
        .populate("instructor", "firstName lastName")
        .sort({ createdAt: -1 });

      console.log("[getInstructorChats] Total notifications with instructor:", notifications.length);

      // Group by instructor manually
      const instructorMap = new Map();
      
      for (const notif of notifications) {
        if (!notif.instructor) continue;
        
        const instructorId = notif.instructor._id.toString();
        
        if (!instructorMap.has(instructorId)) {
          instructorMap.set(instructorId, {
            _id: notif.instructor,
            lastMessage: notif.body,
            lastMessageDate: notif.createdAt,
            unreadCount: 0,
          });
        }
        
        if (!notif.read) {
          instructorMap.get(instructorId).unreadCount++;
        }
      }

      const instructors = Array.from(instructorMap.values()).sort(
        (a, b) => b.lastMessageDate - a.lastMessageDate
      );

      console.log("[getInstructorChats] Grouped instructors:", instructors.length);

      res.json({ instructors });
    } catch (error) {
      console.error("[NotificationController] getInstructorChats error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get notifications for specific instructor
  static async getInstructorNotifications(req, res) {
    try {
      const userId = req.user._id;
      const { instructorId } = req.params;
      const { limit = 50, skip = 0 } = req.query;

      const notifications = await Notification.find({
        user: userId,
        instructor: instructorId,
      })
        .populate("instructor", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const unreadCount = await Notification.countDocuments({
        user: userId,
        instructor: instructorId,
        read: false,
      });

      res.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error("[NotificationController] getInstructorNotifications error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Mark all notifications from specific instructor as read
  static async markInstructorAsRead(req, res) {
    try {
      const userId = req.user._id;
      const { instructorId } = req.params;

      const result = await Notification.updateMany(
        { user: userId, instructor: instructorId, read: false },
        { read: true }
      );

      res.json({
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("[NotificationController] markInstructorAsRead error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

module.exports = NotificationController;
