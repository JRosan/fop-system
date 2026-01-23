import { z } from 'zod';

export const applicationTypeSchema = z.enum(['OneTime', 'Blanket', 'Emergency']);

export const flightPurposeSchema = z.enum([
  'CHARTER',
  'CARGO',
  'TECHNICAL_LANDING',
  'MEDEVAC',
  'PRIVATE',
  'OTHER',
]);

export const flightDetailsSchema = z.object({
  purpose: flightPurposeSchema,
  purposeDescription: z.string().max(500).optional().nullable(),
  arrivalAirport: z
    .string()
    .min(3, 'Airport code must be at least 3 characters')
    .max(10)
    .transform((val) => val.toUpperCase()),
  departureAirport: z
    .string()
    .min(3, 'Airport code must be at least 3 characters')
    .max(10)
    .transform((val) => val.toUpperCase()),
  estimatedFlightDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  numberOfPassengers: z.number().int().min(0).optional().nullable(),
  cargoDescription: z.string().max(1000).optional().nullable(),
}).refine(
  (data) => data.purpose !== 'OTHER' || (data.purposeDescription && data.purposeDescription.trim().length > 0),
  { message: 'Description is required when purpose is "Other"', path: ['purposeDescription'] }
);

export const createApplicationSchema = z.object({
  type: applicationTypeSchema,
  operatorId: z.string().uuid('Invalid operator ID'),
  aircraftId: z.string().uuid('Invalid aircraft ID'),
  flightPurpose: flightPurposeSchema,
  flightPurposeDescription: z.string().max(500).optional().nullable(),
  arrivalAirport: z.string().min(3).max(10),
  departureAirport: z.string().min(3).max(10),
  estimatedFlightDate: z.string(),
  numberOfPassengers: z.number().int().min(0).optional().nullable(),
  cargoDescription: z.string().max(1000).optional().nullable(),
  requestedStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  requestedEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
}).refine(
  (data) => new Date(data.requestedEndDate) >= new Date(data.requestedStartDate),
  { message: 'End date must be after start date', path: ['requestedEndDate'] }
).refine(
  (data) => new Date(data.requestedStartDate) >= new Date(new Date().toDateString()),
  { message: 'Start date cannot be in the past', path: ['requestedStartDate'] }
);

export const feeCalculationSchema = z.object({
  type: applicationTypeSchema,
  seatCount: z.number().int().min(0),
  mtowKg: z.number().min(0),
});

export type ApplicationType = z.infer<typeof applicationTypeSchema>;
export type FlightPurpose = z.infer<typeof flightPurposeSchema>;
export type FlightDetailsInput = z.infer<typeof flightDetailsSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type FeeCalculationInput = z.infer<typeof feeCalculationSchema>;
