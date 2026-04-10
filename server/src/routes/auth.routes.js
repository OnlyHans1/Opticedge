import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/login — Authenticate user
router.post('/login', validate(loginSchema), login);

export default router;
