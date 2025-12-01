import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tenant, SubscriptionPlan, Invoice, GlobalSettings, PaymentGateway, PaymentGatewayId } from '../types';
import { useData } from '../dataContext';
import { useLanguage } from '../i18n';
import { Building2, CreditCard, CheckCircle, XCircle, Plus, ExternalLink, Search, Settings, Save, AlertTriangle, RefreshCw, MoreVertical, DollarSign, Users, BarChart, Trash2, Edit2, Calendar, Check, FileText, Eye, EyeOff } from 'lucide-react';

// --- Modals ---

const PaymentGatewayConfigModal = ({ isOpen, onClose, gateway, onSave }: { isOpen: boolean, onClose: () => void, gateway: PaymentGateway | null, onSave: (id: PaymentGatewayId, config: Record<string, string>) => void }) => {
    const { t } = useLanguage();
    const [config, setConfig] = useState<Record<string, string>>({});
    const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (gateway) {
            setConfig(gateway.config || {});
            setRevealedFields({});
        }
    }, [gateway]);

    if (!isOpen || !gateway) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(gateway.id, config);
        onClose();
    };
    
    const toggleReveal = (key: string) => {
        setRevealedFields(prev => ({...prev, [key]: !prev[key]}));
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('saas.gateways.config_modal_title').replace('{gatewayName}', gateway.name)}</h2>
                    <img src={gateway.logo} alt={gateway.name} className="h-6 object-contain" />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {gateway.configFields.map(field => (
                            <div key={field.key}>
                                <label className="text-sm font-medium text-gray-700">{t(field.label)}</label>
                                <div className="relative mt-1">
                                    <input 
                                        type={revealedFields[field.key] ? 'text' : 'password'}
                                        value={config[field.key] || ''}
                                        onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        className="w-full h-10 px-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                                        required 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleReveal(field.key)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {revealedFields[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{t('saas.gateways.save_config')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SwitchConfirmationModal = ({ isOpen, onClose, onConfirm, tenantName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, tenantName: string }) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { if(isOpen) setIsLoading(false) }, [isOpen]);
    const handleConfirm = () => { setIsLoading(true); onConfirm(); };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('saas.switch.title')}</h3>
                <p className="text-sm text-gray-500 mb-6" dangerouslySetInnerHTML={{ __html: t('saas.switch.desc').replace('{tenantName}', `<strong class="text-gray-700">${tenantName}</strong>`)}} />
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isLoading} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50">
                        {t('common.cancel')}
                    </button>
                    <button onClick={handleConfirm} disabled={isLoading} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-75 flex items-center justify-center gap-2">
                        {isLoading ? 'Acessando...' : t('saas.switch.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteTenantModal = ({ isOpen, onClose, onConfirm, tenantName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, tenantName: string }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('saas.delete.title')}</h3>
                <p className="text-sm text-gray-500 mb-2">{t('saas.delete.desc')}</p>
                <p className="text-sm font-bold text-gray-800 mb-6">"{tenantName}"</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                        {t('common.cancel')}
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm">
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InvoiceListModal = ({ isOpen, onClose, tenant, invoices, onMarkPaid }: { isOpen: boolean, onClose: () => void, tenant: Tenant | null, invoices: Invoice[], onMarkPaid: (id: string) => void }) => {
    const { t } = useLanguage();
    if (!isOpen || !tenant) return null;

    const tenantInvoices = invoices.filter(inv => inv.tenantId === tenant.id).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('saas.invoices.title')}</h2>
                        <p className="text-xs text-gray-500">{tenant.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {tenantInvoices.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>{t('saas.invoices.empty')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tenantInvoices.map(invoice => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${invoice.status === 'PAID' ? 'bg-green-50 text-green-600' : invoice.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{invoice.planName}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(invoice.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(invoice.amount)}</p>
                                        {invoice.status === 'PENDING' ? (
                                            <button 
                                                onClick={() => onMarkPaid(invoice.id)}
                                                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
                                            >
                                                Marcar Pago
                                            </button>
                                        ) : (
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {invoice.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PlanFormModal = ({ isOpen, onClose, onSubmit, initialData }: { isOpen: boolean, onClose: () => void, onSubmit: (data: Partial<SubscriptionPlan>) => void, initialData?: SubscriptionPlan }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', price: 0, billingCycle: 'MENSAL' as 'MENSAL' | 'ANUAL', features: '' });

    useEffect(() => {
        if(isOpen) {
            if(initialData) {
                setFormData({ ...initialData, features: initialData.features.join(', ') });
            } else {
                setFormData({ name: '', price: 0, billingCycle: 'MENSAL', features: '' });
            }
        }
    }, [isOpen, initialData]);

    if(!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, features: formData.features.split(',').map(f => f.trim()) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b"><h2 className="text-xl font-bold">{initialData ? 'Editar Plano' : 'Novo Plano'}</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input type="text" placeholder="Nome do Plano" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 border rounded-lg" required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Preço" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full h-10 px-3 border rounded-lg" required />
                            <select value={formData.billingCycle} onChange={e => setFormData({...formData, billingCycle: e.target.value as any})} className="w-full h-10 px-3 border rounded-lg">
                                <option value="MENSAL">Mensal</option>
                                <option value="ANUAL">Anual</option>
                            </select>
                        </div>
                        <textarea placeholder="Funcionalidades (separadas por vírgula)" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full p-3 border rounded-lg" rows={3}></textarea>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TenantFormModal = ({ isOpen, onClose, onSubmit, plans, paymentGateways, initialData }: { isOpen: boolean, onClose: () => void, onSubmit: (data: Partial<Tenant & { trialDuration: number }>) => void, plans: SubscriptionPlan[], paymentGateways: PaymentGateway[], initialData?: Tenant }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', domain: '', planId: '', themeColor: '#4f46e5', trialDuration: 14, paymentGatewayId: 'stripe' as PaymentGatewayId });
    const availableGateways = paymentGateways.filter(pg => pg.status === 'ACTIVE' || (initialData && initialData.paymentGatewayId === pg.id));
    
    useEffect(() => {
        if(isOpen) {
            if(initialData) {
                setFormData({ name: initialData.name, domain: initialData.domain, planId: initialData.planId, themeColor: initialData.themeColor, trialDuration: 14, paymentGatewayId: initialData.paymentGatewayId });
            } else {
                setFormData({ name: '', domain: '', planId: plans[0]?.id || '', themeColor: '#4f46e5', trialDuration: 14, paymentGatewayId: availableGateways[0]?.id || 'stripe' });
            }
        }
    }, [isOpen, initialData, plans, paymentGateways]);

    if(!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b"><h2 className="text-xl font-bold">{initialData ? t('saas.modal.edit_title') : t('saas.modal.add_title')}</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium">{t('saas.form.name')}</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full h-10 px-3 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t('saas.form.domain')}</label>
                            <div className="relative">
                                <input type="text" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} className="mt-1 w-full h-10 px-3 border rounded-lg" required />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">.apollo.app</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium">{t('saas.form.plan')}</label>
                                <select value={formData.planId} onChange={e => setFormData({...formData, planId: e.target.value})} className="mt-1 w-full h-10 px-3 border rounded-lg" required>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('saas.form.theme')}</label>
                                <input type="color" value={formData.themeColor} onChange={e => setFormData({...formData, themeColor: e.target.value})} className="mt-1 w-full h-10 px-1 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t('saas.form.payment_gateway')}</label>
                            <select value={formData.paymentGatewayId} onChange={e => setFormData({...formData, paymentGatewayId: e.target.value as PaymentGatewayId})} className="mt-1 w-full h-10 px-3 border rounded-lg" required>
                                {availableGateways.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         {!initialData && (
                            <div>
                                <label className="text-sm font-medium">{t('saas.form.trial_duration')}</label>
                                <input type="number" value={formData.trialDuration} onChange={e => setFormData({...formData, trialDuration: Number(e.target.value)})} className="mt-1 w-full h-10 px-3 border rounded-lg" required />
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeletePlanModal = ({ isOpen, onClose, onConfirm, planName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, planName: string }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <h3 className="text-lg font-bold">{t('saas.plans.delete_title')}</h3>
                <p className="text-sm text-gray-500 my-2">{t('saas.plans.delete_desc')} "{planName}"?</p>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2 border rounded-lg">{t('common.cancel')}</button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg">{t('common.delete')}</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const SaaSAdmin = () => {
  const { t } = useLanguage();
  const { 
      tenants, switchTenant, addTenant, updateTenant, deleteTenant, 
      plans, addPlan, updatePlan, deletePlan,
      paymentGateways, togglePaymentGatewayStatus, updatePaymentGatewayConfig,
      allInvoices, markInvoiceAsPaid,
      globalSettings, updateGlobalSettings
  } = useData();
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'settings'>('tenants');
  
  // Tenant state
  const [tenantToSwitch, setTenantToSwitch] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [tenantInvoices, setTenantInvoices] = useState<Tenant | null>(null);
  
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);
  
  // Plan state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | undefined>(undefined);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Global Settings state
  const [localGlobalSettings, setLocalGlobalSettings] = useState(globalSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [configuringGateway, setConfiguringGateway] = useState<PaymentGateway | null>(null);
  
  // Active Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalGlobalSettings(globalSettings);
  }, [globalSettings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && !target.parentElement?.classList.contains('group')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const mrr = useMemo(() => tenants.reduce((acc, t) => {
    if(t.status === 'ACTIVE') {
        const plan = plans.find(p => p.id === t.planId);
        if(plan) return acc + (plan.billingCycle === 'ANUAL' ? plan.price / 12 : plan.price);
    }
    return acc;
  }, 0), [tenants, plans]);

  const activeClients = tenants.filter(t => t.status === 'ACTIVE').length;
  const trialClients = tenants.filter(t => t.status === 'TRIAL').length;

  const handlePlanSubmit = (data: Partial<SubscriptionPlan>) => {
    if(editingPlan) {
        updatePlan({ ...editingPlan, ...data } as SubscriptionPlan);
    } else {
        addPlan(data as any);
    }
    setIsPlanModalOpen(false);
  };
  
  const handleTenantSubmit = (data: Partial<Tenant & { trialDuration: number }>) => {
    if (editingTenant) {
        updateTenant({ ...editingTenant, ...data } as Tenant);
    } else {
        const { trialDuration, ...tenantData } = data;
        addTenant(tenantData as any, trialDuration || 14);
    }
    setIsTenantModalOpen(false);
    setEditingTenant(undefined);
  };

  const handleDeleteTenant = () => {
      if (tenantToDelete) {
          deleteTenant(tenantToDelete.id);
          setTenantToDelete(null);
      }
  };
  
  const handleDeletePlan = () => {
      if (planToDelete) {
          deletePlan(planToDelete.id);
          setPlanToDelete(null);
      }
  }

  const handleSaveGlobalSettings = () => {
      updateGlobalSettings(localGlobalSettings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
  };

  const openPlanModal = (plan?: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  };
  
  const openTenantModal = (tenant?: Tenant) => {
    setEditingTenant(tenant);
    setIsTenantModalOpen(true);
  };

  const toggleDropdown = (tenantId: string) => {
      setActiveDropdown(prev => (prev === tenantId ? null : tenantId));
  };
  
  const handleTenantStatusToggle = (tenant: Tenant) => {
      const newStatus = tenant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateTenant({ ...tenant, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('saas.title')}</h1>
        <p className="text-gray-500 mt-1">{t('saas.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">MRR (Receita Mensal)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(mrr)}</p>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Clientes Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeClients}</p>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Clientes em Trial</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{trialClients}</p>
            </div>
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><BarChart className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('tenants')} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'tenants' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><Building2 className="w-4 h-4" /> Imobiliárias (Tenants)</button>
          <button onClick={() => setActiveTab('plans')} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'plans' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><CreditCard className="w-4 h-4" /> Planos de Assinatura</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><Settings className="w-4 h-4" /> Configurações Globais</button>
      </div>
      
      {activeTab === 'tenants' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b">
                  <h3 className="font-bold">Todos os Clientes</h3>
                  <button onClick={() => openTenantModal()} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> {t('saas.add_tenant')}</button>
              </div>
              <div className="overflow-x-auto" style={{ minHeight: '300px' }}>
                  <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <tr>
                              <th className="px-6 py-3">Nome / Domínio</th>
                              <th className="px-6 py-3">Plano</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Valor Mensal</th>
                              <th className="px-6 py-3">Próximo Vencimento</th>
                              <th className="px-6 py-3 text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {tenants.map(tenant => {
                              const plan = plans.find(p => p.id === tenant.planId);
                              const planValue = plan ? (plan.billingCycle === 'ANUAL' ? plan.price/12 : plan.price) : 0;
                              return (
                                  <tr key={tenant.id}>
                                      <td className="px-6 py-4">
                                          <p className="font-medium text-gray-900">{tenant.name}</p>
                                          <p className="text-gray-500">{tenant.domain}</p>
                                      </td>
                                      <td className="px-6 py-4">{plan?.name || 'N/A'}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : tenant.status === 'TRIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{t(`saas.table.${tenant.status.toLowerCase()}`)}</span>
                                      </td>
                                      <td className="px-6 py-4">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(planValue)}</td>
                                      <td className="px-6 py-4">{tenant.nextBillingDate ? new Date(tenant.nextBillingDate).toLocaleDateString() : (tenant.trialEndsAt ? `Trial acaba em ${new Date(tenant.trialEndsAt).toLocaleDateString()}` : 'N/A')}</td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="relative inline-block text-left" ref={activeDropdown === tenant.id ? dropdownRef : null}>
                                              <button onClick={() => toggleDropdown(tenant.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full group"><MoreVertical className="w-4 h-4" /></button>
                                              {activeDropdown === tenant.id && (
                                                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                      <div className="py-1">
                                                          <button onClick={() => { setTenantToSwitch(tenant); setActiveDropdown(null); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><ExternalLink className="w-4 h-4" /> {t('saas.actions.access')}</button>
                                                          <button onClick={() => { handleTenantStatusToggle(tenant); setActiveDropdown(null); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                              {tenant.status === 'ACTIVE' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                                                              {tenant.status === 'ACTIVE' ? 'Inativar' : 'Ativar'}
                                                          </button>
                                                          <button onClick={() => { setTenantInvoices(tenant); setActiveDropdown(null); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><CreditCard className="w-4 h-4" /> Ver Faturas</button>
                                                          <button onClick={() => { openTenantModal(tenant); setActiveDropdown(null); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Edit2 className="w-4 h-4" /> Editar</button>
                                                          <div className="border-t my-1"></div>
                                                          <button onClick={() => { setTenantToDelete(tenant); setActiveDropdown(null); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Excluir</button>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'plans' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b">
                  <h3 className="font-bold">Planos de Assinatura</h3>
                  <button onClick={() => openPlanModal()} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Novo Plano</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                       <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                           <tr>
                               <th className="px-6 py-3">Nome do Plano</th>
                               <th className="px-6 py-3">Preço</th>
                               <th className="px-6 py-3">Funcionalidades</th>
                               <th className="px-6 py-3 text-right">Ações</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {plans.map(plan => (
                               <tr key={plan.id}>
                                   <td className="px-6 py-4 font-medium text-gray-900">{plan.name}</td>
                                   <td className="px-6 py-4">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(plan.price)} / {plan.billingCycle === 'MENSAL' ? 'mês' : 'ano'}</td>
                                   <td className="px-6 py-4 text-gray-500">{plan.features.join(', ')}</td>
                                   <td className="px-6 py-4 text-right">
                                       <button onClick={() => openPlanModal(plan)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Edit2 className="w-4 h-4" /></button>
                                       <button onClick={() => setPlanToDelete(plan)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                  </table>
              </div>
          </div>
      )}
      
       {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold">Controle de Acesso da Plataforma</h3>
                  <div className="space-y-4 mt-4">
                       <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                            <div>
                                <p className="font-medium text-gray-800">Permitir novos cadastros</p>
                                <p className="text-xs text-gray-500">Se ativo, a página pública de signup estará disponível.</p>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" checked={localGlobalSettings.allowSignups} onChange={e => setLocalGlobalSettings(s => ({...s, allowSignups: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                       </div>
                       <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                            <div>
                                <p className="font-medium text-gray-800">Modo de Manutenção</p>
                                <p className="text-xs text-gray-500">Se ativo, apenas Super Admins podem acessar a plataforma.</p>
                            </div>
                             <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" checked={localGlobalSettings.maintenanceMode} onChange={e => setLocalGlobalSettings(s => ({...s, maintenanceMode: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                       </div>
                  </div>
                   <div className="mt-6 pt-6 border-t flex justify-end">
                       <button onClick={handleSaveGlobalSettings} disabled={settingsSaved} className={`px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ml-auto ${settingsSaved ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                           {settingsSaved ? <><CheckCircle className="w-4 h-4"/> Salvo!</> : <><Save className="w-4 h-4"/> Salvar Configurações</>}
                       </button>
                   </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold">Meios de Pagamento</h3>
                <p className="text-sm text-gray-500 mt-1">Gerencie os gateways de pagamento disponíveis na plataforma.</p>
                <div className="mt-4 space-y-3">
                    {paymentGateways.map(gw => {
                        const isConfigured = gw.config && Object.values(gw.config).every(v => v);
                        return (
                            <div key={gw.id} className={`flex items-center justify-between p-3 bg-gray-50 border rounded-lg transition-opacity ${gw.status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <span title={isConfigured ? t('saas.gateways.configured') : t('saas.gateways.not_configured')} className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <img src={gw.logo} alt={gw.name} className="h-6 object-contain" style={{backgroundColor: gw.themeColor, padding: gw.id === 'asaas' ? '4px' : '0'}}/>
                                    <span className="font-medium text-gray-700">{gw.name}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <button onClick={() => setConfiguringGateway(gw)} className='text-xs font-medium text-indigo-600 hover:text-indigo-800'>{t('saas.gateways.configure')}</button>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" checked={gw.status === 'ACTIVE'} onChange={() => togglePaymentGatewayStatus(gw.id)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                        <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>
          </div>
       )}

      {/* Modals */}
      <SwitchConfirmationModal
        isOpen={!!tenantToSwitch}
        onClose={() => setTenantToSwitch(null)}
        onConfirm={() => {
            if (tenantToSwitch) switchTenant(tenantToSwitch.id);
            setTenantToSwitch(null);
        }}
        tenantName={tenantToSwitch?.name || ''}
      />
      
      <DeleteTenantModal
        isOpen={!!tenantToDelete}
        onClose={() => setTenantToDelete(null)}
        onConfirm={handleDeleteTenant}
        tenantName={tenantToDelete?.name || ''}
      />

      <InvoiceListModal
        isOpen={!!tenantInvoices}
        onClose={() => setTenantInvoices(null)}
        tenant={tenantInvoices}
        invoices={allInvoices}
        onMarkPaid={markInvoiceAsPaid}
      />
      
      <PlanFormModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSubmit={handlePlanSubmit}
        initialData={editingPlan}
      />
      
      <DeletePlanModal
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleDeletePlan}
        planName={planToDelete?.name || ''}
      />
      
      <TenantFormModal 
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        onSubmit={handleTenantSubmit}
        plans={plans}
        paymentGateways={paymentGateways}
        initialData={editingTenant}
      />

      <PaymentGatewayConfigModal
        isOpen={!!configuringGateway}
        onClose={() => setConfiguringGateway(null)}
        gateway={configuringGateway}
        onSave={updatePaymentGatewayConfig}
      />

    </div>
  );
};

export default SaaSAdmin;