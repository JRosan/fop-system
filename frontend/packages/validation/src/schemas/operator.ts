import { z } from 'zod';
import { addressSchema, contactInfoSchema } from './common';

export const authorizedRepresentativeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  title: z.string().min(1, 'Title is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(50),
});

export const createOperatorSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  tradingName: z.string().max(200).optional().nullable(),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50),
  country: z.string().min(1, 'Country is required').max(100),
  address: addressSchema,
  contactInfo: contactInfoSchema,
  authorizedRepresentative: authorizedRepresentativeSchema,
  aocNumber: z.string().min(1, 'AOC number is required').max(50),
  aocIssuingAuthority: z.string().min(1, 'AOC issuing authority is required').max(200),
  aocExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid expiry date'),
});

export const updateOperatorSchema = createOperatorSchema.partial();

export type CreateOperatorInput = z.infer<typeof createOperatorSchema>;
export type UpdateOperatorInput = z.infer<typeof updateOperatorSchema>;
export type AuthorizedRepresentative = z.infer<typeof authorizedRepresentativeSchema>;
