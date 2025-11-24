const Test = require("../models/Test");

class TestController {
  static async getCategories(req, res) {
    try {
      const topics = await Test.distinct("topic", { active: true });
      const topicsWithTests = await Promise.all(
        topics.map(async (topic) => {
          const test = await Test.findOne({ topic, active: true });
          return {
            topic,
            title: test?.title || topic,
            description: test?.description || "",
            questionsCount: test?.questions?.length || 0,
          };
        })
      );
      res.json(topicsWithTests);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  static async getTestByCategory(req, res) {
    try {
      const { topic } = req.params;
      const test = await Test.findOne({ topic, active: true });
      
      if (!test) {
        return res.status(404).json({ message: "Questions not found for this topic" });
      }

      res.json({
        _id: test._id,
        topic: test.topic,
        title: test.title,
        description: test.description,
        questions: test.questions,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

module.exports = TestController;
