import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(2),
  domain: z.string().min(2),
  themeColor: z.string().optional(),
  logoUrl: z.string().url().optional(),
  planId: z.string().min(1),
  paymentGatewayId: z.string().optional(),
  trialDuration: z.number().int().min(0).optional(),
  settings: z.object({ currency: z.string().min(1), dateFormat: z.string().optional() }).optional(),
});

export const updateTenantSchema = createTenantSchema.partial();
