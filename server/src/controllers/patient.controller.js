import * as patientService from '../services/patient.service.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/patients
 * Create a new patient. Worker only.
 */
export const createPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient(req.body);

  res.status(201).json({
    success: true,
    data: patient,
  });
});

/**
 * GET /api/patients/:id
 * Get patient by ID (UUID). Includes screening history.
 * Used for QR code lookups at hospitals.
 */
export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);

  res.status(200).json({
    success: true,
    data: patient,
  });
});

/**
 * GET /api/patients
 * List all patients.
 */
export const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await patientService.getAllPatients();

  res.status(200).json({
    success: true,
    data: patients,
  });
});
