import React, { useState, useEffect } from 'react';
import { useData } from '../context/dataContext';
import { useLanguage } from '../config/i18n';
import { Lead, Tag, CustomFieldConfig, CustomFieldType, Interaction, InteractionType } from '../types/types';
import { Can, usePermission } from '../context/auth';
import { Search, Plus, Filter, Mail, Phone, Tag as TagIcon, MoreHorizontal, Edit2, Trash2, X, Check, Settings, Palette, User, CheckCircle, XCircle, SlidersHorizontal, ChevronDown, Square, CheckSquare, List, AlertTriangle, Eye, MessageSquare, Calendar, FileText, Clock, Send, Save, RotateCcw } from 'lucide-react';
import VisitFormModal from '../components/VisitFormModal';
import { Visit } from '../types/types';

// --- Shared Components ---

const CustomFieldInput = ({
    config,
    value,
    onChange
}: {
    config: CustomFieldConfig,
    value: any,
    onChange: (val: any) => void
}) => {
    const { t } = useLanguage();

    const renderInput = () => {
        switch (config.type) {
            case 'TEXT':
                return (
                    <input
                        type="text"
                        required={config.required}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 text-sm"
                    />
                );
            case 'NUMBER':
                return (
                    <input
                        type="number"
                        required={config.required}
                        value={value || ''}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 text-sm"
                    />
                );
            case 'SELECT':
                return (
                    <div className="relative">
                        <select
                            required={config.required}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full h-10 px-3 appearance-none bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 text-sm"
                        >
                            <option value="">{t('common.select_option')}</option>
                            {config.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                );
            case 'BOOLEAN':
                return (
                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name={`lead_${config.key}`} // Unique name group
                                checked={value === true}
                                onChange={() => onChange(true)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{t('common.yes')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name={`lead_${config.key}`}
                                checked={value === false}
                                onChange={() => onChange(false)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{t('common.no')}</span>
                        </label>
                    </div>
                );
            case 'MULTI_SELECT':
                const selected = (value as string[]) || [];
                return (
                    <div className="relative">
                        <div className="flex flex-wrap gap-2 p-2 border border-transparent rounded-lg">
                            {config.options?.map(opt => {
                                const isSelected = selected.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) onChange(selected.filter(s => s !== opt));
                                            else onChange([...selected, opt]);
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected
                                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                        {opt}
                                    </button>
                                )
                            })}
                        </div>
                        {/* Hidden input to trigger HTML5 validation for custom multi-select UI */}
                        {config.required && (
                            <input
                                tabIndex={-1}
                                autoComplete="off"
                                style={{ opacity: 0, height: 0, width: '100%', position: 'absolute', bottom: 0 }}
                                value={selected.length > 0 ? "valid" : ""}
                                onChange={() => { }}
                                required
                                onInvalid={(e) => e.currentTarget.setCustomValidity(t('common.required_field_error'))}
                                onInput={(e) => e.currentTarget.setCustomValidity('')}
                            />
                        )}
                    </div>
                )
            default:
                return null;
        }
    };

    return (
        <div>
            {renderInput()}
        </div>
    );
};

// --- Delete Confirmation Modal ---
interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    leadName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, leadName }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center relative">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common.delete')}?</h3>
                <p className="text-sm text-gray-500 mb-1">{t('common.confirm_delete')}</p>
                <p className="text-sm font-bold text-gray-800 mb-6">"{leadName}"</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        {t('common.cancel')}
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm transition-colors">
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Lead Details Sidebar ---
interface LeadDetailsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    onUpdate: (lead: Lead) => void;
}

const InteractionItem: React.FC<{ interaction: Interaction }> = ({ interaction }) => {
    const { t } = useLanguage();

    const getIcon = () => {
        switch (interaction.type) {
            case 'CALL': return <Phone className="w-4 h-4" />;
            case 'EMAIL': return <Mail className="w-4 h-4" />;
            case 'MEETING': return <User className="w-4 h-4" />;
            case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getColor = () => {
        switch (interaction.type) {
            case 'CALL': return 'bg-blue-100 text-blue-600';
            case 'EMAIL': return 'bg-yellow-100 text-yellow-600';
            case 'MEETING': return 'bg-purple-100 text-purple-600';
            case 'WHATSAPP': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="flex gap-4 pb-6 relative last:pb-0">
            <div className="absolute top-0 left-4 bottom-0 w-px bg-gray-200 -z-10"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${getColor()}`}>
                {getIcon()}
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t(`leads.interaction.${interaction.type}`)}</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(interaction.date).toLocaleString()}
                    </div>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{interaction.notes}</p>
            </div>
        </div>
    );
};

const LeadDetailsSidebar: React.FC<LeadDetailsSidebarProps> = ({ isOpen, onClose, lead, onUpdate }) => {
    const { t } = useLanguage();
    const { user } = usePermission();
    const { addVisit } = useData();
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [newInteraction, setNewInteraction] = useState<{ type: InteractionType, notes: string, date: string }>({
        type: 'NOTE',
        notes: '',
        date: new Date().toISOString().slice(0, 16)
    });

    const handleSaveVisit = (visitData: Partial<Visit>) => {
        if (!lead) return;

        const newVisit: Visit = {
            id: `visit_${Date.now()}`,
            leadId: lead.id,
            leadName: lead.name,
            date: visitData.date || new Date().toISOString(),
            brokerId: visitData.brokerId || user?.id || '',
            propertyId: '',
            propertyTitle: visitData.propertyTitle || '',
            notes: visitData.notes || '',
            status: 'SCHEDULED',
            reminderEnabled: visitData.reminderEnabled ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tenantId: lead.tenantId
        };
        addVisit(newVisit);
        setIsVisitModalOpen(false);
    };

    if (!isOpen || !lead) return null;

    const handleAddInteraction = async (e: React.FormEvent) => {
        e.preventDefault();
        const interaction: Interaction = {
            id: `int_${Date.now()}`,
            type: newInteraction.type,
            date: new Date(newInteraction.date).toISOString(),
            notes: newInteraction.notes,
            createdBy: user?.id || 'unknown'
        };

        const updatedLead = {
            ...lead,
            interactions: [interaction, ...(lead.interactions || [])]
        };

        // Optimistic update
        onUpdate(updatedLead);
        setNewInteraction({
            type: 'NOTE',
            notes: '',
            date: new Date().toISOString().slice(0, 16)
        });

        // Persist to backend
        try {
            const { api } = await import('../services/api');
            await api.createInteraction({
                type: newInteraction.type,
                date: new Date(newInteraction.date).toISOString(),
                notes: newInteraction.notes,
                leadId: lead.id,
                createdBy: user?.id || 'unknown'
            });
        } catch (err) {
            console.error('Falha ao salvar interação:', err);
            // Revert optimistic update on error
            onUpdate(lead);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lead.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {lead.isActive ? t('leads.status.active') : t('leads.status.inactive')}
                            </span>
                            <span className="text-xs text-gray-500">• {lead.status}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <label className="block text-xs text-gray-500 font-medium uppercase mb-1">Email</label>
                            <p className="text-sm text-gray-900 break-all flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <label className="block text-xs text-gray-500 font-medium uppercase mb-1">Telefone</label>
                            <p className="text-sm text-gray-900 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                            </p>
                        </div>
                    </div>

                    {/* Tags */}
                    {lead.tags && lead.tags.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <TagIcon className="w-3 h-3" />
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags && lead.tags.length > 0 ? lead.tags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className="text-xs px-2 py-1 rounded-md border font-medium"
                                        style={{
                                            borderColor: `${tag.color}40`,
                                            backgroundColor: `${tag.color}10`,
                                            color: tag.color
                                        }}
                                    >
                                        {tag.label}
                                    </span>
                                )) : null}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-100"></div>

                    {/* Timeline / History */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <List className="w-4 h-4" />
                                {t('leads.history.title')}
                            </h4>
                            <button
                                onClick={() => setIsVisitModalOpen(true)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                {t('crm.new_event')}
                            </button>
                        </div>

                        {/* Add Interaction Form */}
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 mb-6">
                            <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
                                {t('leads.history.add')}
                            </h5>
                            <form onSubmit={handleAddInteraction} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('leads.history.type')}</label>
                                        <div className="relative">
                                            <select
                                                value={newInteraction.type}
                                                onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })}
                                                className="w-full h-8 text-xs px-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 appearance-none"
                                            >
                                                <option value="CALL">{t('leads.interaction.CALL')}</option>
                                                <option value="EMAIL">{t('leads.interaction.EMAIL')}</option>
                                                <option value="MEETING">{t('leads.interaction.MEETING')}</option>
                                                <option value="WHATSAPP">{t('leads.interaction.WHATSAPP')}</option>
                                                <option value="NOTE">{t('leads.interaction.NOTE')}</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('leads.history.date')}</label>
                                        <input
                                            type="datetime-local"
                                            value={newInteraction.date}
                                            onChange={(e) => setNewInteraction({ ...newInteraction, date: e.target.value })}
                                            className="w-full h-8 text-xs px-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('leads.history.notes')}</label>
                                    <textarea
                                        required
                                        value={newInteraction.notes}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, notes: e.target.value })}
                                        className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                                        placeholder="Descreva o que foi conversado..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-3 h-3" />
                                    {t('common.save')}
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="pl-2">
                            {lead.interactions && lead.interactions.length > 0 ? (
                                lead.interactions.map(interaction => (
                                    <InteractionItem key={interaction.id} interaction={interaction} />
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    Nenhuma interação registrada.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <VisitFormModal
                isOpen={isVisitModalOpen}
                onClose={() => setIsVisitModalOpen(false)}
                onSubmit={handleSaveVisit}
                initialData={{
                    leadName: lead.name,
                    date: new Date().toISOString(),
                    brokerId: user?.id || '',
                    propertyTitle: '',
                    notes: '',
                    reminderEnabled: true
                } as any}
            />
        </div>
    );
};

// --- Lead Fields Manager Modal ---
interface LeadFieldsManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    fields: CustomFieldConfig[];
    onUpdate: (fields: CustomFieldConfig[]) => void;
}

const LeadFieldsManagerModal: React.FC<LeadFieldsManagerModalProps> = ({ isOpen, onClose, fields, onUpdate }) => {
    const { t } = useLanguage();
    const [newField, setNewField] = useState<{ label: string, type: CustomFieldType, options: string, required: boolean }>({
        label: '', type: 'TEXT', options: '', required: false
    });
    const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSaveField = () => {
        if (!newField.label) return;

        if (editingFieldKey) {
            const updatedFields = fields.map(f => {
                if (f.key === editingFieldKey) {
                    return {
                        ...f,
                        label: newField.label,
                        type: newField.type,
                        required: newField.required,
                        options: (newField.type === 'SELECT' || newField.type === 'MULTI_SELECT')
                            ? newField.options.split(',').map(s => s.trim())
                            : undefined
                    };
                }
                return f;
            });
            onUpdate(updatedFields);
            setEditingFieldKey(null);
        } else {
            const config: CustomFieldConfig = {
                key: `lead_custom_${Date.now()}`,
                label: newField.label,
                type: newField.type,
                required: newField.required,
                options: (newField.type === 'SELECT' || newField.type === 'MULTI_SELECT')
                    ? newField.options.split(',').map(s => s.trim())
                    : undefined
            };
            onUpdate([...fields, config]);
        }
        setNewField({ label: '', type: 'TEXT', options: '', required: false });
    };

    const handleEditClick = (field: CustomFieldConfig) => {
        setEditingFieldKey(field.key);
        setNewField({
            label: field.label,
            type: field.type,
            required: field.required || false,
            options: field.options ? field.options.join(', ') : ''
        });
    };

    const handleCancelEdit = () => {
        setEditingFieldKey(null);
        setNewField({ label: '', type: 'TEXT', options: '', required: false });
    };

    const handleDeleteField = (key: string) => {
        onUpdate(fields.filter(f => f.key !== key));
        if (editingFieldKey === key) handleCancelEdit();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('properties.fields.modal_title')}</h2>
                        <p className="text-xs text-gray-500 mt-1">{t('properties.fields.modal_subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className={`bg-gray-50 p-4 rounded-lg border ${editingFieldKey ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                {editingFieldKey ? t('properties.fields.edit_mode') : t('properties.fields.add_mode')}
                            </h4>
                            {editingFieldKey && (
                                <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:text-red-700 underline">
                                    {t('properties.fields.cancel_edit')}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('properties.fields.label')}</label>
                                <input
                                    type="text"
                                    value={newField.label}
                                    onChange={e => setNewField({ ...newField, label: e.target.value })}
                                    className="w-full h-9 px-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('properties.fields.type')}</label>
                                <select
                                    value={newField.type}
                                    onChange={e => setNewField({ ...newField, type: e.target.value as CustomFieldType })}
                                    className="w-full h-9 px-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="TEXT">{t('properties.fields.type.TEXT')}</option>
                                    <option value="NUMBER">{t('properties.fields.type.NUMBER')}</option>
                                    <option value="SELECT">{t('properties.fields.type.SELECT')}</option>
                                    <option value="MULTI_SELECT">{t('properties.fields.type.MULTI_SELECT')}</option>
                                    <option value="BOOLEAN">{t('properties.fields.type.BOOLEAN')}</option>
                                </select>
                            </div>
                        </div>

                        {(newField.type === 'SELECT' || newField.type === 'MULTI_SELECT') && (
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('properties.fields.options')}</label>
                                <input
                                    type="text"
                                    value={newField.options}
                                    onChange={e => setNewField({ ...newField, options: e.target.value })}
                                    placeholder="Opção A, Opção B, Opção C"
                                    className="w-full h-9 px-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newField.required}
                                    onChange={e => setNewField({ ...newField, required: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{t('properties.fields.required')}</span>
                            </label>
                        </div>

                        <button
                            onClick={handleSaveField}
                            disabled={!newField.label}
                            className="w-full py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {editingFieldKey ? t('common.update') : t('common.add')}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Campos Existentes
                        </h3>
                        <div className="space-y-2">
                            {fields.map(field => (
                                <div key={field.key} className={`flex justify-between items-center p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow ${editingFieldKey === field.key ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200'}`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 text-sm">{field.label}</p>
                                            {field.required ? (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-200 uppercase">
                                                    {t('properties.fields.required')}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold border border-gray-200 uppercase">
                                                    {t('properties.fields.optional')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">{t(`properties.fields.type.${field.type}`)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleEditClick(field)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteField(field.key)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TagsManagerModal = ({ isOpen, onClose, tags, onAdd, onUpdate, onDelete }: any) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ label: '', color: '#6366f1' });
    const [isCustomColor, setIsCustomColor] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setFormData({ label: '', color: '#6366f1' });
            setEditingId(null);
            setDeleteId(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (formData.label) {
            if (editingId) {
                onUpdate({ id: editingId, ...formData });
                setEditingId(null);
            } else {
                onAdd({ id: `tag_${Date.now()}`, ...formData });
            }
            setFormData({ label: '', color: '#6366f1' });
        }
    };

    const handleEditClick = (tag: Tag) => {
        setEditingId(tag.id);
        setFormData({ label: tag.label, color: tag.color });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ label: '', color: '#6366f1' });
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
            if (editingId === deleteId) {
                handleCancelEdit();
            }
        }
    };

    const colors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
        '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
    ];

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                {deleteId && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Tag?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita e removerá a tag de todos os leads associados.</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm transition-colors"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{t('leads.tags_modal_title')}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className={`space-y-4 p-4 bg-gray-50 rounded-lg border ${editingId ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                {editingId ? 'Editar Tag' : 'Nova Tag'}
                            </span>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3" />
                                    Cancelar
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nome da Tag (Ex: Quente)"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                            <button
                                onClick={handleSave}
                                disabled={!formData.label}
                                className={`px-4 py-2 text-white font-medium rounded-lg disabled:opacity-50 text-sm flex items-center gap-2 transition-colors ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                            >
                                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {editingId ? t('common.update') : t('common.add')}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${formData.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <div className="relative group">
                                <div
                                    className={`w-8 h-8 rounded-lg border cursor-pointer flex items-center justify-center ${isCustomColor ? 'ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-300'}`}
                                    style={{ backgroundColor: formData.color }}
                                >
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => {
                                            setFormData({ ...formData, color: e.target.value });
                                            setIsCustomColor(true);
                                        }}
                                        className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                                    />
                                    <Palette className="w-4 h-4 text-white drop-shadow-md pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {tags.map((tag: Tag) => (
                            <div key={tag.id} className={`flex justify-between items-center p-3 bg-white border rounded-lg hover:shadow-sm transition-all ${editingId === tag.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                    <span className="text-sm font-medium text-gray-700">{tag.label}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEditClick(tag)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                                        title={t('common.edit')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(tag.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {tags.length === 0 && (
                            <p className="text-sm text-gray-400 text-center italic py-4">Nenhuma tag criada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeadFormModal = ({ isOpen, onClose, onSubmit, customFields, tags, initialData }: any) => {
    const { t } = useLanguage();
    const { currentTenant } = useData();
    const [formData, setFormData] = useState<Partial<Lead>>({
        name: '',
        email: '',
        phone: '',
        source: '',
        status: 'Novo',
        isActive: true,
        tags: [],
        customValues: {},
        tenantId: currentTenant?.id || '',
        interactions: []
    });

    const [emailValid, setEmailValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                name: '',
                email: '',
                phone: '',
                source: '',
                status: 'Novo',
                isActive: true,
                tags: [],
                customValues: {},
                tenantId: currentTenant?.id || '',
                interactions: []
            });
        }
    }, [isOpen, initialData, currentTenant?.id]);

    if (!isOpen) return null;

    const toggleTag = (tag: Tag) => {
        const currentTags = formData.tags || [];
        const exists = currentTags.find(t => t.id === tag.id);

        if (exists) {
            setFormData({ ...formData, tags: currentTags.filter(t => t.id !== tag.id) });
        } else {
            setFormData({ ...formData, tags: [...currentTags, tag] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (email: string) => {
        setFormData({ ...formData, email });
        if (email.length > 0) {
            setEmailValid(validateEmail(email));
        } else {
            setEmailValid(null);
        }
    };

    const isFormValid = formData.name && formData.name.trim().length > 0 && (formData.email ? emailValid !== false : true);

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ zIndex: 50 }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                {initialData ? t('common.edit') : t('leads.add')}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {initialData ? 'Atualize os dados do lead' : 'Adicione um novo lead ao funil de vendas'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                {t('properties.form.section_basic')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        {t('leads.table.name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: João Silva"
                                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            placeholder="joao@email.com"
                                            className="w-full h-10 px-3 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 transition-all"
                                        />
                                        {emailValid === true && (
                                            <CheckCircle className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                                        )}
                                        {emailValid === false && (
                                            <XCircle className="absolute right-3 top-2.5 w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    {emailValid === false && (
                                        <p className="text-xs text-red-500 mt-1">Email inválido</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(11) 98765-4321"
                                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('leads.form.source')}</label>
                                    <select
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500"
                                    >
                                        <option value="">{t('common.select_option')}</option>
                                        <option value="Site">Site</option>
                                        <option value="Indicação">Indicação</option>
                                        <option value="Portal ZAP">Portal ZAP</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Google">Google</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('leads.form.status')}</label>
                                    <input
                                        type="text"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('leads.form.is_active')}</label>
                                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200 w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: true })}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${formData.isActive ? 'bg-white text-green-700 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {t('leads.status.active')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: false })}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!formData.isActive ? 'bg-white text-gray-700 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {t('leads.status.inactive')}
                                        </button>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">{t('leads.form.tags')}</label>
                                        {formData.tags && formData.tags.length > 0 && (
                                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                {formData.tags.length} selecionada{formData.tags.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag: Tag) => {
                                            const isSelected = formData.tags?.some(t => t.id === tag.id);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => toggleTag(tag)}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected
                                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 scale-105'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                                    {tag.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                {t('leads.form.section_additional')}
                            </h3>
                            <div className="space-y-4">
                                {customFields.map((field: CustomFieldConfig) => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                        </label>
                                        <CustomFieldInput
                                            config={field}
                                            value={formData.customValues?.[field.key] as any}
                                            onChange={(val) => setFormData(prev => ({
                                                ...prev,
                                                customValues: { ...prev.customValues, [field.key]: val }
                                            }))}
                                        />
                                    </div>
                                ))}
                                {customFields.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">{t('properties.fields.empty')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? t('common.update') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface LeadFilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    customFields: CustomFieldConfig[];
    filters: any;
    setFilters: (filters: any) => void;
}

const LeadFilterSidebar: React.FC<LeadFilterSidebarProps> = ({ isOpen, onClose, customFields, filters, setFilters }) => {
    const { t } = useLanguage();
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, isOpen]);

    if (!isOpen) return null;

    const handleApply = () => {
        setFilters(localFilters);
        onClose();
    };

    const handleClear = () => {
        const cleared = {
            search: '',
            tagId: '',
            status: '',
            source: '',
            activeState: 'ALL',
            custom: {}
        };
        setLocalFilters(cleared);
        setFilters(cleared);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">{t('filters.title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status do Lead</label>
                        <input
                            type="text"
                            value={localFilters.status}
                            onChange={e => setLocalFilters({ ...localFilters, status: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ex: Novo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                        <select
                            value={localFilters.source}
                            onChange={e => setLocalFilters({ ...localFilters, source: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todas</option>
                            <option value="Site">Site</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Portal ZAP">Portal ZAP</option>
                            <option value="Instagram">Instagram</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status da Conta</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLocalFilters({ ...localFilters, activeState: 'ALL' })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded border ${localFilters.activeState === 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setLocalFilters({ ...localFilters, activeState: 'ACTIVE' })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded border ${localFilters.activeState === 'ACTIVE' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                                Ativos
                            </button>
                            <button
                                onClick={() => setLocalFilters({ ...localFilters, activeState: 'INACTIVE' })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded border ${localFilters.activeState === 'INACTIVE' ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                                Inativos
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Filtros Personalizados
                        </h4>
                        <div className="space-y-4">
                            {customFields.map(field => {
                                if (field.type === 'SELECT' || field.type === 'BOOLEAN') {
                                    return (
                                        <div key={field.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                            <CustomFieldInput
                                                config={field}
                                                value={localFilters.custom?.[field.key] as any}
                                                onChange={(val) => setLocalFilters({
                                                    ...localFilters,
                                                    custom: { ...localFilters.custom, [field.key]: val }
                                                })}
                                            />
                                        </div>
                                    )
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                    <button onClick={handleClear} className="flex-1 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        {t('common.clear')}
                    </button>
                    <button onClick={handleApply} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                        {t('common.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Leads = () => {
    const { t } = useLanguage();
    const { leads, addLead, updateLead, deleteLead, tags, addTag, updateTag, deleteTag, leadCustomFields, updateLeadCustomFields } = useData();
    const { hasPermission } = usePermission();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isTagsManagerOpen, setIsTagsManagerOpen] = useState(false);
    const [isFieldsManagerOpen, setIsFieldsManagerOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

    const [filters, setFilters] = useState({
        search: '',
        tagId: '',
        status: '',
        source: '',
        activeState: 'ALL', // 'ALL', 'ACTIVE', 'INACTIVE'
        custom: {} as Record<string, any>
    });

    const handleCreateLead = (data: Partial<Lead>) => {
        if (editingLead) {
            updateLead({ ...editingLead, ...data } as Lead);
        } else {
            const newLead: Partial<Lead> = {
                id: `lead_${Date.now()}`,
                name: data.name,
                email: data.email,
                phone: data.phone,
                source: data.source,
                status: data.status,
                isActive: data.isActive,
                tags: data.tags,
                customValues: data.customValues,
                interactions: [],
                createdAt: new Date().toISOString()
            };
            addLead(newLead as Lead);
        }
        setIsFormOpen(false);
        setEditingLead(undefined);
    };

    const confirmDeleteLead = (lead: Lead) => {
        setLeadToDelete(lead);
        setIsDeleteModalOpen(true);
    };

    const executeDeleteLead = () => {
        if (leadToDelete) {
            deleteLead(leadToDelete.id);
            setLeadToDelete(null);
            setIsDeleteModalOpen(false);
            if (selectedLead?.id === leadToDelete.id) {
                setIsDetailsOpen(false);
                setSelectedLead(null);
            }
        }
    };

    const openEditModal = (lead: Lead) => {
        setEditingLead(lead);
        setIsFormOpen(true);
    };

    const openAddModal = () => {
        setEditingLead(undefined);
        setIsFormOpen(true);
    };

    const handleViewLead = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDetailsOpen(true);
    };

    const handleUpdateLeadFromDetails = (updatedLead: Lead) => {
        updateLead(updatedLead);
        setSelectedLead(updatedLead);
    };

    const filteredLeads = leads.filter(lead => {
        // Search Filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesName = lead.name.toLowerCase().includes(searchLower);
            const matchesEmail = lead.email.toLowerCase().includes(searchLower);
            const matchesPhone = lead.phone.includes(filters.search);
            if (!matchesName && !matchesEmail && !matchesPhone) return false;
        }

        // Tag Filter (Quick Filter)
        if (filters.tagId && !lead.tags.some(t => t.id === filters.tagId)) {
            return false;
        }

        // Advanced Filters
        if (filters.status && !lead.status?.toLowerCase().includes(filters.status.toLowerCase())) return false;
        if (filters.source && lead.source !== filters.source) return false;

        if (filters.activeState === 'ACTIVE' && !lead.isActive) return false;
        if (filters.activeState === 'INACTIVE' && lead.isActive) return false;

        // Custom Fields Filter
        for (const [key, value] of Object.entries(filters.custom)) {
            if (value === undefined || value === '') continue;
            const leadValue = lead.customValues[key];
            if (typeof value === 'boolean') {
                if (leadValue !== value) return false;
            } else if (leadValue !== value) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('leads.title')}</h1>
                        <p className="text-gray-500 mt-1">{t('leads.subtitle')}</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('leads.add')}</span>
                        <span className="sm:hidden">{t('common.add')}</span>
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('leads.search_placeholder')}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
                        <button
                            onClick={() => setFilters({ ...filters, tagId: '' })}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filters.tagId === ''
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-600 border-transparent hover:bg-gray-50'
                                }`}
                        >
                            Todas
                        </button>
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => setFilters({ ...filters, tagId: filters.tagId === tag.id ? '' : tag.id })}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${filters.tagId === tag.id
                                    ? 'bg-white shadow-sm ring-1 ring-indigo-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                style={{
                                    color: filters.tagId === tag.id ? tag.color : undefined,
                                    borderColor: filters.tagId === tag.id ? tag.color : undefined
                                }}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                {tag.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                            title="Filtros Avançados"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>

                        <Can permission="settings.manage">
                            <button
                                onClick={() => setIsTagsManagerOpen(true)}
                                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                                title={t('leads.manage_tags')}
                            >
                                <TagIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsFieldsManagerOpen(true)}
                                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                                title={t('properties.fields.manage')}
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </Can>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">{t('leads.table.name')}</th>
                                <th className="px-6 py-4">{t('leads.table.contact')}</th>
                                <th className="px-6 py-4">{t('leads.table.source')}</th>
                                <th className="px-6 py-4">{t('leads.table.tags')}</th>
                                <th className="px-6 py-4">{t('leads.table.status')}</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLeads.length > 0 ? filteredLeads.map(lead => (
                                <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${!lead.isActive ? 'opacity-60 bg-gray-50/50' : ''} cursor-pointer`} onClick={() => handleViewLead(lead)}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                            {!lead.isActive && <XCircle className="w-4 h-4 text-gray-400" />}
                                            {lead.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{lead.source}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {lead.tags && lead.tags.length > 0 ? lead.tags.map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="text-[10px] px-1.5 py-0.5 rounded border"
                                                    style={{
                                                        borderColor: `${tag.color}40`,
                                                        backgroundColor: `${tag.color}10`,
                                                        color: tag.color
                                                    }}
                                                >
                                                    {tag.label}
                                                </span>
                                            )) : null}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {lead.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditModal(lead); }}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                                                title={t('common.edit')}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); confirmDeleteLead(lead); }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-20 text-gray-500">
                                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <h3 className="font-medium text-gray-800">Nenhum lead encontrado</h3>
                                        <p className="text-sm">Tente ajustar seus filtros de busca ou adicione um novo lead.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <LeadFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateLead}
                customFields={leadCustomFields}
                tags={tags}
                initialData={editingLead}
            />

            <LeadDetailsSidebar
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                lead={selectedLead}
                onUpdate={handleUpdateLeadFromDetails}
            />

            <TagsManagerModal
                isOpen={isTagsManagerOpen}
                onClose={() => setIsTagsManagerOpen(false)}
                tags={tags}
                onAdd={addTag}
                onUpdate={updateTag}
                onDelete={deleteTag}
            />

            <LeadFieldsManagerModal
                isOpen={isFieldsManagerOpen}
                onClose={() => setIsFieldsManagerOpen(false)}
                fields={leadCustomFields}
                onUpdate={updateLeadCustomFields}
            />

            <LeadFilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                customFields={leadCustomFields}
                filters={filters}
                setFilters={setFilters}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setLeadToDelete(null)}
                onConfirm={executeDeleteLead}
                leadName={leadToDelete?.name || ''}
            />
        </div>
    );
};

export default Leads;
