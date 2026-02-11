/**
 * Standardized API response helpers.
 * Thin wrappers that keep controllers clean while preserving
 * the response shape the frontend already knows.
 */

const success = (res, data = null, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

const created = (res, data = null) => {
  return success(res, data, 201);
};

const message = (res, msg, statusCode = 200) => {
  return res.status(statusCode).json({ message: msg });
};

module.exports = { success, created, message };
