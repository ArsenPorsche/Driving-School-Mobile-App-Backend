const TestService = require("../services/testService");

class TestController {
  static async getCategories(req, res) {
    try {
      const topicsWithTests = await TestService.getCategories();
      res.json(topicsWithTests);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getTestByCategory(req, res) {
    try {
      const { topic } = req.params;
      const test = await TestService.getTestByCategory(topic);
      res.json(test);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

module.exports = TestController;
