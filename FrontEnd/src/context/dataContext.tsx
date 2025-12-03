import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Visit, Lead, Tag, Tenant, Property, Opportunity, User, CustomFieldConfig, ApiKey, Webhook, GlobalSettings, SubscriptionPlan, Invoice, PaymentGateway, PaymentGatewayId } from '../types/types';
import { MOCK_TENANTS, MOCK_TEAM, MOCK_CUSTOM_FIELDS, MOCK_LEAD_CUSTOM_FIELDS, MOCK_PLANS, MOCK_INVOICES, MOCK_PAYMENT_GATEWAYS } from '../utils/constants';

interface DataContextType {
  // SaaS Management
  tenants: Tenant[];
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>, trialDuration: number) => void;
  updateTenant: (tenant: Tenant) => void;
  deleteTenant: (tenantId: string) => void;

  plans: SubscriptionPlan[];
  addPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void;
  updatePlan: (plan: SubscriptionPlan) => void;
  deletePlan: (planId: string) => void;

  paymentGateways: PaymentGateway[];
  togglePaymentGatewayStatus: (id: PaymentGatewayId) => void;
  updatePaymentGatewayConfig: (id: PaymentGatewayId, config: Record<string, string>) => void;

  invoices: Invoice[];
  allInvoices: Invoice[];
  markInvoiceAsPaid: (invoiceId: string) => void;

  globalSettings: GlobalSettings;
  updateGlobalSettings: (settings: GlobalSettings) => void;

  // Data Entities (Filtered by Current Tenant)
  visits: Visit[];
  addVisit: (visit: Visit) => void;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (id: string) => void;

  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;

  tags: Tag[];
  addTag: (tag: Tag) => void;
  updateTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;

  properties: Property[];
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;

  opportunities: Opportunity[];
  addOpportunity: (opportunity: Opportunity) => void;
  updateOpportunity: (opportunity: Opportunity) => void;
  deleteOpportunity: (id: string) => void;

  team: User[];
  addTeamMember: (user: User) => void;
  updateTeamMember: (user: User) => void;
  deleteTeamMember: (id: string) => void;

  // Configurations (Per Tenant)
  propertyCustomFields: CustomFieldConfig[];
  updatePropertyCustomFields: (fields: CustomFieldConfig[]) => void;
  leadCustomFields: CustomFieldConfig[];
  updateLeadCustomFields: (fields: CustomFieldConfig[]) => void;
  apiKeys: ApiKey[];
  addApiKey: (key: Omit<ApiKey, 'id' | 'prefix' | 'token' | 'lastUsed' | 'createdAt'>) => ApiKey;
  revokeApiKey: (id: string) => void;
  toggleApiKeyStatus: (id: string) => void;
  webhooks: Webhook[];
  addWebhook: (webhook: Omit<Webhook, 'id' | 'secret'>) => Webhook;
  updateWebhook: (webhook: Webhook) => void;
  deleteWebhook: (id: string) => void;
  triggerWebhookTest: (id: string) => Promise<boolean>;

  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const useSessionStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) { return initialValue; }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
  };
  return [storedValue, setValue];
};

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  // Global States (Not Tenant-Scoped)
  const [tenants, setTenants] = useSessionStorage<Tenant[]>('apollo_tenants', MOCK_TENANTS);
  const [plans, setPlans] = useSessionStorage<SubscriptionPlan[]>('apollo_plans', MOCK_PLANS);
  const [paymentGateways, setPaymentGateways] = useSessionStorage<PaymentGateway[]>('apollo_payment_gateways', MOCK_PAYMENT_GATEWAYS);
  const [allInvoices, setAllInvoices] = useSessionStorage<Invoice[]>('apollo_invoices', MOCK_INVOICES);
  const [allTeam, setAllTeam] = useSessionStorage<User[]>('apollo_team', MOCK_TEAM);

  const [activeTenantId, setActiveTenantId] = useSessionStorage<string>('apollo_current_tenant', MOCK_TENANTS[0].id);
  const [globalSettings, setGlobalSettings] = useSessionStorage<GlobalSettings>('apollo_global_settings', {
    platformName: 'Apollo SaaS', defaultCurrency: 'BRL', maintenanceMode: false, allowSignups: true
  });

  const currentTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;

  const createTenantScopedKey = (baseKey: string) => `apollo_${currentTenant.id}_${baseKey}_v3`;

  // Tenant-Scoped States
  const [visits, setVisits] = useSessionStorage<Visit[]>(createTenantScopedKey('visits'), []);
  const [leads, setLeads] = useSessionStorage<Lead[]>(createTenantScopedKey('leads'), []);
  const [tags, setTags] = useSessionStorage<Tag[]>(createTenantScopedKey('tags'), []);
  const [properties, setProperties] = useSessionStorage<Property[]>(createTenantScopedKey('properties'), []);
  const [opportunities, setOpportunities] = useSessionStorage<Opportunity[]>(createTenantScopedKey('opportunities'), []);
  const [propertyCustomFields, setPropertyCustomFields] = useSessionStorage<CustomFieldConfig[]>(createTenantScopedKey('prop_fields'), MOCK_CUSTOM_FIELDS);
  const [leadCustomFields, setLeadCustomFields] = useSessionStorage<CustomFieldConfig[]>(createTenantScopedKey('lead_fields'), MOCK_LEAD_CUSTOM_FIELDS);
  const [apiKeys, setApiKeys] = useSessionStorage<ApiKey[]>(createTenantScopedKey('apikeys'), []);
  const [webhooks, setWebhooks] = useSessionStorage<Webhook[]>(createTenantScopedKey('webhooks'), []);

  // Load tenant-scoped data from backend when we have a token and a tenant selected
  useEffect(() => {
    if (!token) return; // not authenticated

    (async () => {
      try {
        const { api } = await import('../services/api');
        // list properties
        const props = await api.listProperties();
        if (Array.isArray(props)) setProperties(props as any);
        // list leads
        const lds = await api.listLeads();
        if (Array.isArray(lds)) setLeads(lds as any);
      } catch (err) {
        // keep local mocks if backend calls fail
        console.warn('Backend fetch failed, continuing with local state', err);
      }
    })();
  }, [token, activeTenantId]);

  // Filtered data based on current tenant
  const team = allTeam.filter(t => t.tenantId === currentTenant.id);
  const invoices = allInvoices.filter(i => i.tenantId === currentTenant.id);

  // --- SaaS Management ---
  const switchTenant = (tenantId: string) => {
    sessionStorage.setItem('apollo_current_tenant', JSON.stringify(tenantId));
    const baseUrl = window.location.href.split('#')[0];
    window.location.href = baseUrl + '#/';
  };

  const addTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>, trialDuration: number) => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `tnt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: trialDuration > 0 ? 'TRIAL' : 'ACTIVE',
      trialEndsAt: trialDuration > 0 ? new Date(new Date().setDate(new Date().getDate() + trialDuration)).toISOString() : undefined,
      nextBillingDate: trialDuration === 0 ? new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() : undefined,
    };
    setTenants(prev => [...prev, newTenant]);
  };

  const updateTenant = (tenant: Tenant) => setTenants(prev => prev.map(t => t.id === tenant.id ? tenant : t));
  const deleteTenant = (tenantId: string) => {
    setTenants(p => p.filter(t => t.id !== tenantId));
    setAllTeam(p => p.filter(u => u.tenantId !== tenantId));
    setAllInvoices(p => p.filter(i => i.tenantId !== tenantId));
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(`apollo_${tenantId}`)) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const updateGlobalSettings = (settings: GlobalSettings) => setGlobalSettings(settings);

  const addPlan = (plan: Omit<SubscriptionPlan, 'id'>) => setPlans(p => [...p, { ...plan, id: `plan_${Date.now()}` }]);
  const updatePlan = (plan: SubscriptionPlan) => setPlans(p => p.map(pl => pl.id === plan.id ? plan : pl));
  const deletePlan = (planId: string) => setPlans(p => p.filter(pl => pl.id !== planId));

  const markInvoiceAsPaid = (invoiceId: string) => {
    setAllInvoices(p => p.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID', paidDate: new Date().toISOString() } : inv));
  };

  const togglePaymentGatewayStatus = (id: PaymentGatewayId) => {
    setPaymentGateways(prev =>
      prev.map(gw =>
        gw.id === id
          ? { ...gw, status: gw.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : gw
      )
    );
  };

  const updatePaymentGatewayConfig = (id: PaymentGatewayId, config: Record<string, string>) => {
    setPaymentGateways(prev =>
      prev.map(gw =>
        gw.id === id
          ? { ...gw, config: config }
          : gw
      )
    );
  };

  // --- Tenant Data CRUD ---
  const addVisit = (visit: Visit) => setVisits(p => [...p, visit]);
  const updateVisit = (visit: Visit) => setVisits(p => p.map(v => v.id === visit.id ? visit : v));
  const deleteVisit = (id: string) => setVisits(p => p.filter(v => v.id !== id));

  const addLead = (lead: Lead) => {
    setLeads(p => [{ ...lead, tenantId: currentTenant.id }, ...p]);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const created = await api.createLead(lead);
        setLeads(prev => prev.map(item => item.id === lead.id ? created : item));
      } catch (err) {
        console.error('Failed to create lead remote:', err);
      }
    })();
  };

  const updateLead = (lead: Lead) => {
    setLeads(p => p.map(l => l.id === lead.id ? lead : l));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const updated = await api.updateLead(lead.id, lead);
        setLeads(prev => prev.map(item => item.id === lead.id ? updated : item));
      } catch (err) {
        console.error('Failed to update lead remote:', err);
      }
    })();
  };

  const deleteLead = (id: string) => {
    const previous = leads;
    setLeads(p => p.filter(l => l.id !== id));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.deleteLead(id);
      } catch (err) {
        console.error('Failed to delete lead remote, reverting:', err);
        setLeads(previous);
      }
    })();
  };

  const addTag = (tag: Tag) => setTags(p => [...p, { ...tag, tenantId: currentTenant.id }]);
  const updateTag = (tag: Tag) => setTags(p => p.map(t => t.id === tag.id ? tag : t));
  const deleteTag = (id: string) => setTags(p => p.filter(t => t.id !== id));

  const addProperty = (prop: Property) => {
    // optimistic add
    setProperties(p => [{ ...prop, tenantId: currentTenant.id }, ...p]);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const created = await api.createProperty(prop);
        setProperties(prev => prev.map(item => item.id === prop.id ? created : item));
      } catch (err) {
        console.error('Failed to create property remote:', err);
      }
    })();
  };

  const updateProperty = (prop: Property) => {
    // optimistic update
    setProperties(p => p.map(p => p.id === prop.id ? prop : p));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const updated = await api.updateProperty(prop.id, prop);
        setProperties(prev => prev.map(item => item.id === prop.id ? updated : item));
      } catch (err) {
        console.error('Failed to update property remote:', err);
      }
    })();
  };

  const deleteProperty = (id: string) => {
    const previous = properties;
    setProperties(p => p.filter(p => p.id !== id));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.deleteProperty(id);
      } catch (err) {
        console.error('Failed to delete property remote, reverting:', err);
        setProperties(previous);
      }
    })();
  };

  const addOpportunity = (opp: Opportunity) => setOpportunities(p => [{ ...opp, tenantId: currentTenant.id }, ...p]);
  const updateOpportunity = (opp: Opportunity) => setOpportunities(p => p.map(o => o.id === opp.id ? opp : o));
  const deleteOpportunity = (id: string) => setOpportunities(p => p.filter(o => o.id !== id));

  const addTeamMember = (user: User) => setAllTeam(p => [...p, { ...user, tenantId: currentTenant.id }]);
  const updateTeamMember = (user: User) => setAllTeam(p => p.map(u => u.id === user.id ? user : u));
  const deleteTeamMember = (id: string) => setAllTeam(p => p.filter(u => u.id !== id));

  const updatePropertyCustomFields = (fields: CustomFieldConfig[]) => setPropertyCustomFields(fields);
  const updateLeadCustomFields = (fields: CustomFieldConfig[]) => setLeadCustomFields(fields);

  const addApiKey = (keyData: Omit<ApiKey, 'id' | 'prefix' | 'token' | 'lastUsed' | 'createdAt'>): ApiKey => {
    const token = `ap_live_${Math.random().toString(36).substring(2, 22)}`;
    const newKey: ApiKey = {
      ...keyData, id: `key_${Date.now()}`, prefix: `${token.substring(0, 12)}...`, token,
      lastUsed: null, createdAt: new Date().toISOString()
    };
    setApiKeys(prev => [...prev, newKey]);
    return newKey;
  };
  const revokeApiKey = (id: string) => setApiKeys(p => p.filter(k => k.id !== id));
  const toggleApiKeyStatus = (id: string) => {
    setApiKeys(p => p.map(k => k.id === id ? { ...k, status: k.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : k));
  };

  const addWebhook = (webhookData: Omit<Webhook, 'id' | 'secret'>): Webhook => {
    const secret = `whsec_${Math.random().toString(36).substring(2)}`;
    const newWebhook: Webhook = {
      ...webhookData,
      id: `wh_${Date.now()}`,
      secret,
      tenantId: currentTenant.id,
    };
    setWebhooks(p => [...p, newWebhook]);
    return newWebhook;
  };
  const updateWebhook = (webhook: Webhook) => setWebhooks(p => p.map(wh => wh.id === webhook.id ? webhook : wh));
  const deleteWebhook = (id: string) => setWebhooks(p => p.filter(wh => wh.id !== id));
  const triggerWebhookTest = async (id: string) => {
    const hook = webhooks.find(wh => wh.id === id);
    if (!hook || hook.status === 'INACTIVE') return false;
    console.log(`[Webhook Test] Triggering for ${hook.url}`);
    return true;
  };

  const resetData = () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(`apollo_${currentTenant.id}`)) {
        sessionStorage.removeItem(key);
      }
    });
    window.location.reload();
  };

  return (
    <DataContext.Provider value={{
      tenants, currentTenant, switchTenant, addTenant, updateTenant, deleteTenant,
      plans, addPlan, updatePlan, deletePlan,
      paymentGateways, togglePaymentGatewayStatus, updatePaymentGatewayConfig,
      invoices, allInvoices, markInvoiceAsPaid,
      globalSettings, updateGlobalSettings,
      visits, addVisit, updateVisit, deleteVisit,
      leads, addLead, updateLead, deleteLead,
      tags, addTag, updateTag, deleteTag,
      properties, addProperty, updateProperty, deleteProperty,
      opportunities, addOpportunity, updateOpportunity, deleteOpportunity,
      team, addTeamMember, updateTeamMember, deleteTeamMember,
      propertyCustomFields, updatePropertyCustomFields,
      leadCustomFields, updateLeadCustomFields,
      apiKeys, addApiKey, revokeApiKey, toggleApiKeyStatus,
      webhooks, addWebhook, updateWebhook, deleteWebhook, triggerWebhookTest,
      resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};