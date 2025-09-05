const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const passwordComplexity = require("joi-password-complexity");

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiry: { type: Date, required: true },
});

const userSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  role: { type: String, enum: ["student", "instructor", "admin"], required: true },
  phoneNumber: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  refreshTokens: [refreshTokenSchema]
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

userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  this.refreshTokens.push({ token: refreshToken, expiry });
  return refreshToken;
};

const User = mongoose.model("User", userSchema);

const validateRegister = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    role: Joi.string().valid("student", "instructor", "admin").required().label("Role"),
    phoneNumber: Joi.string()
      .pattern(new RegExp("^[1-9]\\d{10,14}$"))
      .required()
      .label("Phone Number"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = {User, validateRegister, validateLogin}