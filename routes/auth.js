const express = require("express");
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middleware/auth")

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/register", authMiddleware("admin"), AuthController.register);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/validate-token", AuthController.validateToken);
router.get("/profile", authMiddleware(), AuthController.getProfile);
router.put("/profile", authMiddleware(), AuthController.updateProfile);


module.exports = router;
