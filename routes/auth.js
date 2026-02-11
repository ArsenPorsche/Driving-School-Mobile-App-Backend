const express = require("express");
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  pushTokenSchema,
} = require("../validators/schemas");

const router = express.Router();

// Public
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/validate-token", AuthController.validateToken);

// Authenticated
router.post("/push-token", authMiddleware(), validate(pushTokenSchema), AuthController.registerPushToken);
router.get("/profile", authMiddleware(), AuthController.getProfile);
router.put("/profile", authMiddleware(), validate(updateProfileSchema), AuthController.updateProfile);

// Admin only
router.post("/register", authMiddleware("admin"), validate(registerSchema), AuthController.register);
router.get("/users", authMiddleware("admin"), AuthController.getAllUsers);
router.delete("/users/:userId", authMiddleware("admin"), AuthController.deleteUser);
router.patch("/users/:userId/activate", authMiddleware("admin"), AuthController.activateUser);

module.exports = router;
