import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const getToken = () => typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
const getTenant = () => typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('apollo_current_tenant') || 'null') : null;

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
  listPlans: async () => {
    const resp = await client.get('/plans');
    return resp.data.plans || [];
  }
};

export default client;
