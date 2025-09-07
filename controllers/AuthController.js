const { User, validateRegister, validateLogin } = require("../models/User");
const jwt = require("jsonwebtoken");

class AuthController {
  static async login(req, res) {
    try {
      const { error } = validateLogin(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid email or password" });

      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid email or password" });

      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();
      await user.save()
      res.json({
        token,
        refreshToken,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async register(req, res) {
    try {
      const { error } = validateRegister(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { firstName, lastName, role, phoneNumber, email, password } =
        req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      });
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: "Email already exists" });
        }
        if (existingUser.phoneNumber === phoneNumber) {
          return res
            .status(400)
            .json({ message: "Phone number already exists" });
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

      res.status(201).json({
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async validateToken(req, res){
    try {
      const {token} = req.body
      if (!token) return res.status(401).json({ message: "No token provided" });
      
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY)
      const user = await User.findById(decoded._id)

      if (!user) return res.status(403).json({ message: "Invalid user" });

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

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded._id);

      if (!user) return res.sendStatus(403);

      const tokenRecord = user.refreshTokens.find((t) => t.token === refreshToken && t.expiry > new Date());
      if (!tokenRecord) return res.status(403).json({ message: "Invalid or expired refresh token" });

      
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);

      const newAccessToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();
      await user.save();

      res.json({
        token: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      res.status(403).json({ message: "Refresh token failed", error: error.message });
    }
  }
}

module.exports = AuthController;
