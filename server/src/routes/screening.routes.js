import { Router } from 'express';
import {
  createScreening,
  getScreenings,
  getScreeningById,
  validateScreening,
} from '../controllers/screening.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import {
  createScreeningSchema,
  validateScreeningSchema,
} from '../validators/screening.validator.js';

const router = Router();

// All screening routes require authentication
router.use(auth);

// POST /api/screenings — Create screening (worker only)
router.post('/', authorize('worker'), validate(createScreeningSchema), createScreening);

// GET /api/screenings — List screenings (worker sees own, doctor sees all)
router.get('/', authorize('worker', 'doctor'), getScreenings);

// GET /api/screenings/:id — Get single screening
router.get('/:id', authorize('worker', 'doctor'), getScreeningById);

// PATCH /api/screenings/:id/validate — Doctor validates screening
router.patch('/:id/validate', authorize('doctor'), validate(validateScreeningSchema), validateScreening);

export default router;
