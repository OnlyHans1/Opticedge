/**
 * Wraps an async route handler to automatically catch errors
 * and pass them to Express's error-handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
