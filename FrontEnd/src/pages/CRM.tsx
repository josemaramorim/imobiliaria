import React, { useState, useCallback, useEffect } from 'react';
import { KANBAN_COLUMNS } from '../utils/constants';
import { Opportunity, OpportunityStage, UserRole, Visit, Tag, User } from '../types/types';
import { Plus, Calendar, DollarSign, User as UserIcon, X, ChevronDown, ChevronLeft, ChevronRight, Columns, Edit2, Trash2, Clock, MapPin, Check, Bell } from 'lucide-react';
import { useLanguage } from '../config/i18n';
import { useData } from '../context/dataContext';
import { usePermission } from '../context/auth';
import CalendarView from '../components/CalendarView';
import VisitFormModal from '../components/VisitFormModal';

// --- Kanban Components ---

const KanbanCard: React.FC<{
    opportunity: Opportunity;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onEdit: (opportunity: Opportunity) => void;
}> = ({
    opportunity,
    onDragStart,
    onEdit
}) => {
        const { t } = useLanguage();

        return (
            <div
                draggable
                onDragStart={(e) => onDragStart(e, opportunity.id)}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-all active:cursor-grabbing group relative"
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {opportunity.probability}% {t('crm.prob')}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(opportunity); }}
                        className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title={t('common.edit')}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1">{opportunity.leadName}</h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">{opportunity.propertyTitle || t('crm.general_inquiry')}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {opportunity.tags && opportunity.tags.map(tag => (
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
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{t('crm.agent')}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-gray-900">
                        <DollarSign className="w-3 h-3" />
                        {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(opportunity.value)}
                    </div>
                </div>
            </div>
        );
    };

const KanbanColumn: React.FC<{
    id: string;
    title: string;
    color: string;
    opportunities: Opportunity[];
    onDrop: (e: React.DragEvent, stage: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onAddClick: () => void;
    onEdit: (opportunity: Opportunity) => void;
}> = ({
    id,
    title,
    color,
    opportunities,
    onDrop,
    onDragOver,
    onAddClick,
    onEdit
}) => {
        const { t } = useLanguage();
        const totalValue = opportunities.reduce((acc, curr) => acc + curr.value, 0);

        return (
            <div
                className="flex-shrink-0 w-80 flex flex-col h-full max-h-full"
                onDrop={(e) => onDrop(e, id)}
                onDragOver={onDragOver}
            >
                {/* Header */}
                <div className={`p-3 rounded-t-lg bg-gray-50 border-t-4 border-l border-r ${color} flex flex-col gap-1`}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t(`crm.stage.${id}`)}</h3>
                        <span className="text-xs font-medium text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{opportunities.length}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}
                    </p>
                </div>

                {/* Droppable Area */}
                <div className="flex-1 bg-gray-100/50 p-2 border-x border-b border-gray-200 rounded-b-lg overflow-y-auto space-y-2 kanban-scroll min-h-[150px]">
                    {opportunities.map(opp => (
                        <KanbanCard
                            key={opp.id}
                            opportunity={opp}
                            onDragStart={(e, id) => e.dataTransfer.setData('opportunityId', id)}
                            onEdit={onEdit}
                        />
                    ))}

                    {opportunities.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            {t('crm.drop_items')}
                        </div>
                    )}
                </div>

                <button
                    onClick={onAddClick}
                    className="mt-2 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    {t('crm.add_opportunity')}
                </button>
            </div>
        );
    };

// --- Deal Modal Component ---

interface DealFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Opportunity>) => void;
    initialData?: Opportunity;
}

const DealFormModal: React.FC<DealFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useLanguage();
    const { leads, tags, properties } = useData();

    const [formData, setFormData] = useState({
        leadId: '',
        title: '',
        value: 0,
        stage: OpportunityStage.NEW,
        probability: 20,
        propertyId: '',
        tags: [] as Tag[]
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    leadId: initialData.leadId,
                    title: initialData.propertyTitle || '',
                    value: initialData.value,
                    stage: initialData.stage,
                    probability: initialData.probability,
                    propertyId: initialData.propertyId || '',
                    tags: initialData.tags || []
                });
            } else {
                setFormData({
                    leadId: '',
                    title: '',
                    value: 0,
                    stage: OpportunityStage.NEW,
                    probability: 20,
                    propertyId: '',
                    tags: []
                });
            }
        }
    }, [isOpen, initialData]);

    const availableLeads = leads.filter(lead =>
        lead.isActive || (initialData && lead.id === initialData.leadId)
    );

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

        const lead = leads.find(l => l.id === formData.leadId);
        const prop = properties.find(p => p.id === formData.propertyId);

        const submissionData: Partial<Opportunity> = {
            ...formData,
            leadName: lead ? lead.name : 'Desconhecido',
            propertyTitle: formData.title || (prop ? prop.title : '')
        };

        onSubmit(submissionData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{initialData ? t('common.edit') : t('crm.new_deal')}</h2>
                        <p className="text-xs text-gray-500 mt-1">{initialData ? 'Atualize as informa├º├Áes da oportunidade.' : 'Crie uma nova oportunidade no pipeline.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('crm.form.select_lead')}</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    required
                                    value={formData.leadId}
                                    onChange={e => setFormData({ ...formData, leadId: e.target.value })}
                                    className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {availableLeads.map(lead => (
                                        <option key={lead.id} value={lead.id} className={!lead.isActive ? 'text-red-500 bg-gray-50' : ''}>
                                            {lead.name} {(!lead.isActive) ? '(Inativo)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('crm.form.deal_title')}</label>
                            <input
                                type="text"
                                placeholder="Ex: Investimento em Im├│vel na Planta"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('crm.form.select_property')}</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    value={formData.propertyId}
                                    onChange={e => setFormData({ ...formData, propertyId: e.target.value })}
                                    className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
                                >
                                    <option value="">Nenhum im├│vel espec├¡fico</option>
                                    {properties.map(prop => (
                                        <option key={prop.id} value={prop.id}>{prop.title} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('crm.form.value')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                    className="w-full h-10 pl-7 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('crm.form.stage')}</label>
                            <div className="relative">
                                <select
                                    value={formData.stage}
                                    onChange={e => setFormData({ ...formData, stage: e.target.value as OpportunityStage })}
                                    className="w-full h-10 px-3 appearance-none bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {Object.values(OpportunityStage).map(stage => (
                                        <option key={stage as string} value={stage as string}>{t(`crm.stage.${stage}`)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">{t('crm.form.probability')}</label>
                                <span className="text-sm font-bold text-indigo-600">{formData.probability}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={formData.probability}
                                onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Frio (0%)</span>
                                <span>Morno (50%)</span>
                                <span>Quente (100%)</span>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('crm.form.tags')}</label>
                            <div className="flex flex-wrap gap-2">
                                {tags.length === 0 && <p className="text-xs text-gray-400">Nenhuma tag criada.</p>}
                                {tags.map(tag => {
                                    const isSelected = formData.tags?.some(t => t.id === tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected
                                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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

                    <div className="pt-6 flex gap-3 border-t border-gray-100 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="flex-1 py-2.5 bg-indigo-600 rounded-lg font-medium text-white hover:bg-indigo-700 shadow-sm">
                            {initialData ? t('common.update') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};



interface CRMProps {
    defaultView?: 'kanban' | 'calendar';
}

const CRM: React.FC<CRMProps> = ({ defaultView = 'kanban' }) => {
    const {
        opportunities, addOpportunity, updateOpportunity,
        visits, addVisit, updateVisit, deleteVisit
    } = useData();
    const { user } = usePermission();

    const [isDealModalOpen, setIsDealModalOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);

    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | undefined>(undefined);

    const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>(defaultView);
    const { t } = useLanguage();

    useEffect(() => {
        setViewMode(defaultView);
    }, [defaultView]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetStage: string) => {
        e.preventDefault();
        const opportunityId = e.dataTransfer.getData('opportunityId');
        const opp = opportunities.find(o => o.id === opportunityId);
        if (opp && opp.stage !== targetStage) {
            updateOpportunity({ ...opp, stage: targetStage as OpportunityStage });
        }
    }, [opportunities, updateOpportunity]);

    const handleSaveDeal = (data: Partial<Opportunity>) => {
        if (editingOpportunity) {
            updateOpportunity({ ...editingOpportunity, ...data } as Opportunity);
            setEditingOpportunity(undefined);
        } else {
            const newDeal: Partial<Opportunity> = {
                id: `opp_${Date.now()}`,
                leadId: data.leadId,
                leadName: data.leadName,
                propertyTitle: data.propertyTitle,
                value: data.value,
                probability: data.probability,
                stage: data.stage,
                tags: data.tags,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            addOpportunity(newDeal as Opportunity);
        }
    };

    const handleEditOpportunity = (opp: Opportunity) => {
        setEditingOpportunity(opp);
        setIsDealModalOpen(true);
    };

    const openNewDealModal = () => {
        setEditingOpportunity(undefined);
        setIsDealModalOpen(true);
    };

    const handleAddVisit = (data: Partial<Visit>) => {
        if (editingVisit) {
            updateVisit({ ...editingVisit, ...data } as Visit);
        } else {
            const newVisit: Partial<Visit> = {
                id: `vis_${Date.now()}`,
                propertyId: '',
                propertyTitle: data.propertyTitle,
                leadName: data.leadName,
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                brokerId: data.brokerId || user?.id,
                status: 'PENDING',
                notes: data.notes,
                reminderEnabled: data.reminderEnabled
            };
            addVisit(newVisit as Visit);
        }
        setIsVisitModalOpen(false);
        setEditingVisit(undefined);
    };

    const handleEditVisitClick = (v: Visit) => {
        setEditingVisit(v);
        setIsVisitModalOpen(true);
    };

    const handleDeleteVisitClick = (id: string) => {
        if (window.confirm(t('visit.delete_confirm'))) {
            deleteVisit(id);
        }
    };

    const openNewVisitModal = () => {
        setEditingVisit(undefined);
        setIsVisitModalOpen(true);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('crm.title')}</h1>
                    <p className="text-gray-500 text-sm">{t('crm.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setViewMode(viewMode === 'kanban' ? 'calendar' : 'kanban')}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${viewMode === 'calendar'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {viewMode === 'kanban' ? <Calendar className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
                        {viewMode === 'kanban' ? t('crm.calendar') : t('crm.kanban')}
                    </button>

                    {viewMode === 'kanban' && (
                        <button
                            onClick={openNewDealModal}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            {t('crm.new_deal')}
                        </button>
                    )}
                </div>
            </div>

            {viewMode === 'kanban' ? (
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 h-full min-w-max px-1">
                        {KANBAN_COLUMNS.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                color={col.color}
                                opportunities={opportunities.filter(o => o.stage === col.id)}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onAddClick={openNewDealModal}
                                onEdit={handleEditOpportunity}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <CalendarView
                    visits={visits}
                    onAdd={openNewVisitModal}
                    onEdit={handleEditVisitClick}
                    onDelete={handleDeleteVisitClick}
                />
            )}

            <DealFormModal
                isOpen={isDealModalOpen}
                onClose={() => setIsDealModalOpen(false)}
                onSubmit={handleSaveDeal}
                initialData={editingOpportunity}
            />

            <VisitFormModal
                isOpen={isVisitModalOpen}
                onClose={() => setIsVisitModalOpen(false)}
                onSubmit={handleAddVisit}
                initialData={editingVisit}
            />
        </div>
    );
};

export default CRM;
