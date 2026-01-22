import { z } from 'zod';

export const paymentMethodSchema = z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'WIRE_TRANSFER']);

export const processPaymentSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  method: paymentMethodSchema,
  transactionReference: z.string().min(1, 'Transaction reference is required').max(100),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
