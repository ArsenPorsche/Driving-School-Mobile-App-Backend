const {User} = require("../models/User");

class InstructorController {
  static async getInstructors(req, res) {
    try {
      const instructors = await User.find({ role: "instructor" });
      res.json(instructors.map((i) => ({ _id: i._id, name: `${i.firstName} ${i.lastName}`.trim() })));
    } catch (error) {
      res.status(500).json({message: "Server error", error: error.message})
    }
  }
}

module.exports = InstructorController;
