const InstructorService = require("../services/instructorService");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/responseHelper");

class InstructorController {
  static getInstructors = asyncHandler(async (_req, res) => {
    const instructors = await InstructorService.getInstructors();
    success(res, instructors);
  });

  static getInstructorRating = asyncHandler(async (req, res) => {
    const rating = await InstructorService.getInstructorRating(req.user._id);
    success(res, rating);
  });
}

module.exports = InstructorController;
