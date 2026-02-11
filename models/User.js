const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ROLES } = require("../config/constants");

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiry: { type: Date, required: true },
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    refreshTokens: { type: [refreshTokenSchema], select: false },
    purchasedLessons: { type: Number, default: 0, min: 0 },
    purchasedExams: { type: Number, default: 0, min: 0 },
    pushTokens: { type: [String], default: [], select: false },
  },
  { timestamps: true }
);

// ---------- Hooks ----------
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// ---------- Instance methods ----------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "1h" }
  );
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

userSchema.methods.calculateAverageRating = async function () {
  const Lesson = mongoose.model("Lesson");
  const result = await Lesson.aggregate([
    { $match: { instructor: this._id, rated: true, rating: { $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    return {
      average: Math.round(result[0].avgRating * 10) / 10,
      total: result[0].totalRatings,
    };
  }
  return { average: 0, total: 0 };
};

// ---------- Virtuals ----------
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

module.exports = { User };