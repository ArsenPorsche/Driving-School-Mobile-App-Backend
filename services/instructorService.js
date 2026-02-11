const { User } = require("../models/User");
const AppError = require("../utils/AppError");
const { ROLES } = require("../config/constants");

class InstructorService {
  static async getInstructors() {
    const instructors = await User.find({ role: ROLES.INSTRUCTOR });

    return Promise.all(
      instructors.map(async (instructor) => {
        const rating = await instructor.calculateAverageRating();
        return {
          _id: instructor._id,
          name: instructor.fullName,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          averageRating: rating.average,
          totalRatings: rating.total,
        };
      })
    );
  }

  static async getInstructorRating(instructorId) {
    const instructor = await User.findById(instructorId);
    if (!instructor) throw AppError.notFound("Instructor not found");
    return instructor.calculateAverageRating();
  }
}

module.exports = InstructorService;
