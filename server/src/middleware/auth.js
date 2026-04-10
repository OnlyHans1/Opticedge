import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import env from '../config/env.js';

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header, verifies it,
 * and attaches the decoded user payload to req.user.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { id, role, username }
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token.', 401);
  }
};

export default auth;
