const { User } = require("../models/User");
const AppError = require("../utils/AppError");

class AuthService {
  static async login(email, password) {
    const user = await User.findOne({ email }).select("+password +refreshTokens");
    if (!user) {
      throw AppError.badRequest("Invalid email or password");
    }

    if (!user.active) {
      throw AppError.forbidden("Account is inactive");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.badRequest("Invalid email or password");
    }

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    return {
      token,
      refreshToken,
      user: { id: user._id, name: user.fullName },
    };
  }

  static async register(userData) {
    const { firstName, lastName, role, phoneNumber, email, password } = userData;

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw AppError.conflict("Email already exists");
      }
      throw AppError.conflict("Phone number already exists");
    }

    const user = new User({ firstName, lastName, role, phoneNumber, email, password });
    await user.save();

    // Need to select refreshTokens to generate token
    const userWithTokens = await User.findById(user._id).select("+refreshTokens");
    const token = userWithTokens.generateAuthToken();
    const refreshToken = userWithTokens.generateRefreshToken();
    await userWithTokens.save();

    return {
      token,
      refreshToken,
      user: { id: user._id, name: user.fullName },
    };
  }

  static async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw AppError.unauthorized("Refresh token required");
    }

    const user = await User.findOne({
      "refreshTokens.token": oldRefreshToken,
    }).select("+refreshTokens");

    if (!user) {
      throw AppError.unauthorized("Invalid refresh token");
    }

    const tokenData = user.refreshTokens.find((rt) => rt.token === oldRefreshToken);
    if (!tokenData || tokenData.expiry < new Date()) {
      throw AppError.unauthorized("Refresh token expired");
    }

    if (!user.active) {
      throw AppError.forbidden("Account is inactive");
    }

    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== oldRefreshToken);
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    return {
      token,
      refreshToken,
      user: { id: user._id, name: user.fullName },
    };
  }

  static async validateToken(token) {
    const jwt = require("jsonwebtoken");
    if (!token) {
      throw AppError.unauthorized("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    const user = await User.findById(decoded._id);

    if (!user || !user.active) {
      throw AppError.forbidden("Invalid user");
    }

    return { valid: true, role: user.role, id: user._id };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return user;
  }

  static async updateProfile(userId, updates) {
    const { firstName, lastName, phoneNumber, email } = updates;

    if (email || phoneNumber) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw AppError.conflict("Email already in use");
        }
        throw AppError.conflict("Phone number already in use");
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phoneNumber, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw AppError.notFound("User not found");
    }
    return user;
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw AppError.badRequest("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();
  }

  static async updatePushToken(userId, pushToken) {
    const user = await User.findById(userId).select("+pushTokens");
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (!user.pushTokens.includes(pushToken)) {
      user.pushTokens.push(pushToken);
      await user.save();
    }
  }

  static async getAllUsers() {
    return User.find().sort({ createdAt: -1 });
  }

  static async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    user.active = !user.active;
    await user.save();

    return {
      message: `User ${user.active ? "activated" : "deactivated"} successfully`,
      user: { id: user._id, active: user.active },
    };
  }
}

module.exports = AuthService;
