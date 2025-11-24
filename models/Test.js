const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  image: { type: String },
});

const testSchema = new mongoose.Schema(
  {
    topic: { 
      type: String, 
      required: true,
      index: true 
    },
    title: { type: String, required: true },
    description: { type: String },
    questions: [questionSchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);

module.exports = Test;
