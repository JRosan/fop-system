import { z } from 'zod';

export const moneySchema = z.object({
  amount: z.number().min(0),
  currency: z.enum(['USD', 'XCD']),
});

export const weightSchema = z.object({
  value: z.number().min(0),
  unit: z.enum(['KG', 'LBS']),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().min(1, 'Country is required').max(100),
});

export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(50),
  fax: z.string().max(50).optional().nullable(),
});

export const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

export type Money = z.infer<typeof moneySchema>;
export type Weight = z.infer<typeof weightSchema>;
export type Address = z.infer<typeof addressSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
