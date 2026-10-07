const { sendError } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return sendError(res, messages, 422, 'VALIDATION_ERROR', err.errors);
    }
    return sendError(res, 'Invalid request data', 422, 'VALIDATION_ERROR');
  }
};

module.exports = { validate };
