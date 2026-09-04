/**
 * Standardized Express Error Handler Middleware.
 * Prevents fatal server crashes and catches Mongoose CastErrors cleanly.
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errorType = 'Server Error';

  // Handle Mongoose CastError (invalid ObjectId URL parameter format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format provided for resource field: ${err.path}`;
    errorType = 'Bad Request - CastError';
  }

  // Handle duplicate key error in Mongoose
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errorType = 'Bad Request - Duplicate Field';
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errorType = 'Unauthorized';
  }

  res.status(statusCode).json({
    status: 'error',
    error: errorType,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFoundHandler, errorHandler };
