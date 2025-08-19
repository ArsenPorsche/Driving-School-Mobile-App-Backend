const mongoose = require("mongoose");

// MongoDB connection
const connectDB = async () => {
  try {
    mongoose.connect("mongodb://localhost/driving-school", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB