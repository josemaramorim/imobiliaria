import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const getToken = () => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
  if (token) console.log('📡 [API] Token encontrado, enviando para requisição');
  else console.log('📡 [API] ⚠️ Token NÃO encontrado!');
  return token;
};
const getTenant = () => typeof window !== 'undefined' ? sessionStorage.getItem('apollo_current_tenant') : null;

const client = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

client.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  const tenant = getTenant();
  if (tenant) cfg.headers = { ...cfg.headers, 'x-tenant-id': tenant };
  return cfg;
});

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const resp = await client.post('/auth/login', { email, password });
    return resp.data;
  },
  getMe: async () => {
    const resp = await client.get('/users/me');
    return resp.data;
  },
  getGlobalSettings: async () => {
    const resp = await client.get('/settings/global');
    return resp.data.settings;
  },
  updateGlobalSettings: async (payload: any) => {
    const resp = await client.put('/settings/global', payload);
    return resp.data.settings;
  },

  // Properties
  listProperties: async () => {
    const resp = await client.get('/properties');
    return resp.data.properties || [];
  },
  createProperty: async (payload: any) => {
    const resp = await client.post('/properties', payload);
    return resp.data.property;
  },
  updateProperty: async (id: string, payload: any) => {
    const resp = await client.put(`/properties/${id}`, payload);
    return resp.data.property;
  },
  deleteProperty: async (id: string) => {
    const resp = await client.delete(`/properties/${id}`);
    return resp.data;
  },

  // Leads
  listLeads: async () => {
    const resp = await client.get('/leads');
    return resp.data.leads || [];
  },
  createLead: async (payload: any) => {
    const resp = await client.post('/leads', payload);
    return resp.data.lead;
  },
  updateLead: async (id: string, payload: any) => {
    const resp = await client.put(`/leads/${id}`, payload);
    return resp.data.lead;
  },
  deleteLead: async (id: string) => {
    const resp = await client.delete(`/leads/${id}`);
    return resp.data;
  },

  // Tags
  listTags: async () => {
    const resp = await client.get('/tags');
    return resp.data.tags || [];
  },
  createTag: async (payload: any) => {
    const resp = await client.post('/tags', payload);
    return resp.data.tag;
  },
  updateTag: async (id: string, payload: any) => {
    const resp = await client.put(`/tags/${id}`, payload);
    return resp.data.tag;
  },
  deleteTag: async (id: string) => {
    const resp = await client.delete(`/tags/${id}`);
    return resp.data;
  },

  // Interactions
  createInteraction: async (payload: any) => {
    const resp = await client.post('/interactions', payload);
    return resp.data.interaction;
  },
  deleteInteraction: async (id: string) => {
    const resp = await client.delete(`/interactions/${id}`);
    return resp.data;
  },

  // Users / Team
  listUsers: async () => {
    const resp = await client.get('/users');
    return resp.data.users || [];
  },
  createUser: async (payload: any) => {
    const resp = await client.post('/users', payload);
    return resp.data.user;
  },
  updateUser: async (id: string, payload: any) => {
    const resp = await client.put(`/users/${id}`, payload);
    return resp.data.user;
  },
  deleteUser: async (id: string) => {
    await client.delete(`/users/${id}`);
  },

  // Tenants & Plans (admin)
  listTenants: async () => {
    const resp = await client.get('/tenants');
    return resp.data.tenants || [];
  },
  createTenant: async (payload: any) => {
    const resp = await client.post('/tenants', payload);
    return resp.data.tenant;
  },
  updateTenant: async (id: string, payload: any) => {
    const resp = await client.put(`/tenants/${id}`, payload);
    return resp.data.tenant;
  },
  deleteTenant: async (id: string) => {
    const resp = await client.delete(`/tenants/${id}`);
    return resp.data;
  },
  listPlans: async () => {
    const resp = await client.get('/plans');
    return resp.data.plans || [];
  },

  // Payment Gateways
  listPaymentGateways: async () => {
    const resp = await client.get('/payment-gateways');
    return resp.data.paymentGateways || [];
  },
  createPaymentGateway: async (payload: any) => {
    const resp = await client.post('/payment-gateways', payload);
    return resp.data.paymentGateway;
  },
  updatePaymentGateway: async (id: string, payload: any) => {
    const resp = await client.put(`/payment-gateways/${id}`, payload);
    return resp.data.paymentGateway;
  },
  deletePaymentGateway: async (id: string) => {
    const resp = await client.delete(`/payment-gateways/${id}`);
    return resp.data;
  },

  // Visits
  listVisits: async () => {
    const resp = await client.get('/visits');
    return resp.data.visits || [];
  },
  createVisit: async (payload: any) => {
    const resp = await client.post('/visits', payload);
    return resp.data.visit;
  },
  updateVisit: async (id: string, payload: any) => {
    const resp = await client.put(`/visits/${id}`, payload);
    return resp.data.visit;
  },
  deleteVisit: async (id: string) => {
    const resp = await client.delete(`/visits/${id}`);
    return resp.data;
  },

  listCustomFields: async (entity: 'PROPERTY' | 'LEAD') => {
    const resp = await client.get(`/custom-fields/${entity}`);
    return resp.data.fields || [];
  },
  saveCustomFields: async (entity: 'PROPERTY' | 'LEAD', fields: any[]) => {
    const resp = await client.put(`/custom-fields/${entity}`, { fields });
    return resp.data.fields || [];
  }
};

export default client;
