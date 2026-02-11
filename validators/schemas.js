/**
 * Joi validation schemas for User-related operations.
 * Separated from the Mongoose model for single responsibility.
 */
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const registerSchema = Joi.object({
  firstName: Joi.string().trim().required().label("First Name"),
  lastName: Joi.string().trim().required().label("Last Name"),
  role: Joi.string()
    .valid("student", "instructor", "admin")
    .required()
    .label("Role"),
  phoneNumber: Joi.string()
    .pattern(/^[1-9]\d{10}$/)
    .required()
    .label("Phone Number"),
  email: Joi.string().email().required().label("Email"),
  password: passwordComplexity().required().label("Password"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().required().label("Password"),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().optional().label("First Name"),
  lastName: Joi.string().trim().optional().label("Last Name"),
  email: Joi.string().email().optional().label("Email"),
  phoneNumber: Joi.string()
    .pattern(/^[1-9]\d{10}$/)
    .optional()
    .label("Phone Number"),
  currentPassword: Joi.string().optional().label("Current Password"),
  newPassword: passwordComplexity().optional().label("New Password"),
});

const pushTokenSchema = Joi.object({
  token: Joi.string().required().label("Push Token"),
});

const sendMessageSchema = Joi.object({
  partnerId: Joi.string().required().label("Partner ID"),
  text: Joi.string().required().label("Text"),
});

const bookLessonSchema = Joi.object({
  lessonId: Joi.string().required().label("Lesson ID"),
});

const cancelLessonSchema = Joi.object({
  lessonId: Joi.string().required().label("Lesson ID"),
});

const changeLessonSchema = Joi.object({
  oldLessonId: Joi.string().required().label("Old Lesson ID"),
  newDate: Joi.string().isoDate().required().label("New Date"),
});

const examResultSchema = Joi.object({
  wynik: Joi.string()
    .valid("passed", "failed", "pending")
    .required()
    .label("Result"),
});

const rateLessonSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().label("Rating"),
});

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productCode: Joi.string().required(),
        quantity: Joi.number().integer().min(1).default(1),
      })
    )
    .min(1)
    .required()
    .label("Items"),
});

const createProductSchema = Joi.object({
  name: Joi.string().required().label("Name"),
  description: Joi.string().allow("").optional().label("Description"),
  price: Joi.number().positive().required().label("Price"),
  category: Joi.string()
    .valid("single", "bundle", "course")
    .required()
    .label("Category"),
  entitlements: Joi.array()
    .items(
      Joi.object({
        unit: Joi.string().valid("lesson", "exam").required(),
        count: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .required()
    .label("Entitlements"),
});

const updateProductSchema = Joi.object({
  name: Joi.string().optional().label("Name"),
  description: Joi.string().allow("").optional().label("Description"),
  price: Joi.number().positive().optional().label("Price"),
  category: Joi.string()
    .valid("single", "bundle", "course")
    .optional()
    .label("Category"),
  entitlements: Joi.array()
    .items(
      Joi.object({
        unit: Joi.string().valid("lesson", "exam").required(),
        count: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .optional()
    .label("Entitlements"),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  pushTokenSchema,
  sendMessageSchema,
  bookLessonSchema,
  cancelLessonSchema,
  changeLessonSchema,
  examResultSchema,
  rateLessonSchema,
  createOrderSchema,
  createProductSchema,
  updateProductSchema,
};
