const {User} = require("../models/User");

class InstructorController {
  static async getInstructors(req, res) {
    try {
      const instructors = await User.find({ role: "instructor" });
      
      // Calculate rating for each instructor
      const instructorsWithRatings = await Promise.all(
        instructors.map(async (instructor) => {
          const rating = await instructor.calculateAverageRating();
          return {
            _id: instructor._id,
            name: `${instructor.firstName} ${instructor.lastName}`.trim(),
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            averageRating: rating.average,
            totalRatings: rating.total
          };
        })
      );
      
      res.json(instructorsWithRatings);
    } catch (error) {
      res.status(500).json({message: "Server error", error: error.message})
    }
  }

  static async getInstructorRating(req, res) {
    try {
      const instructorId = req.user?._id;
      const instructor = await User.findById(instructorId);
      
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }

      const rating = await instructor.calculateAverageRating();
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

module.exports = InstructorController;
