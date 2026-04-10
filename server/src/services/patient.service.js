import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.js';

const prisma = new PrismaClient();

/**
 * Create a new patient record.
 * Returns the created patient with UUID (used as QR code).
 */
export const createPatient = async (data) => {
  const patient = await prisma.patient.create({
    data: {
      nik: data.nik,
      name: data.name,
      age: data.age,
      wa_number: data.wa_number,
    },
  });

  return patient;
};

/**
 * Get a single patient by ID.
 * Includes their screening history.
 */
export const getPatientById = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      screenings: {
        include: {
          worker: {
            select: { id: true, name: true, location: true },
          },
          doctor: {
            select: { id: true, name: true, location: true },
          },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }

  return patient;
};

/**
 * List all patients.
 */
export const getAllPatients = async () => {
  const patients = await prisma.patient.findMany({
    include: {
      _count: {
        select: { screenings: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return patients;
};
