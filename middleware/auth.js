const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const authMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      const user = await User.findById(decoded._id);
      if (!user || !user.active) {
        return res.status(401).json({ message: "User inactive or not found" });
      }

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: `Access denied: ${requiredRole} role required` });
      }

      req.user = { _id: user._id, role: user.role };
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;