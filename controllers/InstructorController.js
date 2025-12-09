const InstructorService = require("../services/instructorService");

class InstructorController {
  static async getInstructors(req, res) {
    try {
      const instructors = await InstructorService.getInstructors();
      res.json(instructors);
    } catch (error) {
      res.status(500).json({message: "Server error", error: error.message})
    }
  }

  static async getInstructorRating(req, res) {
    try {
      const instructorId = req.user?._id;
      const rating = await InstructorService.getInstructorRating(instructorId);
      res.json(rating);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

module.exports = InstructorController;
