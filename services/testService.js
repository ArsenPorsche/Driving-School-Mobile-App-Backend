const Test = require("../models/Test");
const AppError = require("../utils/AppError");

class TestService {
  static async getCategories() {
    const topics = await Test.distinct("topic", { active: true });

    return Promise.all(
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
  }

  static async getTestByCategory(topic) {
    const test = await Test.findOne({ topic, active: true });
    if (!test) throw AppError.notFound("Questions not found for this topic");

    return {
      _id: test._id,
      topic: test.topic,
      title: test.title,
      description: test.description,
      questions: test.questions,
    };
  }
}

module.exports = TestService;
