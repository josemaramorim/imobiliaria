import React, { useState, useEffect, useRef } from 'react';
import { ApiKey, Webhook, UserRole, Invoice, Tenant, PaymentGateway } from '../types/types';
import { Copy, Plus, Trash2, Globe, Shield, Activity, RefreshCw, AlertTriangle, Check, X, Key, CheckSquare, Square, PauseCircle, PlayCircle, BookOpen, Terminal, Code, FileJson, Server, ChevronRight, ChevronDown, Building2, CheckCircle, AlertOctagon, Play, Save, Zap, MoreVertical, Edit2, ArrowRight, Lock, Eye, EyeOff, CreditCard, Calendar, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { useLanguage } from '../config/i18n';
import { usePermission } from '../context/auth';
import { useData } from '../context/dataContext';

// --- Helper Components ---

const CopyButton = ({ text, className = "", iconSize = 4 }: { text: string, className?: string, iconSize?: number }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        } else { // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    };
    return (
        <button onClick={handleCopy} className={`p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors ${className}`}>
            {copied ? <Check className={`w-${iconSize} h-${iconSize} text-green-500`} /> : <Copy className={`w-${iconSize} h-${iconSize}`} />}
        </button>
    );
};

// --- Modals ---
const CheckoutModal = ({ isOpen, onClose, invoice, onConfirm, gateway }: { isOpen: boolean, onClose: () => void, invoice: Invoice | null, onConfirm: (id: string) => void, gateway: PaymentGateway | undefined }) => {
    const { t } = useLanguage();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen || !invoice || !gateway) return null;

    const handlePayment = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        onConfirm(invoice.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{t('checkout.title')}</h2>
                    <img src={gateway.logo} alt={gateway.name} className="h-6" />
                </div>
                <div className="p-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center text-indigo-800">
                            <span className="font-medium">{invoice.planName}</span>
                            <span className="font-bold text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.amount)}</span>
                        </div>
                        <p className="text-xs text-indigo-600 mt-1">
                            {t('checkout.due_date')}: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.card_number')}</label>
                            <input type="text" placeholder="•••• •••• •••• ••••" className="w-full h-10 px-3 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.expiry_date')}</label>
                                <input type="text" placeholder="MM / AA" className="w-full h-10 px-3 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.cvc')}</label>
                                <input type="text" placeholder="CVC" className="w-full h-10 px-3 border rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="mt-8 w-full py-2.5 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        style={{ backgroundColor: gateway.themeColor }}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('checkout.processing')}
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                {t('checkout.pay_now')} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.amount)}
                            </>
                        )}
                    </button>
                    <button onClick={onClose} className="w-full text-center text-xs text-gray-500 mt-3 hover:text-gray-700">
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RevokeConfirmationModal = ({ isOpen, onClose, onConfirm, itemTitle, type = 'key' }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, itemTitle: string, type?: 'key' | 'webhook' }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{type === 'key' ? t('settings.api.revoke') + '?' : 'Excluir Webhook?'}</h3>
                <p className="text-sm text-gray-500 mb-6">Confirma a exclusão de "{itemTitle}"?</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border rounded-lg">{t('common.cancel')}</button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg">{t('common.delete')}</button>
                </div>
            </div>
        </div>
    );
};

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Resetar Banco de Dados?</h3>
                <p className="text-sm text-gray-500 mb-6">Todos os dados (imóveis, leads, etc) serão apagados. Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border rounded-lg">{t('common.cancel')}</button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Confirmar Reset</button>
                </div>
            </div>
        </div>
    );
};

// --- API Keys Tab Components ---

const API_SCOPES = {
    'Imóveis': ['properties:read', 'properties:create', 'properties:update', 'properties:delete'],
    'CRM (Negócios)': ['opportunities:read', 'opportunities:create', 'opportunities:update', 'opportunities:delete'],
    'Leads': ['leads:read', 'leads:create', 'leads:update', 'leads:delete'],
    'Agenda': ['visits:read', 'visits:create', 'visits:update', 'visits:delete'],
    'Equipe': ['team:read', 'team:create', 'team:update', 'team:delete'],
    'Tags': ['tags:read', 'tags:create', 'tags:update', 'tags:delete'],
};

const ApiKeyFormModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void }) => {
    const [name, setName] = useState('');
    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedScopes([]);
        }
    }, [isOpen]);

    const toggleScope = (scope: string) => {
        setSelectedScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, scopes: selectedScopes, status: 'ACTIVE' });
        onClose();
    };

    const isFormValid = name.trim().length > 0 && selectedScopes.length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Gerar Nova Chave de API</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Configure permissões granulares para integração externa</p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                Nome da Chave <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="mt-1.5 w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                required
                                placeholder="Ex: Integração Site, App Mobile"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">Identifique facilmente esta chave para referência futura</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-gray-500" />
                                    Permissões (Scopes) <span className="text-red-500">*</span>
                                </label>
                                {selectedScopes.length > 0 && (
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                        {selectedScopes.length} selecionada{selectedScopes.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {Object.entries(API_SCOPES).map(([category, scopes]) => (
                                    <div key={category} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">{category}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {scopes.map(scope => (
                                                <label
                                                    key={scope}
                                                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-all ${selectedScopes.includes(scope)
                                                        ? 'bg-indigo-50 border border-indigo-200'
                                                        : 'hover:bg-gray-100 border border-transparent'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedScopes.includes(scope)}
                                                        onChange={() => toggleScope(scope)}
                                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <span className={`text-sm ${selectedScopes.includes(scope) ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
                                                        {scope.split(':')[1]}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Gerar Chave
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NewKeyGeneratedModal = ({ isOpen, onClose, apiKey }: { isOpen: boolean, onClose: () => void, apiKey: ApiKey | null }) => {
    if (!isOpen || !apiKey) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0"><CheckCircle className="w-7 h-7" /></div>
                        <div>
                            <h2 className="text-xl font-bold">Chave de API Gerada</h2>
                            <p className="text-sm text-gray-500 mt-1">Esta é a única vez que sua chave secreta será exibida. Guarde-a em um local seguro.</p>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                        <code className="text-green-400 text-sm truncate">{apiKey.token}</code>
                        <CopyButton text={apiKey.token} className="text-gray-300 hover:bg-gray-700" />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Entendi, fechar</button>
                </div>
            </div>
        </div>
    );
};

// --- Webhooks Tab Components ---

const WEBHOOK_EVENTS = [
    'lead.created', 'lead.updated', 'lead.deleted',
    'property.created', 'property.updated', 'property.deleted',
    'opportunity.created', 'opportunity.stage_changed',
];

const WebhookFormModal = ({ isOpen, onClose, onSubmit, initialData }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void, initialData?: Webhook }) => {
    const [formData, setFormData] = useState({ name: '', url: '', events: [] as string[], status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' });
    const [urlValid, setUrlValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { name: '', url: '', events: [], status: 'ACTIVE' });
            setUrlValid(null);
        }
    }, [isOpen, initialData]);

    const toggleEvent = (event: string) => {
        setFormData(prev => ({ ...prev, events: prev.events.includes(event) ? prev.events.filter(e => e !== event) : [...prev.events, event] }));
    };

    const handleUrlChange = (url: string) => {
        setFormData({ ...formData, url });
        try {
            new URL(url);
            setUrlValid(url.length > 0);
        } catch {
            setUrlValid(url.length === 0 ? null : false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const isFormValid = formData.name.trim().length > 0 && formData.url.trim().length > 0 && urlValid === true && formData.events.length > 0;

    // Group events by category
    const eventsByCategory = {
        'Leads': WEBHOOK_EVENTS.filter(e => e.startsWith('lead.')),
        'Imóveis': WEBHOOK_EVENTS.filter(e => e.startsWith('property.')),
        'Negócios': WEBHOOK_EVENTS.filter(e => e.startsWith('opportunity.'))
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Editar Webhook' : 'Adicionar Webhook'}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Receba notificações em tempo real sobre eventos importantes</p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                Nome <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Notificação Slack, Integração CRM"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1.5 w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                URL do Endpoint <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1.5">
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={e => handleUrlChange(e.target.value)}
                                    className={`w-full h-10 px-3 pr-10 border rounded-lg focus:ring-2 transition-all ${urlValid === true ? 'border-green-300 focus:ring-green-500' :
                                            urlValid === false ? 'border-red-300 focus:ring-red-500' :
                                                'border-gray-300 focus:ring-purple-500'
                                        }`}
                                    required
                                />
                                {urlValid !== null && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {urlValid ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertOctagon className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">URL completa onde as notificações serão enviadas</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-gray-500" />
                                    Eventos <span className="text-red-500">*</span>
                                </label>
                                {formData.events.length > 0 && (
                                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                        {formData.events.length} selecionado{formData.events.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {Object.entries(eventsByCategory).map(([category, events]) => (
                                    <div key={category} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">{category}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {events.map(event => (
                                                <label
                                                    key={event}
                                                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-all ${formData.events.includes(event)
                                                            ? 'bg-purple-50 border border-purple-200'
                                                            : 'hover:bg-gray-100 border border-transparent'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.events.includes(event)}
                                                        onChange={() => toggleEvent(event)}
                                                        className="w-4 h-4 text-purple-600 rounded border-gray-300"
                                                    />
                                                    <span className={`text-sm ${formData.events.includes(event) ? 'text-purple-700 font-medium' : 'text-gray-700'}`}>
                                                        {event}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NewWebhookSecretModal = ({ isOpen, onClose, webhook }: { isOpen: boolean, onClose: () => void, webhook: Webhook | null }) => {
    if (!isOpen || !webhook) return null;
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-xl font-bold">Webhook Criado com Sucesso</h2>
                    <p className="text-sm text-gray-500 mt-1">Use este segredo para verificar a autenticidade das chamadas. Guarde-o em um local seguro, pois não será exibido novamente.</p>
                    <div className="mt-4 bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                        <code className="text-green-400 text-sm truncate">{webhook.secret}</code>
                        <CopyButton text={webhook.secret} className="text-gray-300 hover:bg-gray-700" />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Entendi, fechar</button>
                </div>
            </div>
        </div>
    );
};




// --- Developer Docs Modal ---
const ApiDocsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl flex flex-col overflow-hidden relative">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Documentação da API (Swagger UI)
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 bg-gray-100 relative">
                    <iframe
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/docs`}
                        className="w-full h-full border-0"
                        title="API Documentation"
                    />
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AppSettings = () => {
    const { t } = useLanguage();
    const {
        currentTenant, updateTenant,
        apiKeys, addApiKey, revokeApiKey, toggleApiKeyStatus,
        webhooks, addWebhook, updateWebhook, deleteWebhook, triggerWebhookTest,
        resetData, plans, invoices, markInvoiceAsPaid,
        paymentGateways,
    } = useData();

    const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'api' | 'webhooks'>('general');
    const [generalForm, setGeneralForm] = useState({ name: currentTenant.name, domain: currentTenant.domain, themeColor: currentTenant.themeColor });
    const [generalFormSaved, setGeneralFormSaved] = useState(false);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [itemToRevoke, setItemToRevoke] = useState<{ id: string, name: string, type: 'key' | 'webhook' } | null>(null);

    // API Key state
    const [isApiKeyFormOpen, setIsApiKeyFormOpen] = useState(false);
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<ApiKey | null>(null);
    const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

    // Webhook state
    const [isWebhookFormOpen, setIsWebhookFormOpen] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | undefined>(undefined);
    const [newlyGeneratedWebhook, setNewlyGeneratedWebhook] = useState<Webhook | null>(null);

    // Docs state
    const [isDocsOpen, setIsDocsOpen] = useState(false);



    // Checkout State
    const [invoiceToPay, setInvoiceToPay] = useState<Invoice | null>(null);

    const currentPlan = plans.find(p => p.id === currentTenant.planId);
    const currentGateway = paymentGateways.find(g => g.id === currentTenant.paymentGatewayId);

    const daysToRenewal = currentTenant.nextBillingDate ? Math.ceil((new Date(currentTenant.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : (currentTenant.trialEndsAt ? Math.ceil((new Date(currentTenant.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null);

    useEffect(() => {
        setGeneralForm({ name: currentTenant.name, domain: currentTenant.domain, themeColor: currentTenant.themeColor });
    }, [currentTenant]);

    const handleGeneralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTenant({ ...currentTenant, ...generalForm });
        setGeneralFormSaved(true);
        setTimeout(() => setGeneralFormSaved(false), 2000);
    };

    const confirmRevoke = (id: string, name: string, type: 'key' | 'webhook') => {
        setItemToRevoke({ id, name, type });
        setIsRevokeModalOpen(true);
    };

    const executeRevoke = () => {
        if (itemToRevoke) {
            if (itemToRevoke.type === 'key') revokeApiKey(itemToRevoke.id);
            else deleteWebhook(itemToRevoke.id);
        }
        setIsRevokeModalOpen(false);
        setItemToRevoke(null);
    };

    const confirmReset = () => { resetData(); setIsResetModalOpen(false); };

    const handleAddApiKey = (data: any) => {
        const newKey = addApiKey(data);
        setNewlyGeneratedKey(newKey);
    };

    const handleWebhookSubmit = (data: any) => {
        if (editingWebhook) {
            updateWebhook({ ...editingWebhook, ...data });
        } else {
            const newHook = addWebhook(data);
            setNewlyGeneratedWebhook(newHook);
        }
        setIsWebhookFormOpen(false);
        setEditingWebhook(undefined);
    };

    const openWebhookForm = (webhook?: Webhook) => {
        setEditingWebhook(webhook);
        setIsWebhookFormOpen(true);
    };

    const toggleSecret = (id: string) => {
        setRevealedSecrets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
                <p className="text-gray-500 mt-1">{t('settings.subtitle')}</p>
            </div>

            <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><Building2 className="w-4 h-4" />{t('settings.menu.general')}</button>
                <button onClick={() => setActiveTab('billing')} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'billing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><CreditCard className="w-4 h-4" />{t('settings.menu.billing')}</button>
                <button onClick={() => setActiveTab('api')} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'api' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><Key className="w-4 h-4" />{t('settings.menu.api')}</button>
                <button onClick={() => setActiveTab('webhooks')} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'webhooks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}><Zap className="w-4 h-4" />{t('settings.menu.webhooks')}</button>
            </div>

            <div className="max-w-4xl">
                {activeTab === 'general' && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <form onSubmit={handleGeneralSubmit}>
                                <div className="p-6 space-y-4">
                                    <h3 className="text-lg font-bold">Informações da Empresa</h3>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Nome da Imobiliária</label>
                                        <input type="text" value={generalForm.name} onChange={e => setGeneralForm({ ...generalForm, name: e.target.value })} className="mt-1 w-full h-10 px-3 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Subdomínio</label>
                                        <input type="text" value={generalForm.domain} onChange={e => setGeneralForm({ ...generalForm, domain: e.target.value })} className="mt-1 w-full h-10 px-3 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Cor da Marca</label>
                                        <input type="color" value={generalForm.themeColor} onChange={e => setGeneralForm({ ...generalForm, themeColor: e.target.value })} className="mt-1 w-full h-10 px-1 border rounded-lg" />
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 text-right">
                                    <button type="submit" disabled={generalFormSaved} className={`px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ml-auto ${generalFormSaved ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                        {generalFormSaved ? <><CheckCircle className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                            <h3 className="text-lg font-bold text-red-800">Zona de Perigo</h3>
                            <p className="text-sm text-red-700 mt-1">Ações destrutivas que não podem ser desfeitas.</p>
                            <button onClick={() => setIsResetModalOpen(true)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Resetar Banco de Dados</button>
                        </div>
                    </div>
                )}
                {activeTab === 'billing' && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold mb-4">Minha Assinatura</h3>
                            {currentPlan ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                        <p className="text-sm text-indigo-800 font-medium">Plano Atual</p>
                                        <p className="text-2xl font-bold text-indigo-900 mt-1">{currentPlan.name}</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 font-medium">Status da Licença</p>
                                        <p className={`text-2xl font-bold mt-1 ${currentTenant.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{t(`saas.table.${currentTenant.status.toLowerCase()}`)}</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 font-medium">Próxima Renovação</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{daysToRenewal !== null ? `${daysToRenewal} dias` : 'N/A'}</p>
                                    </div>
                                </div>
                            ) : <p>Nenhum plano ativo.</p>}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="p-6 border-b"><h3 className="text-lg font-bold">Histórico de Faturas</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Fatura</th>
                                            <th className="px-6 py-3">Data Venc.</th>
                                            <th className="px-6 py-3">Valor</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id}>
                                                <td className="px-6 py-4 font-medium">{invoice.planName}</td>
                                                <td className="px-6 py-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.amount)}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{invoice.status}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    {invoice.status === 'PENDING' && <button onClick={() => setInvoiceToPay(invoice)} className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg">{t('checkout.pay_now_button')}</button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'api' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold">{t('settings.api.title')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('settings.docs.desc')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsDocsOpen(true)} className="px-3 py-1.5 border rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
                                        <BookOpen className="w-4 h-4" />
                                        {t('settings.docs.link')}
                                    </button>
                                    <button onClick={() => setIsApiKeyFormOpen(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        {t('settings.api.new')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {apiKeys.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                    <Key className="w-8 h-8" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('settings.api.empty_title')}</h3>
                                <p className="mt-1 text-sm text-gray-500">{t('settings.api.empty_desc')}</p>
                                <button onClick={() => setIsApiKeyFormOpen(true)} className="mt-6 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                                    {t('settings.api.generate_first')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {apiKeys.map(key => (
                                    <div key={key.id} className={`bg-white rounded-xl border transition-all ${key.status === 'INACTIVE' ? 'opacity-60 bg-gray-50' : 'shadow-sm'}`}>
                                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${key.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Key className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{key.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${key.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {t(`common.${key.status.toLowerCase()}`)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                                <button onClick={() => toggleApiKeyStatus(key.id)} title={key.status === 'ACTIVE' ? t('settings.api.pause') : t('settings.api.resume')} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    {key.status === 'ACTIVE' ? <PauseCircle className="w-4 h-4 text-gray-500" /> : <PlayCircle className="w-4 h-4 text-green-500" />}
                                                </button>
                                                <button onClick={() => confirmRevoke(key.id, key.name, 'key')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="p-4 border-t bg-gray-50/50">
                                            <div className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                                                <code className="text-gray-400 text-sm font-mono">{revealedSecrets[key.id] ? key.token : key.prefix}</code>
                                                <div className="flex items-center">
                                                    <button onClick={() => toggleSecret(key.id)} className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-md">
                                                        {revealedSecrets[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <CopyButton text={key.token} className="text-gray-400 hover:bg-gray-700" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> <span>{t('settings.api.created_at')} {new Date(key.createdAt).toLocaleDateString()}</span></div>
                                                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> <span>{t('settings.api.last_used')} {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Nunca'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'webhooks' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold">{t('settings.webhooks.title')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('settings.webhooks.desc')}</p>
                                </div>
                                <button onClick={() => openWebhookForm()} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> {t('settings.webhooks.add')}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border">
                            {webhooks.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">{t('settings.webhooks.empty_title')}</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {webhooks.map(hook => (
                                        <div key={hook.id} className={`p-4 flex items-center justify-between ${hook.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
                                            <div>
                                                <p className="font-medium">{hook.name}</p>
                                                <p className="text-xs text-gray-500">{hook.url}</p>
                                                <p className="text-xs text-gray-500">Secret: <code>{revealedSecrets[hook.id] ? hook.secret : `${hook.secret.substring(0, 12)}...`}</code></p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => updateWebhook({ ...hook, status: hook.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    {hook.status === 'ACTIVE' ? <PauseCircle className="w-4 h-4 text-gray-500" /> : <PlayCircle className="w-4 h-4 text-green-500" />}
                                                </button>
                                                <button onClick={() => openWebhookForm(hook)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => triggerWebhookTest(hook.id)} disabled={hook.status === 'INACTIVE'} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"><Play className="w-4 h-4" /></button>
                                                <button onClick={() => toggleSecret(hook.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                    {revealedSecrets[hook.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <CopyButton text={hook.secret} />
                                                <button onClick={() => confirmRevoke(hook.id, hook.name, 'webhook')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            <ResetConfirmationModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={confirmReset} />
            <RevokeConfirmationModal isOpen={isRevokeModalOpen} onClose={() => setIsRevokeModalOpen(false)} onConfirm={executeRevoke} itemTitle={itemToRevoke?.name || ''} type={itemToRevoke?.type} />

            <ApiKeyFormModal isOpen={isApiKeyFormOpen} onClose={() => setIsApiKeyFormOpen(false)} onSubmit={handleAddApiKey} />
            <NewKeyGeneratedModal isOpen={!!newlyGeneratedKey} onClose={() => setNewlyGeneratedKey(null)} apiKey={newlyGeneratedKey} />

            <WebhookFormModal isOpen={isWebhookFormOpen} onClose={() => setIsWebhookFormOpen(false)} onSubmit={handleWebhookSubmit} initialData={editingWebhook} />
            <NewWebhookSecretModal isOpen={!!newlyGeneratedWebhook} onClose={() => setNewlyGeneratedWebhook(null)} webhook={newlyGeneratedWebhook} />

            <ApiDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />



            <CheckoutModal
                isOpen={!!invoiceToPay}
                onClose={() => setInvoiceToPay(null)}
                invoice={invoiceToPay}
                onConfirm={markInvoiceAsPaid}
                gateway={currentGateway}
            />

        </div>
    );
};

export default AppSettings;
