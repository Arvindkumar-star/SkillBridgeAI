const { sendError } = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
};

const globalErrorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return sendError(res, 'Validation Error', 422, 'VALIDATION_ERROR', err.errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 409, 'DUPLICATE_KEY_ERROR');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return sendError(res, 'Database Validation Error', 422, 'VALIDATION_ERROR', details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token provided', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired', 401, 'TOKEN_EXPIRED');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size exceeds 5MB limit', 400, 'FILE_TOO_LARGE');
    }
    return sendError(res, `File upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  return sendError(res, message, statusCode, code, err.details);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
