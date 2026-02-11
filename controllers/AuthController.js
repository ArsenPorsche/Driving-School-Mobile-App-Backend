const AuthService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { success, created, message } = require("../utils/responseHelper");
const AppError = require("../utils/AppError");

class AuthController {
  static login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body.email, req.body.password);
    success(res, result);
  });

  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    created(res, result);
  });

  static validateToken = asyncHandler(async (req, res) => {
    const result = await AuthService.validateToken(req.body.token);
    success(res, result);
  });

  static refreshToken = asyncHandler(async (req, res) => {
    const result = await AuthService.refreshToken(req.body.refreshToken);
    success(res, result);
  });

  static getProfile = asyncHandler(async (req, res) => {
    const user = await AuthService.getProfile(req.user._id);
    success(res, user);
  });

  static updateProfile = asyncHandler(async (req, res) => {
    const { phoneNumber, currentPassword, newPassword, firstName, lastName, email } = req.body;

    if (newPassword) {
      if (!currentPassword) throw AppError.badRequest("Current password is required");
      await AuthService.changePassword(req.user._id, currentPassword, newPassword);
    }

    const user = await AuthService.updateProfile(req.user._id, { firstName, lastName, phoneNumber, email });
    success(res, { message: "Profile updated successfully", user });
  });

  static registerPushToken = asyncHandler(async (req, res) => {
    await AuthService.updatePushToken(req.user._id, req.body.token);
    message(res, "Push token registered");
  });

  static getAllUsers = asyncHandler(async (req, res) => {
    const users = await AuthService.getAllUsers();
    success(res, { data: users });
  });

  static deleteUser = asyncHandler(async (req, res) => {
    if (String(req.params.userId) === String(req.user._id)) {
      throw AppError.badRequest("You cannot deactivate your own account");
    }
    const result = await AuthService.toggleUserStatus(req.params.userId);
    success(res, result);
  });

  static activateUser = asyncHandler(async (req, res) => {
    const result = await AuthService.toggleUserStatus(req.params.userId);
    success(res, result);
  });
}

module.exports = AuthController;
