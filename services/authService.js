const { User } = require("../models/User");

class AuthService {
  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.active === false) {
      const error = new Error("Account is inactive");
      error.status = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    return {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    };
  }

  static async register(userData) {
    const { firstName, lastName, role, phoneNumber, email, password } = userData;

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email already exists");
      }
      if (existingUser.phoneNumber === phoneNumber) {
        throw new Error("Phone number already exists");
      }
    }

    const user = new User({
      firstName,
      lastName,
      role,
      phoneNumber,
      email,
      password,
    });

    await user.save();
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    return {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    };
  }

  static async refreshToken(oldRefreshToken) {
    const user = await User.findOne({ 
      "refreshTokens.token": oldRefreshToken 
    });
    
    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const tokenData = user.refreshTokens.find(rt => rt.token === oldRefreshToken);
    if (!tokenData || tokenData.expiry < new Date()) {
      throw new Error("Refresh token expired");
    }

    if (user.active === false) {
      const error = new Error("Account is inactive");
      error.status = 403;
      throw error;
    }

    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== oldRefreshToken);

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    return {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId).select("-password -refreshToken");
    
    if (!user) {
      throw new Error("User not found");
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
          throw new Error("Email already in use");
        }
        if (existingUser.phoneNumber === phoneNumber) {
          throw new Error("Phone number already in use");
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phoneNumber, email },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }

  static async updatePushToken(userId, pushToken) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.pushTokens.includes(pushToken)) {
      user.pushTokens.push(pushToken);
      await user.save();
    }

    return { message: "Push token updated" };
  }

  static async getAllUsers() {
    return await User.find()
      .select("-password -refreshToken -pushTokens")
      .sort({ createdAt: -1 });
  }

  static async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    user.active = !user.active;
    await user.save();

    return {
      message: `User ${user.active ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        active: user.active,
      },
    };
  }
}

module.exports = AuthService;
