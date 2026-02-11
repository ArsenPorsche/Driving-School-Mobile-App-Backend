const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * Authentication & role-based authorization middleware.
 * @param {string|string[]} [requiredRole] - Single role or array of allowed roles
 */
const authMiddleware = (requiredRole) => {
  return async (req, _res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        throw AppError.unauthorized("No token provided");
      }

      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      const user = await User.findById(decoded._id).select("_id role active").lean();

      if (!user || !user.active) {
        throw AppError.unauthorized("User inactive or not found");
      }

      if (requiredRole) {
        const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowed.includes(user.role)) {
          throw AppError.forbidden(`Access denied: ${allowed.join(" or ")} role required`);
        }
      }

      req.user = { _id: user._id, role: user.role };
      next();
    } catch (error) {
      if (error.isOperational) return next(error);
      next(AppError.unauthorized("Invalid token"));
    }
  };
};

module.exports = authMiddleware;