const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  date: Date,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "available" },
  duration: { type: Number, default: 2 },
});
const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson