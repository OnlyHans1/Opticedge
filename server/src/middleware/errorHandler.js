import env from '../config/env.js';

/**
 * Centralized error handler middleware.
 * Handles AppError, Zod, Prisma, and unexpected errors consistently.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma: Unique constraint violation
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.join(', ') || 'field';
    message = `Duplicate value for: ${field}`;
  }

  // Prisma: Record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Prisma: Foreign key constraint failure
  if (err.code === 'P2003') {
    statusCode = 400;
    message = `Invalid reference: ${err.meta?.field_name || 'related record not found'}`;
  }

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error(`[ERROR ${statusCode}]`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export default errorHandler;
