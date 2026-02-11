const TestService = require("../services/testService");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/responseHelper");

class TestController {
  static getCategories = asyncHandler(async (_req, res) => {
    const topics = await TestService.getCategories();
    success(res, topics);
  });

  static getTestByCategory = asyncHandler(async (req, res) => {
    const test = await TestService.getTestByCategory(req.params.topic);
    success(res, test);
  });
}

module.exports = TestController;
