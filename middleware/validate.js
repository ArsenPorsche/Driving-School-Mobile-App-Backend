/**
 * Joi validation middleware factory.
 * Validates req.body / req.params / req.query against a Joi schema.
 * Removes validation logic from controllers — single responsibility.
 *
 * @param {import('joi').ObjectSchema} schema
 * @param {'body'|'params'|'query'} source
 */
const AppError = require("../utils/AppError");

const validate = (schema, source = "body") => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join("; ");
      return next(AppError.badRequest(messages));
    }

    req[source] = value; // use sanitized values
    next();
  };
};

module.exports = validate;
