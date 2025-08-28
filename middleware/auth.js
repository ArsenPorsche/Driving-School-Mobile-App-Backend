const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: `Access denied: ${requiredRole} role required` });
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;