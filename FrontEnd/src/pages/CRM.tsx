import KanbanColumn from '../components/KanbanColumn';
interface DealFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Opportunity>) => void;
    initialData?: Opportunity;
}
import React, { useState, useCallback, useEffect } from 'react';
import { KANBAN_COLUMNS } from '../utils/constants';
import { Opportunity, OpportunityStage, UserRole, Visit, Tag, User } from '../types/types';
import { Plus, Calendar, DollarSign, User as UserIcon, X, ChevronDown, ChevronLeft, ChevronRight, Columns, Edit2, Trash2, Clock, MapPin, Check, Bell, Tag as TagIcon, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../config/i18n';
import { useData } from '../context/dataContext';
import { usePermission, Can } from '../context/auth';
import { useToast } from '../context/toastContext';
import TagsManagerModal from '../components/TagsManagerModal';

// --- Kanban Components ---



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
            setFormData({...formData, tags: currentTags.filter(t => t.id !== tag.id)});
        } else {
            setFormData({...formData, tags: [...currentTags, tag]});
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
                        <p className="text-xs text-gray-500 mt-1">{initialData ? 'Atualize as informações da oportunidade.' : 'Crie uma nova oportunidade no pipeline.'}</p>
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
                                    onChange={e => setFormData({...formData, leadId: e.target.value})}
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
                                placeholder="Ex: Investimento em Imóvel na Planta"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('crm.form.select_property')}</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select 
                                    value={formData.propertyId}
                                    onChange={e => setFormData({...formData, propertyId: e.target.value})}
                                    className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
                                >
                                    <option value="">Nenhum imóvel específico</option>
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
                                    onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                                    className="w-full h-10 pl-7 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('crm.form.stage')}</label>
                            <div className="relative">
                                <select 
                                    value={formData.stage}
                                    onChange={e => setFormData({...formData, stage: e.target.value as OpportunityStage})}
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
                                onChange={e => setFormData({...formData, probability: Number(e.target.value)})}
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
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                isSelected 
                                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {isSelected && <Check className="w-3 h-3" />}
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: tag.color}}></div>
                                            {tag.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Tags não são obrigatórias */}
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

// --- Visit Modal Component ---

interface VisitFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Visit>) => void;
    initialData?: Visit;
}

const VisitFormModal: React.FC<VisitFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useLanguage();
    const { team } = useData();
    const { user } = usePermission();
    const [formData, setFormData] = useState({
        leadName: '',
        date: '',
        brokerId: user?.id || '',
        propertyTitle: '',
        notes: '',
        reminderEnabled: true
    });

    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    leadName: initialData.leadName,
                    date: initialData.date.slice(0, 16),
                    brokerId: initialData.brokerId,
                    propertyTitle: initialData.propertyTitle,
                    notes: initialData.notes || '',
                    reminderEnabled: initialData.reminderEnabled !== undefined ? initialData.reminderEnabled : true
                });
            } else {
                setFormData({
                    leadName: '',
                    date: '',
                    brokerId: user?.id || '',
                    propertyTitle: '',
                    notes: '',
                    reminderEnabled: true
                });
            }
        }
    }, [isOpen, initialData, user]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{initialData ? t('visit.edit_title') : t('visit.add_title')}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.lead')}</label>
                        <input 
                            type="text" 
                            required
                            value={formData.leadName}
                            onChange={(e) => setFormData({...formData, leadName: e.target.value})}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.property_title')}</label>
                         <input 
                            type="text" 
                            value={formData.propertyTitle}
                            onChange={(e) => setFormData({...formData, propertyTitle: e.target.value})}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.date')}</label>
                        <input 
                            type="datetime-local" 
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.broker')}</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <select 
                                value={formData.brokerId}
                                onChange={(e) => setFormData({...formData, brokerId: e.target.value})}
                                disabled={!isAdmin}
                                className={`w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none ${!isAdmin ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            >
                                {team.map(member => (
                                    <option key={String(member.id)} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reminder Toggle */}
                    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="p-1.5 bg-white border border-gray-200 rounded text-indigo-600">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <label htmlFor="crm-reminder-toggle" className="text-sm font-medium text-gray-900 cursor-pointer select-none">
                                    {t('visit.form.reminder_label')}
                                </label>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input 
                                        type="checkbox" 
                                        name="toggle" 
                                        id="crm-reminder-toggle" 
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-indigo-600"
                                        checked={formData.reminderEnabled}
                                        onChange={(e) => setFormData({...formData, reminderEnabled: e.target.checked})}
                                    />
                                    <label htmlFor="crm-reminder-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${formData.reminderEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></label>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{t('visit.form.reminder_help')}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.notes')}</label>
                        <textarea 
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
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

// --- Calendar Components ---

const CalendarEvent: React.FC<{ visit: Visit; onEdit: (v: Visit) => void; onDelete: (id: string) => void }> = ({ visit, onEdit, onDelete }) => {
    const { t } = useLanguage();
    const { user } = usePermission();
    const { team } = useData();
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

    const broker = team.find(member => member.id === visit.brokerId);

    return (
        <div className="group border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs text-gray-500">{t('visit.at') + ': ' + new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="font-semibold text-gray-900">{visit.leadName}</p>
                    {visit.propertyTitle && <p className="text-sm text-gray-500">{visit.propertyTitle}</p>}
                    {broker && <p className="text-xs text-gray-500">{t('visit.with_agent') + ': ' + broker.name}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(visit)} className="p-1 text-gray-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                        <button onClick={() => onDelete(visit.id)} className="p-1 text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            {visit.notes && <p className="mt-2 text-xs text-gray-500">{visit.notes}</p>}
            {visit.reminderEnabled && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <Bell className="w-3 h-3" />
                    {t('visit.reminder_on')}
                </div>
            )}
        </div>
    );
};

const CalendarDay: React.FC<{ date: Date; visits: Visit[]; onAdd: (day: Date) => void; onEdit: (v: Visit) => void; onDelete: (id: string) => void }> = ({ date, visits, onAdd, onEdit, onDelete }) => {
    const isToday = new Date().toDateString() === date.toDateString();
    const dayVisits = visits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className={`h-40 bg-white border ${isToday ? 'border-indigo-200 ring-1 ring-indigo-100 shadow-sm' : 'border-gray-200'} rounded-lg p-2 flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{date.getDate()}</span>
                <button 
                    onClick={() => onAdd(date)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    title="Adicionar visita"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
                {dayVisits.map(v => (
                    <CalendarEvent key={v.id} visit={v} onEdit={onEdit} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
};

const CalendarView: React.FC<{ visits: Visit[]; onAdd: () => void; onEdit: (v: Visit) => void; onDelete: (id: string) => void }> = ({ visits, onAdd, onEdit, onDelete }) => {
    const { t } = useLanguage();
    const { team } = useData();
    const { user } = usePermission();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterAgentId, setFilterAgentId] = useState<string>('ALL');

    const isBroker = user?.role === UserRole.BROKER;
    const isManager = user?.role === UserRole.MANAGER;
    const isAdmin = user?.role === UserRole.ADMIN;

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const visibleVisits = visits.filter(v => {
        const visitDate = new Date(v.date);
        const isSameMonth = visitDate.getMonth() === currentDate.getMonth() && visitDate.getFullYear() === currentDate.getFullYear();
        if (!isSameMonth) return false;

        if (isAdmin) return true;
        if (isBroker) return v.brokerId === user?.id;
        if (isManager) {
            const owner = team.find(u => u.id === v.brokerId);
            if (!owner) return false;
            if (owner.id === user?.id) return true;
            if (owner.role === UserRole.ADMIN) return false;
            return true;
        }
        return false;
    });

    const displayVisits = visibleVisits.filter(v => {
        if (filterAgentId === 'ALL') return true;
        return v.brokerId === filterAgentId;
    });

    return (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-900 capitalize min-w-[150px]">{monthName}</h2>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {(isAdmin || isManager) && (
                         <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">{t('crm.calendar.filter_agent')}</span>
                            <select 
                                value={filterAgentId} 
                                onChange={(e) => setFilterAgentId(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                            >
                                <option value="ALL">Todos</option>
                                {team.filter(u => {
                                    if (isAdmin) return true;
                                    return u.role !== UserRole.ADMIN || u.id === user?.id; 
                                }).map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                         </div>
                    )}

                    {!isAdmin && !isManager && (
                        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            {t('crm.calendar.my_agenda')}
                        </div>
                    )}

                    <button 
                        onClick={onAdd}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('crm.new_event')}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] h-full overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-gray-400 bg-gray-50 border-b border-r border-gray-100 last:border-r-0">
                        {day}
                    </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-50/30 border-b border-r border-gray-100"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = displayVisits.filter(v => new Date(v.date).getDate() === day);
                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                    return (
                        <div key={day} className={`border-b border-r border-gray-100 p-2 relative group min-h-[100px] overflow-hidden hover:bg-gray-50 transition-colors ${isToday ? 'bg-indigo-50/30' : ''}`}>
                            <span className={`text-sm font-medium ${isToday ? 'text-indigo-600 bg-indigo-100 w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                                {day}
                            </span>
                            
                            <div className="mt-1 space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                                {dayEvents.map(event => {
                                    const canManage = isAdmin || event.brokerId === user?.id;
                                    return (
                                        <div key={event.id} className="group/event relative text-[10px] p-1.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 cursor-pointer hover:bg-indigo-200 transition-colors">
                                            <div className="font-bold flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-indigo-600" />
                                                    {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                                {event.reminderEnabled && <Bell className="w-2.5 h-2.5 text-orange-500" />}
                                            </div>
                                            <div className="truncate font-medium mt-0.5">{event.leadName}</div>
                                            {event.propertyTitle && (
                                                <div className="truncate opacity-75 flex items-center gap-0.5 mt-0.5">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    {event.propertyTitle}
                                                </div>
                                            )}

                                            {canManage && (
                                                <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity bg-indigo-200 rounded p-0.5">
                                                    <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="hover:text-indigo-700 p-0.5">
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); onDelete(event.id); }} className="hover:text-red-600 p-0.5">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface CRMProps {
    defaultView?: 'kanban' | 'calendar';
}

const CRM: React.FC<CRMProps> = ({ defaultView = 'kanban' }) => {
    const [isTagsManagerOpen, setIsTagsManagerOpen] = useState(false);
    const { 
        opportunities, addOpportunity, updateOpportunity, deleteOpportunity,
        visits, addVisit, updateVisit, deleteVisit,
        tags, addTag, updateTag, deleteTag
    } = useData();
  const { user } = usePermission();
  const toast = useToast();
  
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  
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
      try {
          if (editingOpportunity) {
              updateOpportunity({ ...editingOpportunity, ...data } as Opportunity);
              toast.success(t('crm.deal_updated') || 'Oportunidade atualizada com sucesso!');
              setEditingOpportunity(undefined);
          } else {
              const newDeal: Partial<Opportunity> = {
                  id: `opp_${Date.now()}`,
                  leadId: data.leadId,
                  leadName: data.leadName,
                  propertyId: data.propertyId,
                  value: data.value,
                  probability: data.probability,
                  stage: data.stage,
                  tags: data.tags, 
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
              };
              addOpportunity(newDeal as Opportunity);
              toast.success(t('crm.deal_created') || 'Oportunidade criada com sucesso!');
          }
      } catch (error: any) {
          toast.error(error.message || 'Erro ao salvar oportunidade.');
      }
  };

  const handleEditOpportunity = (opp: Opportunity) => {
      setEditingOpportunity(opp);
      setIsDealModalOpen(true);
  };

  const handleDeleteOpportunity = (id: string) => {
      const opp = opportunities.find(o => o.id === id);
      setDeleteTarget({ id, name: opp?.propertyTitle || opp?.leadName || 'Sem título' });
      setIsDeleteModalOpen(true);
  };

  const confirmDeleteOpportunity = () => {
      if (!deleteTarget) return;
      deleteOpportunity(deleteTarget.id);
      toast.success(t('crm.deal_deleted') || 'Oportunidade excluída');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
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
      if(window.confirm(t('visit.delete_confirm'))) {
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
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                viewMode === 'calendar' 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {viewMode === 'kanban' ? <Calendar className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
                        {viewMode === 'kanban' ? t('crm.calendar') : t('crm.kanban')}
                    </button>
                    {viewMode === 'kanban' && (
                        <>
                            <button 
                                onClick={openNewDealModal}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                {t('crm.new_deal')}
                            </button>
                            <Can permission="settings.manage">
                                <button
                                    onClick={() => setIsTagsManagerOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm text-sm font-medium"
                                    title={t('leads.manage_tags') || 'Gerenciar Etiquetas'}
                                >
                                    <TagIcon className="w-4 h-4" />
                                    {t('leads.manage_tags') || 'Etiquetas'}
                                </button>
                            </Can>
                        </>
                    )}
                </div>
                <TagsManagerModal
                    isOpen={isTagsManagerOpen}
                    onClose={() => setIsTagsManagerOpen(false)}
                    tags={tags}
                    onAdd={addTag}
                    onUpdate={updateTag}
                    onDelete={deleteTag}
                />
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
                        onDelete={handleDeleteOpportunity}
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
            {/* Delete confirmation modal for opportunities */}
            {isDeleteModalOpen && deleteTarget && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center relative">
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common.delete')}?</h3>
                        <p className="text-sm text-gray-500 mb-1">{t('common.confirm_delete')}</p>
                        <p className="text-sm font-bold text-gray-800 mb-6">"{deleteTarget.name}"</p>
                        <div className="flex gap-3">
                            <button onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                {t('common.cancel')}
                            </button>
                            <button onClick={confirmDeleteOpportunity} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm transition-colors">
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default CRM;
