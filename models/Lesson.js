const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  date: Date,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "available" },
  duration: { type: Number, default: 2 },
  type: { 
    type: String, 
    enum: ["lesson", "exam"], 
    default: "lesson" 
  },
  wynik: {
    type: String,
    enum: ["passed", "failed", "pending"],
    default: "pending"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  rated: {
    type: Boolean,
    default: false
  }
});

lessonSchema.index({ date: 1, type: 1 });
lessonSchema.index({ instructor: 1, date: 1 });
lessonSchema.index({ student: 1, status: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;