const { User } = require("../models/User");

class InstructorService {
  static async getInstructors() {
    const instructors = await User.find({ role: "instructor" });
    
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
    
    return instructorsWithRatings;
  }

  static async getInstructorRating(instructorId) {
    const instructor = await User.findById(instructorId);
    
    if (!instructor) {
      throw new Error("Instructor not found");
    }

    return await instructor.calculateAverageRating();
  }
}

module.exports = InstructorService;
