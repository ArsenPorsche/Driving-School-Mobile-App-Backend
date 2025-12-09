const { User, validateRegister, validateLogin, validateUpdateProfile } = require("../models/User");
const AuthService = require("../services/authService");
const jwt = require("jsonwebtoken");

class AuthController {
  static async login(req, res) {
    try {
      const { error } = validateLogin(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      const statusCode = error.status || (error.message.includes("Invalid") ? 400 : 500);
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async register(req, res) {
    try {
      const { error } = validateRegister(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.message.includes("already") ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async validateToken(req, res){
    try {
      const {token} = req.body
      if (!token) return res.status(401).json({ message: "No token provided" });
      
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY)
      const user = await User.findById(decoded._id)

      if (!user || user.active === false) return res.status(403).json({ message: "Invalid user" });

      res.json({
        valid: true,
        role: user.role,
        id: user._id,
      });
    } catch (error) {
      res.status(401).json({ message: "Invalid token", error: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.sendStatus(401);

      const result = await AuthService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      const statusCode = error.status || 403;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user._id);
      res.json(user);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { error } = validateUpdateProfile(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { phoneNumber, currentPassword, newPassword, firstName, lastName, email } = req.body;
      
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required" });
        }
        await AuthService.changePassword(req.user._id, currentPassword, newPassword);
      }

      const user = await AuthService.updateProfile(req.user._id, { firstName, lastName, phoneNumber, email });
      
      res.json({
        message: "Profile updated successfully",
        user
      });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 :
                         error.message.includes("already") || 
                         error.message.includes("incorrect") ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async registerPushToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Push token is required" });
      }
      await AuthService.updatePushToken(req.user._id, token);
      res.json({ ok: true });
    } catch (error) {
      console.log("Push token registration error:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await AuthService.getAllUsers();
      res.json({ data: users });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      if (String(userId) === String(req.user._id)) {
        return res.status(400).json({ message: "You cannot deactivate your own account" });
      }
      const result = await AuthService.toggleUserStatus(userId);
      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async activateUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await AuthService.toggleUserStatus(userId);
      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
