import * as screeningService from '../services/screening.service.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/screenings
 * Create a new screening. Worker only.
 * The worker_id is extracted from the JWT token.
 */
export const createScreening = asyncHandler(async (req, res) => {
  const screening = await screeningService.createScreening(
    req.body,
    req.user.id
  );

  res.status(201).json({
    success: true,
    data: screening,
  });
});

/**
 * GET /api/screenings
 * List screenings based on user role:
 * - Worker: their own screenings
 * - Doctor: all screenings sorted by AI confidence (urgent first)
 */
export const getScreenings = asyncHandler(async (req, res) => {
  const screenings = await screeningService.getScreenings(req.user);

  res.status(200).json({
    success: true,
    data: screenings,
  });
});

/**
 * GET /api/screenings/:id
 * Get a single screening by ID.
 */
export const getScreeningById = asyncHandler(async (req, res) => {
  const screening = await screeningService.getScreeningById(req.params.id);

  res.status(200).json({
    success: true,
    data: screening,
  });
});

/**
 * PATCH /api/screenings/:id/validate
 * Doctor validates a screening — approve or revise diagnosis.
 */
export const validateScreening = asyncHandler(async (req, res) => {
  const screening = await screeningService.validateScreening(
    req.params.id,
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: screening,
  });
});
