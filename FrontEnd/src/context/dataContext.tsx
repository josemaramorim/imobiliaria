import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Visit, Lead, Tag, Tenant, Property, Opportunity, User, CustomFieldConfig, ApiKey, Webhook, GlobalSettings, SubscriptionPlan, Invoice, PaymentGateway, PaymentGatewayId } from '../types/types';
import { usePermission } from './auth';

interface DataContextType {
  // SaaS Management
  tenants: Tenant[];
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>, trialDuration: number) => Promise<void>;
  updateTenant: (tenant: Tenant) => Promise<void>;
  deleteTenant: (tenantId: string) => void;

  plans: SubscriptionPlan[];
  addPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void;
  updatePlan: (plan: SubscriptionPlan) => void;
  deletePlan: (planId: string) => void;

  paymentGateways: PaymentGateway[];
  createPaymentGateway: (gateway: Omit<PaymentGateway, 'status' | 'config'>) => void;
  updatePaymentGateway: (id: PaymentGatewayId, gateway: Partial<Omit<PaymentGateway, 'id' | 'status' | 'config'>>) => void;
  deletePaymentGateway: (id: PaymentGatewayId) => Promise<void>;
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
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? (value as Function)(prev) : value;
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  };
  return [storedValue, setValue];
};

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const { user } = usePermission();
  // Global States (Not Tenant-Scoped) — inicializa vazio, carrega via API
  const [tenants, setTenants] = useSessionStorage<Tenant[]>('apollo_tenants', []);
  const [plans, setPlans] = useSessionStorage<SubscriptionPlan[]>('apollo_plans', []);
  const [paymentGateways, setPaymentGateways] = useSessionStorage<PaymentGateway[]>('apollo_payment_gateways', []);
  const [allInvoices, setAllInvoices] = useSessionStorage<Invoice[]>('apollo_invoices', []);
  const [allTeam, setAllTeam] = useSessionStorage<User[]>('apollo_team', []);

  const [activeTenantId, setActiveTenantId] = useSessionStorage<string>('apollo_current_tenant', '');
  const [globalSettings, setGlobalSettings] = useSessionStorage<GlobalSettings>('apollo_global_settings', {
    platformName: '', defaultCurrency: '', maintenanceMode: false, allowSignups: true
  });
  
  // Ler tenant do query parameter na inicialização (para nova aba)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
    const tenantFromUrl = params.get('tenant');
    if (tenantFromUrl && tenantFromUrl !== activeTenantId) {
      console.log('📊 [DataContext] Tenant detectado na URL:', tenantFromUrl);
      setActiveTenantId(tenantFromUrl);
    }
  }, []);
  
  // Sync activeTenantId with logged user
  useEffect(() => {
    if (user && user.tenantId && user.tenantId !== activeTenantId) {
      setActiveTenantId(user.tenantId);
    }
  }, [user, activeTenantId, setActiveTenantId]);

  const currentTenant = tenants.find(t => t.id === activeTenantId);
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;

  const createTenantScopedKey = (baseKey: string) => {
    if (!currentTenant) return `apollo_no_tenant_${baseKey}_v3`;
    return `apollo_${currentTenant.id}_${baseKey}_v3`;
  };

  // Tenant-Scoped States
  const [visits, setVisits] = useSessionStorage<Visit[]>(createTenantScopedKey('visits'), []);
  const [leads, setLeads] = useSessionStorage<Lead[]>(createTenantScopedKey('leads'), []);
  const [tags, setTags] = useSessionStorage<Tag[]>(createTenantScopedKey('tags'), []);
  const [properties, setProperties] = useSessionStorage<Property[]>(createTenantScopedKey('properties'), []);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [propertyCustomFields, setPropertyCustomFields] = useSessionStorage<CustomFieldConfig[]>(createTenantScopedKey('prop_fields'), []);
  const [leadCustomFields, setLeadCustomFields] = useSessionStorage<CustomFieldConfig[]>(createTenantScopedKey('lead_fields'), []);
  const [apiKeys, setApiKeys] = useSessionStorage<ApiKey[]>(createTenantScopedKey('apikeys'), []);
  const [webhooks, setWebhooks] = useSessionStorage<Webhook[]>(createTenantScopedKey('webhooks'), []);

  // Load tenant-scoped data from backend when we have a token and a tenant selected
  useEffect(() => {
    if (!token || !user) {
      console.log('📊 [DataContext] Pulando: sem token ou user');
      return; // not authenticated
    }
    
    // Super Admin (user without tenantId) should not load tenant-scoped data
    if (!user.tenantId && !activeTenantId) {
      console.log('📊 [DataContext] Super Admin sem tenant selecionado - pulando carregamento de dados tenant-scoped');
      return;
    }

    console.log('📊 [DataContext] Carregando dados tenant-scoped...');
    console.log('📊 [DataContext] user.tenantId:', user.tenantId);
    console.log('📊 [DataContext] activeTenantId:', activeTenantId);
    console.log('📊 [DataContext] sessionStorage apollo_current_tenant:', sessionStorage.getItem('apollo_current_tenant'));

    (async () => {
      try {
        const { api } = await import('../services/api');
        
        console.log('📊 [DataContext] Carregando properties...');
        const props = await api.listProperties();
        console.log('📊 [DataContext] Properties recebidas:', props);
        if (Array.isArray(props)) setProperties(props as any);
        
        console.log('📊 [DataContext] Carregando leads...');
        const lds = await api.listLeads();
        console.log('📊 [DataContext] Leads recebidos:', lds);
        if (Array.isArray(lds)) setLeads(lds as any);
        
        console.log('📊 [DataContext] Carregando visits...');
        const vsts = await api.listVisits();
        console.log('📊 [DataContext] Visits recebidas:', vsts);
        if (Array.isArray(vsts)) setVisits(vsts as any);
        
        console.log('📊 [DataContext] Carregando tags...');
        const tgs = await api.listTags();
        console.log('📊 [DataContext] Tags recebidas:', tgs);
        if (Array.isArray(tgs)) setTags(tgs as any);

        console.log('📊 [DataContext] Carregando opportunities...');
        const opps = await api.listOpportunities();
        console.log('📊 [DataContext] Opportunities recebidas:', opps);
        if (Array.isArray(opps)) setOpportunities(opps as any);
        
        try {
          console.log('📊 [DataContext] Carregando custom fields...');
          const propFields = await api.listCustomFields('PROPERTY');
          console.log('📊 [DataContext] Property fields:', propFields);
          if (Array.isArray(propFields)) setPropertyCustomFields(propFields as any);
          
          const leadFields = await api.listCustomFields('LEAD');
          console.log('📊 [DataContext] Lead fields:', leadFields);
          if (Array.isArray(leadFields)) setLeadCustomFields(leadFields as any);
        } catch (fieldErr) {
          console.warn('❌ [DataContext] Failed to fetch custom fields:', fieldErr);
        }
        
        console.log('✅ [DataContext] Todos os dados carregados com sucesso!');
      } catch (err) {
        console.error('❌ [DataContext] Backend fetch failed:', err);
      }
    })();
  }, [token, activeTenantId, user?.tenantId]);

  useEffect(() => {
    if (!token || !user) return;
    
    // Super Admin sem tenant não deve carregar dados tenant-scoped
    if (!user.tenantId && !currentTenant) return;

    (async () => {
      try {
        const { api } = await import('../services/api');
        const users = await api.listUsers();
        if (Array.isArray(users)) {
          setAllTeam(prev => {
            const others = prev.filter(u => u.tenantId !== currentTenant.id);
            return [...others, ...users];
          });
        }
      } catch (err) {
        console.warn('Failed to fetch team data, using local state', err);
      }
    })();
  }, [token, currentTenant?.id]);

  // Load global SaaS data (tenants, plans) when authenticated
  useEffect(() => {
    // Only load if token exists AND user is authenticated
    if (!token || !user) return;
    
    (async () => {
      try {
        const { api } = await import('../services/api');
        const tnts = await api.listTenants();
        if (Array.isArray(tnts) && tnts.length > 0) {
          setTenants(tnts as any);
        }
        const pls = await api.listPlans();
        if (Array.isArray(pls)) setPlans(pls as any);
        const gateways = await api.listPaymentGateways();
        if (Array.isArray(gateways)) setPaymentGateways(gateways as any);
        if (!user?.tenantId) {
          const settings = await api.getGlobalSettings();
          if (settings) setGlobalSettings(settings as any);
        }
      } catch (err) {
        console.warn('Failed to fetch global SaaS data, using local state', err);
      }
    })();
  }, [token, user]);

  // Filtered data based on current tenant
  const team = currentTenant ? allTeam.filter(t => t.tenantId === currentTenant.id) : [];
  const invoices = currentTenant ? allInvoices.filter(i => i.tenantId === currentTenant.id) : [];

  // --- SaaS Management ---
  const switchTenant = (tenantId: string) => {
    // Salvar tenant ID no sessionStorage
    sessionStorage.setItem('apollo_current_tenant', tenantId);
    // Abrir painel do tenant em nova aba com query parameter para forçar o carregamento
    const newUrl = `${window.location.origin}${window.location.pathname}#/?tenant=${tenantId}`;
    window.open(newUrl, '_blank');
  };

  const addTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt'>, trialDuration: number): Promise<void> => {
    // optimistic local add
    const tempTenant: Tenant = {
      ...tenantData,
      id: `tnt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: trialDuration > 0 ? 'TRIAL' : 'ACTIVE',
      trialEndsAt: trialDuration > 0 ? new Date(new Date().setDate(new Date().getDate() + trialDuration)).toISOString() : undefined,
      nextBillingDate: trialDuration === 0 ? new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() : undefined,
    };
    setTenants(prev => [...prev, tempTenant]);
    const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!tokenLocal) {
      console.warn('[DataContext] addTenant: no auth token found — skipping remote create');
      throw new Error('Não autenticado. Faça login novamente.');
    }
    
    try {
      const { api } = await import('../services/api');
      const created = await api.createTenant({ ...tenantData, trialDuration });
      if (created && created.id) {
        setTenants(prev => prev.map(t => t.id === tempTenant.id ? created : t));
      } else {
        const all = await api.listTenants();
        if (Array.isArray(all)) setTenants(all as any);
      }
    } catch (err) {
      console.error('Failed to create tenant remote:', err);
      // Remove the temporary tenant on error
      setTenants(prev => prev.filter(t => t.id !== tempTenant.id));
      throw err;
    }
  };

  const updateTenant = async (tenant: Tenant): Promise<void> => {
    console.log('📝 [DataContext] updateTenant called with:', tenant);
    const previous = tenants;
    setTenants(prev => prev.map(t => t.id === tenant.id ? tenant : t));
    const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!tokenLocal) {
      console.warn('[DataContext] updateTenant: no auth token found — skipping remote update');
      throw new Error('Não autenticado. Faça login novamente.');
    }
    
    try {
      const { api } = await import('../services/api');
      console.log('📡 [DataContext] Calling api.updateTenant with id:', tenant.id);
      const updated = await api.updateTenant(tenant.id, tenant);
      console.log('✅ [DataContext] Tenant updated successfully:', updated);
      setTenants(prev => prev.map(t => t.id === tenant.id ? updated : t));
    } catch (err: any) {
      console.error('❌ [DataContext] Failed to update tenant remote, reverting:', err);
      console.error('Error details:', err.response?.data || err.message);
      setTenants(previous);
      throw err; // Re-throw to let the caller handle it
    }
  };
  const deleteTenant = (tenantId: string) => {
    const previous = tenants;
    setTenants(p => p.filter(t => t.id !== tenantId));
    setAllTeam(p => p.filter(u => u.tenantId !== tenantId));
    setAllInvoices(p => p.filter(i => i.tenantId !== tenantId));
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(`apollo_${tenantId}`)) {
        sessionStorage.removeItem(key);
      }
    });
    const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!tokenLocal) {
      console.warn('[DataContext] deleteTenant: no auth token found — skipping remote delete');
      return;
    }
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.deleteTenant(tenantId);
      } catch (err) {
        console.error('Failed to delete tenant remote, reverting:', err);
        setTenants(previous);
      }
    })();
  };

  const updateGlobalSettings = (settings: GlobalSettings) => {
    const previous = globalSettings;
    setGlobalSettings(settings);
    const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!tokenLocal) {
      console.warn('[DataContext] updateGlobalSettings: no auth token found — skipping remote update');
      setGlobalSettings(previous);
      return;
    }
    if (user?.tenantId) {
      console.warn('[DataContext] updateGlobalSettings: tenant admins não podem atualizar configurações globais');
      setGlobalSettings(previous);
      return;
    }
    (async () => {
      try {
        const { api } = await import('../services/api');
        const updated = await api.updateGlobalSettings(settings);
        if (updated) setGlobalSettings(updated as any);
      } catch (err) {
        console.error('Failed to update global settings remote, reverting:', err);
        setGlobalSettings(previous);
      }
    })();
  };

  const addPlan = (plan: Omit<SubscriptionPlan, 'id'>) => setPlans(p => [...p, { ...plan, id: `plan_${Date.now()}` }]);
  const updatePlan = (plan: SubscriptionPlan) => setPlans(p => p.map(pl => pl.id === plan.id ? plan : pl));
  const deletePlan = (planId: string) => setPlans(p => p.filter(pl => pl.id !== planId));

  const markInvoiceAsPaid = (invoiceId: string) => {
    setAllInvoices(p => p.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID', paidDate: new Date().toISOString() } : inv));
  };

  const createPaymentGateway = (gateway: Omit<PaymentGateway, 'status' | 'config'>) => {
    const newGateway: PaymentGateway = {
      ...gateway,
      status: 'INACTIVE',
      config: {}
    };
    setPaymentGateways(prev => [...prev, newGateway]);
    
    // Persist to backend
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.createPaymentGateway({
          id: gateway.id,
          name: gateway.name,
          logo: gateway.logo,
          themeColor: gateway.themeColor,
          configFields: gateway.configFields
        });
      } catch (err) {
        console.error('Failed to create payment gateway:', err);
        // Revert on error
        setPaymentGateways(prev => prev.filter(gw => gw.id !== gateway.id));
      }
    })();
  };

  const updatePaymentGateway = (id: PaymentGatewayId, updates: Partial<Omit<PaymentGateway, 'id' | 'status' | 'config'>>) => {
    const oldGateway = paymentGateways.find(gw => gw.id === id);
    if (!oldGateway) return;
    
    setPaymentGateways(prev =>
      prev.map(gw =>
        gw.id === id
          ? { ...gw, ...updates }
          : gw
      )
    );
    
    // Persist to backend
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.updatePaymentGateway(id, updates);
      } catch (err) {
        console.error('Failed to update payment gateway:', err);
        // Revert on error
        setPaymentGateways(prev =>
          prev.map(gw =>
            gw.id === id ? oldGateway : gw
          )
        );
      }
    })();
  };

  const deletePaymentGateway = async (id: PaymentGatewayId) => {
    const gateway = paymentGateways.find(gw => gw.id === id);
    if (!gateway) return;
    
    // Remover imediatamente da UI
    setPaymentGateways(prev => prev.filter(gw => gw.id !== id));
    
    try {
      const { api } = await import('../services/api');
      await api.deletePaymentGateway(id);
    } catch (err: any) {
      console.error('Failed to delete payment gateway:', err);
      // Revert on error
      setPaymentGateways(prev => [...prev, gateway]);
      // Re-throw para mostrar erro no modal
      throw new Error(err.response?.data?.error || 'Erro ao excluir gateway');
    }
  };

  const togglePaymentGatewayStatus = (id: PaymentGatewayId) => {
    const gateway = paymentGateways.find(gw => gw.id === id);
    if (!gateway) return;
    
    const newStatus = gateway.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setPaymentGateways(prev =>
      prev.map(gw =>
        gw.id === id
          ? { ...gw, status: newStatus }
          : gw
      )
    );
    
    // Persist to backend
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.updatePaymentGateway(id, { status: newStatus });
      } catch (err: any) {
        console.error('Failed to update payment gateway status:', err);
        // Revert on error
        setPaymentGateways(prev =>
          prev.map(gw =>
            gw.id === id
              ? { ...gw, status: gateway.status }
              : gw
          )
        );
        alert(`Erro ao atualizar status do gateway: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updatePaymentGatewayConfig = (id: PaymentGatewayId, config: Record<string, string>) => {
    const gateway = paymentGateways.find(gw => gw.id === id);
    const previousConfig = gateway?.config;
    setPaymentGateways(prev =>
      prev.map(gw =>
        gw.id === id
          ? { ...gw, config: config }
          : gw
      )
    );
    
    // Persist to backend
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.updatePaymentGateway(id, { config });
      } catch (err: any) {
        console.error('Failed to update payment gateway config:', err);
        // Rollback
        setPaymentGateways(prev =>
          prev.map(gw =>
            gw.id === id
              ? { ...gw, config: previousConfig }
              : gw
          )
        );
        alert(`Erro ao atualizar configuração do gateway: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  // --- Tenant Data CRUD ---
  const addVisit = (visit: Visit) => {
    const previous = visits;
    setVisits(p => [...p, visit]);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const created = await api.createVisit(visit);
        setVisits(prev => prev.map(item => item.id === visit.id ? created : item));
      } catch (err: any) {
        console.error('Failed to create visit remote:', err);
        setVisits(previous); // Rollback
        alert(`Erro ao criar visita: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updateVisit = (visit: Visit) => {
    const previous = visits;
    setVisits(p => p.map(v => v.id === visit.id ? visit : v));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const updated = await api.updateVisit(visit.id, visit);
        setVisits(prev => prev.map(item => item.id === visit.id ? updated : item));
      } catch (err: any) {
        console.error('Failed to update visit remote:', err);
        setVisits(previous); // Rollback
        alert(`Erro ao atualizar visita: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const deleteVisit = (id: string) => {
    const previous = visits;
    setVisits(p => p.filter(v => v.id !== id));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.deleteVisit(id);
      } catch (err: any) {
        console.error('Failed to delete visit remote, reverting:', err);
        setVisits(previous);
        alert(`Erro ao deletar visita: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const addLead = (lead: Lead) => {
    const previous = leads;
    setLeads(p => [{ ...lead, tenantId: currentTenant.id }, ...p]);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const created = await api.createLead(lead);
        setLeads(prev => prev.map(item => item.id === lead.id ? created : item));
      } catch (err: any) {
        console.error('Failed to create lead remote:', err);
        setLeads(previous); // Rollback
        alert(`Erro ao criar lead: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updateLead = (lead: Lead) => {
    const previous = leads;
    setLeads(p => p.map(l => l.id === lead.id ? lead : l));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const updated = await api.updateLead(lead.id, lead);
        setLeads(prev => prev.map(item => item.id === lead.id ? updated : item));
      } catch (err: any) {
        console.error('Failed to update lead remote:', err);
        setLeads(previous); // Rollback
        alert(`Erro ao atualizar lead: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
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
      } catch (err: any) {
        console.error('Failed to delete lead remote, reverting:', err);
        setLeads(previous);
        alert(`Erro ao deletar lead: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const addTag = (tag: Tag) => {
    // optimistic local add
    const previous = tags;
    setTags(p => [...p, { ...tag, tenantId: currentTenant.id }]);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const created = await api.createTag(tag);
        // refresh list from backend to ensure consistency
        const all = await api.listTags();
        if (Array.isArray(all)) setTags(all as any);
      } catch (err: any) {
        console.error('Failed to create tag remote:', err);
        setTags(previous); // Rollback
        alert(`Erro ao criar tag: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updateTag = (tag: Tag) => {
    const previous = tags;
    setTags(p => p.map(t => t.id === tag.id ? tag : t));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const updated = await api.updateTag(tag.id, tag);
        setTags(prev => prev.map(t => t.id === tag.id ? updated : t));
      } catch (err: any) {
        console.error('Failed to update tag remote, reverting:', err);
        setTags(previous);
        alert(`Erro ao atualizar tag: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const deleteTag = (id: string) => {
    const previous = tags;
    setTags(p => p.filter(t => t.id !== id));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.deleteTag(id);
      } catch (err: any) {
        console.error('Failed to delete tag remote, reverting:', err);
        setTags(previous);
        alert(`Erro ao deletar tag: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const addProperty = (prop: Property) => {
    // optimistic add
    const previous = properties;
    setProperties(p => [{ ...prop, tenantId: currentTenant.id }, ...p]);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const created = await api.createProperty(prop);
        // Refresh the entire list from backend to ensure it appears
        const allProps = await api.listProperties();
        if (Array.isArray(allProps)) {
          setProperties(allProps as any);
        }
      } catch (err: any) {
        console.error('Failed to create property remote:', err);
        setProperties(previous); // Rollback
        alert(`Erro ao criar imóvel: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updateProperty = (prop: Property) => {
    // optimistic update
    const previous = properties;
    setProperties(p => p.map(p => p.id === prop.id ? prop : p));
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return;
    (async () => {
      try {
        const { api } = await import('../services/api');
        const updated = await api.updateProperty(prop.id, prop);
        setProperties(prev => prev.map(item => item.id === prop.id ? updated : item));
      } catch (err: any) {
        console.error('Failed to update property remote:', err);
        setProperties(previous); // Rollback
        alert(`Erro ao atualizar imóvel: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
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
      } catch (err: any) {
        console.error('Failed to delete property remote, reverting:', err);
        setProperties(previous);
        alert(`Erro ao deletar imóvel: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const addOpportunity = (opp: Opportunity) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return alert('Não autenticado');

    (async () => {
      try {
        const { api } = await import('../services/api');
        const payload = { ...opp, tenantId: currentTenant.id };
        await api.createOpportunity(payload);
        const refreshed = await api.listOpportunities();
        if (Array.isArray(refreshed)) setOpportunities(refreshed as any);
      } catch (err: any) {
        console.error('Failed to create opportunity remote:', err);
        alert(`Erro ao criar oportunidade: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updateOpportunity = (opp: Opportunity) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return alert('Não autenticado');
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.updateOpportunity(opp.id, opp);
        const refreshed = await api.listOpportunities();
        if (Array.isArray(refreshed)) setOpportunities(refreshed as any);
      } catch (err: any) {
        console.error('Failed to update opportunity remote:', err);
        alert(`Erro ao atualizar oportunidade: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const deleteOpportunity = (id: string) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!token) return alert('Não autenticado');
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.deleteOpportunity(id);
        const refreshed = await api.listOpportunities();
        if (Array.isArray(refreshed)) setOpportunities(refreshed as any);
      } catch (err: any) {
        console.error('Failed to delete opportunity remote:', err);
        alert(`Erro ao deletar oportunidade: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const addTeamMember = (user: User) => {
    // Optimistic update
    setAllTeam(p => [...p, { ...user, tenantId: currentTenant.id }]);

    // Persist to backend
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.createUser(user);
      } catch (err: any) {
        // Revert on error
        setAllTeam(p => p.filter(u => u.id !== user.id));
        console.error('Falha ao criar usuário:', err);
        alert(`Erro ao criar usuário: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };
  const updateTeamMember = (user: User) => {
    const previous = allTeam;
    // Optimistic update
    setAllTeam(p => p.map(u => u.id === user.id ? user : u));

    // Persist to backend
    (async () => {
      try {
        const { api } = await import('../services/api');
        const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
        if (!tokenLocal) {
          console.warn('[DataContext] updateTeamMember: token ausente — ignorando chamada remota');
          return;
        }

        const payload = {
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: user.role,
          status: user.status,
        };

        const updated = await api.updateUser(user.id, payload);
        if (updated) {
          setAllTeam(prev => prev.map(u => u.id === user.id ? { ...u, ...updated } : u));
        }
      } catch (err: any) {
        // Revert on error
        setAllTeam(previous);
        console.error('Falha ao atualizar usuário:', err);
        alert(`Erro ao atualizar usuário: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };
  const deleteTeamMember = (id: string) => {
    const previous = allTeam;
    // Optimistic update
    setAllTeam(p => p.filter(u => u.id !== id));

    // Persist to backend
    (async () => {
      try {
        const { api } = await import('../services/api');
        const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
        if (!tokenLocal) {
          console.warn('[DataContext] deleteTeamMember: token ausente — ignorando chamada remota');
          return;
        }

        await api.deleteUser(id);

        const refreshed = await api.listUsers();
        if (Array.isArray(refreshed)) {
          setAllTeam(prev => {
            const others = prev.filter(u => u.tenantId !== currentTenant.id);
            return [...others, ...refreshed];
          });
        }
      } catch (err: any) {
        // Revert on error
        setAllTeam(previous);
        console.error('Falha ao deletar usuário:', err);
        alert(`Erro ao deletar usuário: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updatePropertyCustomFields = (fields: CustomFieldConfig[]) => {
    const normalized = fields.map(field => ({ ...field, entity: 'PROPERTY' as const, options: field.options ?? [] }));
    const previous = propertyCustomFields;
    setPropertyCustomFields(normalized);
    const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!tokenLocal) {
      console.warn('[DataContext] updatePropertyCustomFields: no auth token found — skipping remote update');
      return;
    }
    (async () => {
      try {
        const { api } = await import('../services/api');
        const saved = await api.saveCustomFields('PROPERTY', normalized);
        if (Array.isArray(saved)) setPropertyCustomFields(saved as any);
      } catch (err: any) {
        console.error('Failed to update property custom fields remote, reverting:', err);
        setPropertyCustomFields(previous);
        alert(`Erro ao atualizar campos customizados: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

  const updateLeadCustomFields = (fields: CustomFieldConfig[]) => {
    const normalized = fields.map(field => ({ ...field, entity: 'LEAD' as const, options: field.options ?? [] }));
    const previous = leadCustomFields;
    setLeadCustomFields(normalized);
    const tokenLocal = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_token') : null;
    if (!tokenLocal) {
      console.warn('[DataContext] updateLeadCustomFields: no auth token found — skipping remote update');
      return;
    }
    (async () => {
      try {
        const { api } = await import('../services/api');
        const saved = await api.saveCustomFields('LEAD', normalized);
        if (Array.isArray(saved)) setLeadCustomFields(saved as any);
      } catch (err: any) {
        console.error('Failed to update lead custom fields remote, reverting:', err);
        setLeadCustomFields(previous);
        alert(`Erro ao atualizar campos customizados: ${err?.response?.data?.message || err?.message || 'Erro desconhecido'}`);
      }
    })();
  };

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
    if (currentTenant) {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(`apollo_${currentTenant.id}`)) {
          sessionStorage.removeItem(key);
        }
      });
    }
    window.location.reload();
  };

  return (
    <DataContext.Provider value={{
      tenants, currentTenant, switchTenant, addTenant, updateTenant, deleteTenant,
      plans, addPlan, updatePlan, deletePlan,
      paymentGateways, createPaymentGateway, updatePaymentGateway, deletePaymentGateway, togglePaymentGatewayStatus, updatePaymentGatewayConfig,
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
