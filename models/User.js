const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  role: { type: String, enum: ["student", "instructor"] },
  phoneNumber: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true}
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "1h" }
  );
  return token;
};

const User = mongoose.model("User", userSchema);

const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    role: Joi.string().pattern("/^[1-9]\d{1,14}$/").valid("student", "instructor").required().label("Role"),
    phoneNumber: Joi.string().required().label("Phone Number"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
  })
  return schema.validate(data);
}

module.exports = {User, validate}