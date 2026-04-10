import { Router } from 'express';
import {
  createPatient,
  getPatientById,
  getAllPatients,
} from '../controllers/patient.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { createPatientSchema } from '../validators/patient.validator.js';

const router = Router();

// All patient routes require authentication
router.use(auth);

// POST /api/patients — Create patient (worker only)
router.post('/', authorize('worker'), validate(createPatientSchema), createPatient);

// GET /api/patients — List all patients (worker + doctor)
router.get('/', authorize('worker', 'doctor'), getAllPatients);

// GET /api/patients/:id — Get patient by UUID (worker + doctor)
router.get('/:id', authorize('worker', 'doctor'), getPatientById);

export default router;
