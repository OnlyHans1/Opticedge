import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.js';
import env from '../config/env.js';

const prisma = new PrismaClient();

/**
 * Authenticate user with username/password.
 * Returns a JWT token and user info (without password hash).
 */
export const login = async (username, password) => {
  // Find user by username
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new AppError('Invalid username or password.', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Invalid username or password.', 401);
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  // Return token and sanitized user
  const { password_hash, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};
