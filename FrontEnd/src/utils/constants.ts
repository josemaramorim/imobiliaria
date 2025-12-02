import { Tenant, User, UserRole, Property, PropertyStatus, Lead, Opportunity, OpportunityStage, Tag, ApiKey, CustomFieldConfig, Permission, Visit, Webhook, SubscriptionPlan, Invoice, PaymentGateway } from '../types/types';

export const MOCK_PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
    themeColor: '#635BFF',
    status: 'ACTIVE',
    configFields: [
      { key: 'publishableKey', label: 'saas.gateways.field_publishable_key' },
      { key: 'secretKey', label: 'saas.gateways.field_secret_key' }
    ],
    config: { publishableKey: 'pk_test_demo123', secretKey: 'sk_test_demo123' }
  },
  {
    id: 'pagarme',
    name: 'Pagar.me',
    logo: 'https://pagar.me/images/logo-pagarme.png',
    themeColor: '#25B384',
    status: 'ACTIVE',
    configFields: [
      { key: 'apiKey', label: 'saas.gateways.field_api_key' },
    ],
    config: {}
  },
  {
    id: 'asaas',
    name: 'Asaas',
    logo: 'https://www.asaas.com/assets/img/logo-h-white.svg',
    themeColor: '#00253A',
    status: 'ACTIVE',
    configFields: [
      { key: 'apiKey', label: 'saas.gateways.field_api_key' },
    ],
    config: {}
  },
  {
    id: 'pagseguro',
    name: 'PagSeguro',
    logo: 'https://stc.pagseguro.uol.com.br/pagseguro/img/uol-g-b.svg',
    themeColor: '#FFC801',
    status: 'ACTIVE',
    configFields: [
      { key: 'email', label: 'saas.gateways.field_email' },
      { key: 'token', label: 'saas.gateways.field_token' },
    ],
    config: {}
  },
];

export const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_basic_monthly',
    name: 'Básico Mensal',
    price: 99,
    billingCycle: 'MENSAL',
    features: ['Até 5 usuários', '100 imóveis', 'CRM Básico']
  },
  {
    id: 'plan_pro_monthly',
    name: 'Pro Mensal',
    price: 249,
    billingCycle: 'MENSAL',
    features: ['Até 20 usuários', 'Imóveis Ilimitados', 'CRM Avançado', 'API & Webhooks']
  },
  {
    id: 'plan_pro_annual',
    name: 'Pro Anual',
    price: 2490,
    billingCycle: 'ANUAL',
    features: ['Tudo do Pro Mensal', '2 meses de desconto']
  }
];

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tnt_01',
    name: 'Apollo Luxury Estates',
    domain: 'luxury.apollo.app',
    themeColor: '#4f46e5',
    planId: MOCK_PLANS[1].id,
    paymentGatewayId: 'stripe',
    status: 'ACTIVE',
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    settings: { currency: 'BRL', dateFormat: 'DD/MM/YYYY' }
  },
  {
    id: 'tnt_02',
    name: 'Urban Living Partners',
    domain: 'urban.apollo.app',
    themeColor: '#059669',
    planId: MOCK_PLANS[0].id,
    paymentGatewayId: 'pagarme',
    status: 'TRIAL',
    createdAt: new Date().toISOString(),
    trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    settings: { currency: 'EUR', dateFormat: 'DD/MM/YYYY' }
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_01',
    tenantId: 'tnt_01',
    planName: MOCK_PLANS[1].name,
    amount: MOCK_PLANS[1].price,
    issueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    dueDate: new Date(new Date().setMonth(new Date().getMonth() - 1) + 5).toISOString(),
    paidDate: new Date(new Date().setMonth(new Date().getMonth() - 1) + 3).toISOString(),
    status: 'PAID'
  },
  {
    id: 'inv_02',
    tenantId: 'tnt_01',
    planName: MOCK_PLANS[1].name,
    amount: MOCK_PLANS[1].price,
    issueDate: new Date().toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    status: 'PENDING'
  }
];

export const CURRENT_USER: User = {
  id: 'usr_01',
  name: 'Alex Rivera',
  email: 'alex.r@apollo.app',
  role: UserRole.ADMIN, // Promoted to ADMIN for testing
  avatarUrl: 'https://picsum.photos/id/64/200/200',
  status: 'ACTIVE',
  tenantId: 'tnt_01',
  performance: {
    deals: 12,
    value: 4500000,
    conversionRate: 15
  }
};

// --- RBAC Configuration ---
// Define what each role CAN do. 
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'properties.create', 'properties.edit', 'properties.delete',
    'crm.view', 'crm.manage',
    'team.view', 'team.invite', 'team.edit', 'team.delete',
    'settings.view', 'settings.manage'
  ],
  [UserRole.MANAGER]: [
    'properties.create', 'properties.edit', 'properties.delete',
    'crm.view', 'crm.manage',
    'team.view',
  ],
  [UserRole.BROKER]: [
    'properties.create', 'properties.edit',
    'crm.view', 'crm.manage'
  ]
};

export const KANBAN_COLUMNS = [
  { id: OpportunityStage.NEW, title: 'Novo', color: 'border-gray-400' },
  { id: OpportunityStage.QUALIFIED, title: 'Qualificado', color: 'border-sky-400' },
  { id: OpportunityStage.VISIT_SCHEDULED, title: 'Visita Agendada', color: 'border-blue-400' },
  { id: OpportunityStage.PROPOSAL, title: 'Proposta', color: 'border-yellow-400' },
  { id: OpportunityStage.NEGOTIATION, title: 'Negociação', color: 'border-purple-400' },
  { id: OpportunityStage.CLOSED_WON, title: 'Ganho', color: 'border-green-400' },
  { id: OpportunityStage.CLOSED_LOST, title: 'Perdido', color: 'border-red-400' },
];

export const MOCK_TEAM: User[] = [
  CURRENT_USER,
  {
    id: 'usr_02',
    name: 'Sarah Chen',
    email: 'sarah.c@apollo.app',
    phone: '(11) 98888-7777',
    role: UserRole.BROKER,
    avatarUrl: 'https://picsum.photos/id/65/200/200',
    status: 'ACTIVE',
    tenantId: 'tnt_01',
    performance: { deals: 8, value: 2100000, conversionRate: 12 }
  },
  {
    id: 'usr_03',
    name: 'Mike Ross',
    email: 'mike.r@urban.app',
    phone: '(11) 97777-6666',
    role: UserRole.ADMIN,
    avatarUrl: 'https://picsum.photos/id/100/200/200',
    status: 'ACTIVE',
    tenantId: 'tnt_02',
    performance: { deals: 5, value: 1200000, conversionRate: 8 }
  }
];

export const MOCK_CUSTOM_FIELDS: CustomFieldConfig[] = [
  { key: 'property_type', label: 'Tipo de Imóvel', type: 'SELECT', options: ['Apartamento', 'Casa', 'Sobrado', 'Terreno', 'Comercial', 'Cobertura'], required: true },
  { key: 'features', label: 'Comodidades', type: 'MULTI_SELECT', options: ['Piscina', 'Academia', 'Garagem', 'Jardim', 'Portaria 24h', 'Sacada', 'Churrasqueira'] },
];

export const MOCK_LEAD_CUSTOM_FIELDS: CustomFieldConfig[] = [
  { key: 'budget', label: 'Orçamento Estimado', type: 'NUMBER', required: false },
  { key: 'urgency', label: 'Urgência', type: 'SELECT', options: ['Imediata', '3 Meses', '6 Meses', 'Apenas Pesquisando'] }
];