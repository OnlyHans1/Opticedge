import * as authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const result = await authService.login(username, password);

  res.status(200).json({
    success: true,
    data: result,
  });
});
