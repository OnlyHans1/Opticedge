import { z } from 'zod';

export const createPatientSchema = z.object({
  nik: z
    .string({ required_error: 'NIK is required' })
    .min(1, 'NIK cannot be empty')
    .max(20, 'NIK must be at most 20 characters'),
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, 'Name cannot be empty')
    .max(255, 'Name must be at most 255 characters'),
  age: z
    .number({ required_error: 'Age is required' })
    .int('Age must be a whole number')
    .min(0, 'Age must be positive')
    .max(150, 'Age must be realistic'),
  wa_number: z
    .string({ required_error: 'WhatsApp number is required' })
    .min(1, 'WhatsApp number cannot be empty')
    .max(20, 'WhatsApp number must be at most 20 characters'),
});
