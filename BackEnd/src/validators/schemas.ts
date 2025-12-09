import { z } from 'zod';

export const tenantCreateSchema = z.object({
  name: z.string().min(2),
  domain: z.string().min(2),
  themeColor: z.string().optional(),
  logoUrl: z.string().optional(),
  planId: z.string().min(1),
  paymentGatewayId: z.string().optional(),
  trialDuration: z.number().int().nonnegative().optional(),
});

export const tenantUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().min(2).optional(),
  themeColor: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRIAL', 'PAST_DUE']).optional(),
  planId: z.string().optional(),
  paymentGatewayId: z.string().optional(),
  nextBillingDate: z.string().nullable().optional(),
});

export const planSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  billingCycle: z.enum(['MENSAL', 'ANUAL']),
  features: z.array(z.string()).optional(),
});

export const propertySchema = z.object({
  title: z.string().min(1),
  address: z.string().min(1),
  price: z.number().nonnegative(),
  area: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  status: z.enum(['AVAILABLE', 'UNDER_OFFER', 'SOLD', 'RENTED']).optional(),
  images: z.array(z.string()).optional(),
  customValues: z.any().optional(),
  agentId: z.string().optional(),
  tenantId: z.string().min(1).optional(),
});

export const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(4),
  source: z.string().optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.object({ id: z.string().optional(), label: z.string(), color: z.string() })).optional(),
  customValues: z.any().optional(),
  tenantId: z.string().min(1).optional(), // opcional pois é adicionado pelo backend
});

export const opportunitySchema = z.object({
  leadId: z.string().min(1),
  leadName: z.string().min(1),
  propertyId: z.string().optional(),
  propertyTitle: z.string().optional(),
  value: z.number().nonnegative(),
  probability: z.number().min(0).max(100),
  stage: z.enum(['NEW', 'QUALIFIED', 'VISIT_SCHEDULED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  tags: z.array(z.object({ id: z.string().optional(), label: z.string(), color: z.string() })).optional(),
  tenantId: z.string().min(1),
});

export const interactionSchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'WHATSAPP']),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'invalid_date' }),
  notes: z.string().optional(),
  createdBy: z.string().min(1),
  leadId: z.string().optional(),
  opportunityId: z.string().optional(),
  tenantId: z.string().min(1).optional(), // Optional because middleware adds it
});

export const visitSchema = z.object({
  propertyId: z.string().optional(),
  propertyTitle: z.string().min(1),
  leadName: z.string().min(1),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'invalid_date' }),
  brokerId: z.string().min(1),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
  tenantId: z.string().min(1).optional(),
});

export const invoiceSchema = z.object({
  tenantId: z.string().min(1),
  planName: z.string().min(1),
  amount: z.number().nonnegative(),
  issueDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'invalid_date' }),
  dueDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'invalid_date' }),
  paidDate: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
});

export const apiKeySchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  tenantId: z.string().min(1).optional(),
});

export const webhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  tenantId: z.string().min(1).optional(),
});

export const globalSettingsSchema = z.object({
  platformName: z.string().min(2),
  defaultCurrency: z.string().min(1),
  maintenanceMode: z.boolean(),
  allowSignups: z.boolean(),
});

export const customFieldEntitySchema = z.enum(['PROPERTY', 'LEAD']);

export const customFieldConfigSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'BOOLEAN']),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export const customFieldBulkUpsertSchema = z.object({
  fields: z.array(customFieldConfigSchema).max(50),
});
