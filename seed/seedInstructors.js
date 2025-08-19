const mongoose = require("mongoose");
const User = require("../models/User");

const seedInstructors = async () => {
  try {
    await mongoose.connect("mongodb://localhost/driving-school", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const instructors = await User.find({ role: "instructor" });
    if (instructors.length === 0) {
      await User.create([
        { name: "Jan Kowalski", role: "instructor" },
        { name: "Piotr Nowicki", role: "instructor" },
        { name: "Volodymyr", role: "student" },
      ]);
      console.log("Instructors seeded successfully");
    } else {
      console.log("Instructors already exist");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding instructors:", error);
    mongoose.connection.close();
  }
};

seedInstructors();