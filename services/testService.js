const Test = require("../models/Test");

class TestService {
  static async getCategories() {
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
    
    return topicsWithTests;
  }

  static async getTestByCategory(topic) {
    const test = await Test.findOne({ topic, active: true });
    
    if (!test) {
      throw new Error("Questions not found for this topic");
    }

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
