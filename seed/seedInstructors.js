const mongoose = require("mongoose");
const {User} = require("../models/User");
require("dotenv").config({ path: "../.env" });

const seedInstructors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});

    await User.create([
      {
        firstName: "Jan",
        lastName: "Kowalski",
        email: "jan.kowalski@example.com",
        password: "password123",
        role: "instructor",
        phoneNumber: "48123456789",
      },
      {
        firstName: "Piotr",
        lastName: "Nowicki",
        email: "piotr.nowicki@example.com",
        password: "password",
        role: "instructor",
        phoneNumber: "48987654321",
      },
      {
        firstName: "Volodymyr",
        lastName: "Vynnychenko",
        email: "volodymyr@example.com",
        password: "password123",
        role: "student",
        phoneNumber: "48111222333",
      },
    ]);
    console.log("Instructors seeded successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding instructors:", error);
    mongoose.connection.close();
  }
};

seedInstructors();
