const mongoose = require("mongoose");
const { LESSON_STATUS, LESSON_TYPE, EXAM_RESULT, RATING, SCHEDULE } = require("../config/constants");

const lessonSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: Object.values(LESSON_STATUS),
      default: LESSON_STATUS.AVAILABLE,
    },
    duration: { type: Number, default: SCHEDULE.LESSON_DURATION_HOURS },
    type: {
      type: String,
      enum: Object.values(LESSON_TYPE),
      default: LESSON_TYPE.LESSON,
    },
    wynik: {
      type: String,
      enum: Object.values(EXAM_RESULT),
      default: EXAM_RESULT.PENDING,
    },
    rating: {
      type: Number,
      min: RATING.MIN,
      max: RATING.MAX,
      default: null,
    },
    rated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lessonSchema.index({ date: 1, type: 1 });
lessonSchema.index({ instructor: 1, date: 1 });
lessonSchema.index({ student: 1, status: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;