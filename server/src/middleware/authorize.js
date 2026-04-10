import AppError from '../utils/AppError.js';

/**
 * Role-based authorization middleware.
 * Usage: authorize('worker'), authorize('doctor'), authorize('worker', 'doctor')
 *
 * Must be placed AFTER the auth middleware (requires req.user).
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`,
        403
      );
    }

    next();
  };
};

export default authorize;
