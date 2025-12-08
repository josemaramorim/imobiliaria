// Domain Types

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  BROKER = 'BROKER',
}

// --- Permissions System ---
export type Permission = 
  | 'properties.create'
  | 'properties.edit'
  | 'properties.delete'
  | 'crm.view'
  | 'crm.manage'
  | 'team.view'
  | 'team.invite'
  | 'team.edit'
  | 'team.delete'
  | 'settings.view'
  | 'settings.manage'
  | 'saas.manage'; // Permission for the SaaS Owner

// --- Billing & SaaS Management ---

export type PaymentGatewayId = string; // ID vem do banco de dados (stripe, pagarme, asaas, pagseguro, paypal, etc)

export interface PaymentGateway {
  id: PaymentGatewayId;
  name: string;
  logo: string; // URL to the logo
  themeColor: string;
  status: 'ACTIVE' | 'INACTIVE';
  configFields: { key: string; label: string; }[];
  config?: Record<string, string>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'MENSAL' | 'ANUAL';
  features: string[];
}

export interface Invoice {
  id: string;
  tenantId: string;
  planName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface GlobalSettings {
  platformName: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  allowSignups: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  themeColor: string;
  logoUrl?: string;
  planId: string; // Link to SubscriptionPlan
  paymentGatewayId: PaymentGatewayId;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'PAST_DUE';
  createdAt: string;
  trialEndsAt?: string;
  nextBillingDate?: string;
  settings: {
    currency: string;
    dateFormat: string;
  };
}

// --- Tenant-Specific Data ---

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  tenantId?: string; // Link user to a tenant
  performance?: {
    deals: number;
    value: number;
    conversionRate: number;
  };
}

export interface Tag {
  id: string;
  label: string;
  color: string; // Hex code
  tenantId?: string;
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  UNDER_OFFER = 'UNDER_OFFER',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
}

// --- Custom Fields System ---
export type CustomFieldType = 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN';

export interface CustomFieldConfig {
  key: string;
  label: string;
  type: CustomFieldType;
  options?: string[]; // For SELECT and MULTI_SELECT
  required?: boolean;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  images: string[];
  customValues: Record<string, any>;
  agentId: string;
  tenantId: string;
}

export enum OpportunityStage {
  NEW = 'NEW',
  QUALIFIED = 'QUALIFIED',
  VISIT_SCHEDULED = 'VISIT_SCHEDULED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export type InteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'WHATSAPP';

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string; // ISO String
  notes: string;
  createdBy: string; // User ID
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status?: string;
  isActive: boolean;
  tags: Tag[];
  customValues: Record<string, any>;
  interactions: Interaction[];
  createdAt: string;
  tenantId: string;
}

export interface Opportunity {
  id: string;
  leadId: string;
  leadName: string;
  propertyId?: string;
  propertyTitle?: string;
  value: number;
  probability: number; // 0-100
  stage: OpportunityStage;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  leadName: string;
  date: string; // ISO String
  brokerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  reminderEnabled?: boolean;
  tenantId: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string; 
  token: string;
  lastUsed: string | null;
  createdAt: string;
  scopes: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'ACTIVE' | 'INACTIVE';
  secret: string;
  lastTriggered?: string;
  failedCount: number;
  tenantId?: string;
}