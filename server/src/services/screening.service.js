import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.js';

const prisma = new PrismaClient();

/**
 * Create a new screening record.
 * The AI prediction and confidence come from the frontend (client-side AI).
 */
export const createScreening = async (data, workerId) => {
  // Verify the patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: data.patient_id },
  });

  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  const screening = await prisma.screening.create({
    data: {
      patient_id: data.patient_id,
      worker_id: workerId,
      eye_image_url: data.eye_image_url,
      ai_prediction: data.ai_prediction,
      ai_confidence: data.ai_confidence,
      sync_status: data.sync_status || 'synced',
      doc_validation: 'pending',
    },
    include: {
      patient: {
        select: { id: true, name: true, age: true },
      },
    },
  });

  return screening;
};

/**
 * Get screenings based on user role:
 * - Worker: sees only their own screenings
 * - Doctor: sees all screenings, sorted by highest AI confidence (urgent first)
 */
export const getScreenings = async (user) => {
  const where = {};

  // Workers only see their own screenings
  if (user.role === 'worker') {
    where.worker_id = user.id;
  }

  const screenings = await prisma.screening.findMany({
    where,
    include: {
      patient: {
        select: { id: true, name: true, age: true, nik: true, wa_number: true },
      },
      worker: {
        select: { id: true, name: true, location: true },
      },
      doctor: {
        select: { id: true, name: true, location: true },
      },
    },
    orderBy: [
      // Doctors see highest confidence (most urgent) first
      { ai_confidence: 'desc' },
      { created_at: 'desc' },
    ],
  });

  return screenings;
};

/**
 * Get a single screening by ID.
 */
export const getScreeningById = async (id) => {
  const screening = await prisma.screening.findUnique({
    where: { id },
    include: {
      patient: true,
      worker: {
        select: { id: true, name: true, username: true, location: true },
      },
      doctor: {
        select: { id: true, name: true, username: true, location: true },
      },
    },
  });

  if (!screening) {
    throw new AppError('Screening not found.', 404);
  }

  return screening;
};

/**
 * Doctor validates a screening — approve or revise the AI prediction.
 * Sets the doctor_id, doc_validation status, doctor_notes, and reviewed_at timestamp.
 */
export const validateScreening = async (screeningId, doctorId, data) => {
  // Verify the screening exists
  const existing = await prisma.screening.findUnique({
    where: { id: screeningId },
  });

  if (!existing) {
    throw new AppError('Screening not found.', 404);
  }

  const updatedScreening = await prisma.screening.update({
    where: { id: screeningId },
    data: {
      doctor_id: doctorId,
      doc_validation: data.doc_validation,
      doctor_notes: data.doctor_notes || null,
      reviewed_at: new Date(),
    },
    include: {
      patient: {
        select: { id: true, name: true, age: true },
      },
      doctor: {
        select: { id: true, name: true, location: true },
      },
    },
  });

  return updatedScreening;
};
