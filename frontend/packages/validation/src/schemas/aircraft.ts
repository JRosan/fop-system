import { z } from 'zod';

export const aircraftCategorySchema = z.enum(['FIXED_WING', 'ROTORCRAFT']);

export const createAircraftSchema = z.object({
  registrationMark: z
    .string()
    .min(1, 'Registration mark is required')
    .max(20)
    .transform((val) => val.toUpperCase()),
  manufacturer: z.string().min(1, 'Manufacturer is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  serialNumber: z.string().min(1, 'Serial number is required').max(50),
  category: aircraftCategorySchema,
  mtowValue: z.number().min(0, 'MTOW must be positive'),
  mtowUnit: z.enum(['KG', 'LBS']),
  seatCount: z.number().int().min(0, 'Seat count must be non-negative'),
  yearOfManufacture: z
    .number()
    .int()
    .min(1900, 'Invalid year')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  operatorId: z.string().uuid('Invalid operator ID'),
  noiseCategory: z.string().max(20).optional().nullable(),
});

export const updateAircraftSchema = z.object({
  registrationMark: z.string().max(20).optional(),
  mtowValue: z.number().min(0).optional(),
  mtowUnit: z.enum(['KG', 'LBS']).optional(),
  seatCount: z.number().int().min(0).optional(),
  noiseCategory: z.string().max(20).optional().nullable(),
});

export type AircraftCategory = z.infer<typeof aircraftCategorySchema>;
export type CreateAircraftInput = z.infer<typeof createAircraftSchema>;
export type UpdateAircraftInput = z.infer<typeof updateAircraftSchema>;
