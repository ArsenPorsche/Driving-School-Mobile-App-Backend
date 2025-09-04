const { User, validateRegister, validateLogin } = require("../models/User");

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
      res.json({
        token,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          email: user.email
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

      const token = user.generateAuthToken();
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

module.exports = AuthController;
