import React, { useState, useEffect, useRef } from 'react';
import { Tenant, SubscriptionPlan, Invoice, PaymentGateway, PaymentGatewayId } from '../../types/types';
import { useData } from '../../context/dataContext';
import { useLanguage } from '../../config/i18n';
import { useToast } from '../../context/toastContext';
import { Building2, Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink, FileText, CheckCircle, XCircle, CreditCard, AlertTriangle, RefreshCw, Calendar, Check, Eye, EyeOff } from 'lucide-react';

// Import modals from SaaSAdmin
const SwitchConfirmationModal = ({ isOpen, onClose, onConfirm, tenantName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, tenantName: string }) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { if (isOpen) setIsLoading(false) }, [isOpen]);
    const handleConfirm = () => { setIsLoading(true); onConfirm(); };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('saas.switch.title')}</h3>
                <p className="text-sm text-gray-500 mb-6" dangerouslySetInnerHTML={{ __html: t('saas.switch.desc').replace('{tenantName}', `<strong class="text-gray-700">${tenantName}</strong>`) }} />
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
                                        <p className="font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.amount)}</p>
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

const TenantFormModal = ({ isOpen, onClose, onSubmit, plans, paymentGateways, initialData }: { isOpen: boolean, onClose: () => void, onSubmit: (data: Partial<Tenant & { trialDuration: number }>) => void, plans: SubscriptionPlan[], paymentGateways: PaymentGateway[], initialData?: Tenant }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', domain: '', planId: '', themeColor: '#4f46e5', trialDuration: 14, paymentGatewayId: 'stripe' as PaymentGatewayId });
    const [gatewaySearchTerm, setGatewaySearchTerm] = useState('');
    const [isGatewayDropdownOpen, setIsGatewayDropdownOpen] = useState(false);
    const gatewayDropdownRef = useRef<HTMLDivElement>(null);
    const availableGateways = paymentGateways.filter(pg => pg.status === 'ACTIVE' || (initialData && initialData.paymentGatewayId === pg.id));
    
    const filteredGateways = availableGateways.filter(gw =>
        gw.name.toLowerCase().includes(gatewaySearchTerm.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ name: initialData.name, domain: initialData.domain, planId: initialData.planId, themeColor: initialData.themeColor, trialDuration: 14, paymentGatewayId: initialData.paymentGatewayId });
            } else {
                setFormData({ name: '', domain: '', planId: plans[0]?.id || '', themeColor: '#4f46e5', trialDuration: 14, paymentGatewayId: availableGateways[0]?.id || 'stripe' });
            }
            setGatewaySearchTerm('');
        }
    }, [isOpen, initialData, plans, paymentGateways]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (gatewayDropdownRef.current && !gatewayDropdownRef.current.contains(event.target as Node)) {
                setIsGatewayDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🟢 [TenantFormModal] Form submitted with data:', formData);
        console.log('🟢 [TenantFormModal] initialData:', initialData);
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
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full h-10 px-3 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t('saas.form.domain')}</label>
                            <div className="relative">
                                <input type="text" value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })} className="mt-1 w-full h-10 px-3 border rounded-lg" required />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">.apollo.app</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">{t('saas.form.plan')}</label>
                                <select value={formData.planId} onChange={e => setFormData({ ...formData, planId: e.target.value })} className="mt-1 w-full h-10 px-3 border rounded-lg" required>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('saas.form.theme')}</label>
                                <input type="color" value={formData.themeColor} onChange={e => setFormData({ ...formData, themeColor: e.target.value })} className="mt-1 w-full h-10 px-1 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t('saas.form.payment_gateway')}</label>
                            <div className="relative mt-1" ref={gatewayDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsGatewayDropdownOpen(!isGatewayDropdownOpen)}
                                    className="w-full h-10 px-3 border rounded-lg text-left flex items-center justify-between bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <span className={formData.paymentGatewayId ? 'text-gray-900' : 'text-gray-400'}>
                                        {formData.paymentGatewayId 
                                            ? paymentGateways.find(gw => gw.id === formData.paymentGatewayId)?.name || 'Selecione...'
                                            : 'Selecione um gateway...'}
                                    </span>
                                    <Search className="w-4 h-4 text-gray-400" />
                                </button>
                                
                                {isGatewayDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                        <div className="p-2 border-b border-gray-200">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                    placeholder="Buscar gateway..."
                                                    value={gatewaySearchTerm}
                                                    onChange={(e) => setGatewaySearchTerm(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="py-1 overflow-y-auto max-h-48">
                                            {filteredGateways.length > 0 ? (
                                                filteredGateways.map((gw) => (
                                                    <div
                                                        key={gw.id}
                                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${formData.paymentGatewayId === gw.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                                                        onClick={() => {
                                                            setFormData({ ...formData, paymentGatewayId: gw.id });
                                                            setIsGatewayDropdownOpen(false);
                                                            setGatewaySearchTerm('');
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4" />
                                                            <span>{gw.name}</span>
                                                        </div>
                                                        {formData.paymentGatewayId === gw.id && <Check className="w-4 h-4" />}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                                    {availableGateways.length === 0 
                                                        ? 'Nenhum gateway ativo disponível'
                                                        : 'Nenhum gateway encontrado'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!initialData && (
                            <div>
                                <label className="text-sm font-medium">{t('saas.form.trial_duration')}</label>
                                <input type="number" value={formData.trialDuration} onChange={e => setFormData({ ...formData, trialDuration: Number(e.target.value) })} className="mt-1 w-full h-10 px-3 border rounded-lg" required />
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

const AdminTenants = () => {
    const { t } = useLanguage();
    const { tenants, plans, paymentGateways, switchTenant, addTenant, updateTenant, deleteTenant, allInvoices, markInvoiceAsPaid } = useData();
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Modal states
    const [tenantToSwitch, setTenantToSwitch] = useState<Tenant | null>(null);
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
    const [tenantInvoices, setTenantInvoices] = useState<Tenant | null>(null);
    const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);
    
    // Dropdown state
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tenant.domain.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-700',
            TRIAL: 'bg-blue-100 text-blue-700',
            INACTIVE: 'bg-gray-100 text-gray-700',
            PAST_DUE: 'bg-red-100 text-red-700'
        };
        return styles[status as keyof typeof styles] || styles.INACTIVE;
    };

    const getPlanName = (planId: string) => {
        return plans.find(p => p.id === planId)?.name || 'N/A';
    };

    const toggleDropdown = (tenantId: string) => {
        setActiveDropdown(prev => (prev === tenantId ? null : tenantId));
    };

    const handleTenantStatusToggle = async (tenant: Tenant) => {
        try {
            const newStatus = tenant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateTenant({ ...tenant, status: newStatus });
            toast.success(`Tenant ${newStatus === 'ACTIVE' ? 'ativado' : 'inativado'} com sucesso!`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao alterar status do tenant.');
        }
    };

    const openTenantModal = (tenant?: Tenant) => {
        setEditingTenant(tenant);
        setIsTenantModalOpen(true);
    };

    const handleTenantSubmit = async (data: Partial<Tenant & { trialDuration: number }>) => {
        console.log('🔵 [AdminTenants] handleTenantSubmit called');
        console.log('🔵 [AdminTenants] editingTenant:', editingTenant);
        console.log('🔵 [AdminTenants] data received:', data);
        
        try {
            if (editingTenant) {
                const updatedTenant = { ...editingTenant, ...data } as Tenant;
                console.log('🔵 [AdminTenants] Calling updateTenant with:', updatedTenant);
                await updateTenant(updatedTenant);
                toast.success('Tenant atualizado com sucesso!');
            } else {
                const { trialDuration, ...tenantData } = data;
                console.log('🔵 [AdminTenants] Calling addTenant with:', tenantData, trialDuration);
                await addTenant(tenantData as any, trialDuration || 14);
                toast.success('Tenant criado com sucesso!');
            }
            setIsTenantModalOpen(false);
            setEditingTenant(undefined);
        } catch (error: any) {
            console.error('❌ [AdminTenants] Error submitting tenant:', error);
            toast.error(error.response?.data?.message || error.message || 'Erro ao salvar tenant. Tente novamente.');
        }
    };

    const handleDeleteTenant = async () => {
        if (tenantToDelete) {
            try {
                deleteTenant(tenantToDelete.id);
                toast.success('Tenant excluído com sucesso!');
                setTenantToDelete(null);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Erro ao excluir tenant.');
            }
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie todos os inquilinos da plataforma</p>
                </div>
                <button 
                    onClick={() => openTenantModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" />
                    Novo Tenant
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Tenants</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{tenants.length}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ativos</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {tenants.filter(t => t.status === 'ACTIVE').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Em Trial</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                                {tenants.filter(t => t.status === 'TRIAL').length}
                            </p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Inativos</p>
                            <p className="text-2xl font-bold text-gray-600 mt-1">
                                {tenants.filter(t => t.status === 'INACTIVE' || t.status === 'PAST_DUE').length}
                            </p>
                        </div>
                        <XCircle className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou domínio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="ACTIVE">Ativos</option>
                        <option value="TRIAL">Trial</option>
                        <option value="INACTIVE">Inativos</option>
                        <option value="PAST_DUE">Vencido</option>
                    </select>
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tenant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Domínio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plano
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Criado em
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" 
                                                 style={{ backgroundColor: tenant.themeColor }}>
                                                {tenant.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-900">{tenant.domain}</span>
                                            <a href={`https://${tenant.domain}.apollo.app`} target="_blank" rel="noopener noreferrer"
                                               className="text-indigo-600 hover:text-indigo-800">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{getPlanName(tenant.planId)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="relative inline-block text-left" ref={activeDropdown === tenant.id ? dropdownRef : null}>
                                            <button 
                                                onClick={() => toggleDropdown(tenant.id)} 
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full group"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            {activeDropdown === tenant.id && (
                                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                    <div className="py-1">
                                                        <button 
                                                            onClick={() => { setTenantToSwitch(tenant); setActiveDropdown(null); }} 
                                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <ExternalLink className="w-4 h-4" /> {t('saas.actions.access')}
                                                        </button>
                                                        <button 
                                                            onClick={() => { handleTenantStatusToggle(tenant); setActiveDropdown(null); }} 
                                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            {tenant.status === 'ACTIVE' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                                                            {tenant.status === 'ACTIVE' ? 'Inativar' : 'Ativar'}
                                                        </button>
                                                        <button 
                                                            onClick={() => { setTenantInvoices(tenant); setActiveDropdown(null); }} 
                                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <CreditCard className="w-4 h-4" /> Ver Faturas
                                                        </button>
                                                        <button 
                                                            onClick={() => { openTenantModal(tenant); setActiveDropdown(null); }} 
                                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Edit2 className="w-4 h-4" /> Editar
                                                        </button>
                                                        <div className="border-t my-1"></div>
                                                        <button 
                                                            onClick={() => { setTenantToDelete(tenant); setActiveDropdown(null); }} 
                                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Excluir
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredTenants.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Nenhum tenant encontrado</p>
                    </div>
                )}
            </div>

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

            <TenantFormModal
                isOpen={isTenantModalOpen}
                onClose={() => setIsTenantModalOpen(false)}
                onSubmit={handleTenantSubmit}
                plans={plans}
                paymentGateways={paymentGateways}
                initialData={editingTenant}
            />
        </div>
    );
};

export default AdminTenants;
