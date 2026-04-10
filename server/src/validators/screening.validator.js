import { z } from 'zod';

export const createScreeningSchema = z.object({
  patient_id: z
    .string({ required_error: 'Patient ID is required' })
    .uuid('Patient ID must be a valid UUID'),
  eye_image_url: z
    .string({ required_error: 'Eye image URL is required' })
    .min(1, 'Eye image URL cannot be empty'),
  ai_prediction: z
    .string({ required_error: 'AI prediction is required' })
    .min(1, 'AI prediction cannot be empty'),
  ai_confidence: z
    .number({ required_error: 'AI confidence is required' })
    .min(0, 'Confidence must be between 0 and 1')
    .max(1, 'Confidence must be between 0 and 1'),
  sync_status: z
    .enum(['pending', 'synced'], {
      required_error: 'Sync status is required',
      invalid_type_error: 'Sync status must be "pending" or "synced"',
    })
    .default('synced'),
});

export const validateScreeningSchema = z.object({
  doc_validation: z.enum(['approved', 'revised'], {
    required_error: 'Validation decision is required',
    invalid_type_error: 'doc_validation must be "approved" or "revised"',
  }),
  doctor_notes: z
    .string()
    .max(5000, 'Notes must be at most 5000 characters')
    .optional(),
});
