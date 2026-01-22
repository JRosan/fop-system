import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'CERTIFICATE_OF_AIRWORTHINESS',
  'CERTIFICATE_OF_REGISTRATION',
  'AIR_OPERATOR_CERTIFICATE',
  'INSURANCE_CERTIFICATE',
  'NOISE_CERTIFICATE',
  'CREW_LICENSE',
  'FLIGHT_PLAN',
  'OTHER',
]);

export const uploadDocumentSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  type: documentTypeSchema,
  expiryDate: z.string().optional().nullable(),
});

export const verifyDocumentSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  isVerified: z.boolean(),
  rejectionReason: z.string().max(1000).optional().nullable(),
}).refine(
  (data) => data.isVerified || (data.rejectionReason && data.rejectionReason.trim().length > 0),
  { message: 'Rejection reason is required when rejecting a document', path: ['rejectionReason'] }
);

export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const fileValidation = z.object({
  name: z.string(),
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
  type: z.string().refine(
    (type) => ACCEPTED_FILE_TYPES.includes(type),
    'Only PDF, JPEG, and PNG files are allowed'
  ),
});

export type DocumentType = z.infer<typeof documentTypeSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
