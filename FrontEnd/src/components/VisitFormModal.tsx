import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Bell, Search, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../config/i18n';
import { useData } from '../context/dataContext';
import { usePermission } from '../context/auth';
import { Visit, UserRole } from '../types/types';

interface VisitFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Visit>) => void;
    initialData?: Visit;
}

const VisitFormModal: React.FC<VisitFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useLanguage();
    const { team, properties, leads } = useData();
    const { user } = usePermission();
    const [formData, setFormData] = useState({
        leadName: '',
        date: '',
        brokerId: user?.id || '',
        propertyTitle: '',
        notes: '',
        reminderEnabled: true,
        propertyId: '',
        status: 'PENDING' as Visit['status']
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [leadSearchTerm, setLeadSearchTerm] = useState('');
    const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
    const [isLeadLocked, setIsLeadLocked] = useState(false);


    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(leadSearchTerm.toLowerCase())
    );

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
                    reminderEnabled: initialData.reminderEnabled !== undefined ? initialData.reminderEnabled : true,
                    status: initialData.status || 'PENDING'
                });

                // Check if the loaded lead name matches an existing lead to lock it
                const leadExists = leads.some(l => l.name === initialData.leadName);
                setIsLeadLocked(leadExists);
            } else {
                setFormData({
                    leadName: '',
                    date: '',
                    brokerId: user?.id || '',
                    propertyTitle: '',
                    notes: '',
                    reminderEnabled: true,
                    propertyId: '',
                    status: 'PENDING'
                });
                setIsLeadLocked(false);
            }
        }
    }, [isOpen, initialData, user, leads]);

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
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.lead')}</label>

                        {/* Searchable Lead Dropdown Trigger */}
                        <div
                            className="relative mb-3"
                            onClick={() => setIsLeadDropdownOpen(!isLeadDropdownOpen)}
                        >
                            <div className={`w-full h-10 px-3 flex items-center justify-between bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 ${isLeadDropdownOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
                                <span className={`block truncate ${!formData.leadName ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {formData.leadName || (t('visit.form.select_lead_placeholder') || 'Selecione um cliente...')}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Overlay to close dropdown */}
                            {isLeadDropdownOpen && (
                                <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setIsLeadDropdownOpen(false); }}></div>
                            )}

                            {/* Dropdown Menu */}
                            {isLeadDropdownOpen && (
                                <div className="absolute z-[70] w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
                                    <div className="p-2 sticky top-0 bg-white border-b border-gray-100" onClick={e => e.stopPropagation()}>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                placeholder="Buscar cliente..."
                                                value={leadSearchTerm}
                                                onChange={(e) => setLeadSearchTerm(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <div
                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${!formData.leadName ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                                            onClick={() => {
                                                setFormData({ ...formData, leadName: '' });
                                                setIsLeadLocked(false);
                                                setIsLeadDropdownOpen(false);
                                            }}
                                        >
                                            <span>Outro (Digitar manualmente)</span>
                                            {!formData.leadName && <Check className="w-4 h-4" />}
                                        </div>

                                        {filteredLeads.map(lead => (
                                            <div
                                                key={lead.id}
                                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${formData.leadName === lead.name ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    setFormData({ ...formData, leadName: lead.name });
                                                    setIsLeadLocked(true);
                                                    setIsLeadDropdownOpen(false);
                                                }}
                                            >
                                                <span className="truncate">{lead.name}</span>
                                                {formData.leadName === lead.name && <Check className="w-4 h-4" />}
                                            </div>
                                        ))}

                                        {filteredLeads.length === 0 && (
                                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                                Nenhum cliente encontrado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Fallback input for manual entry if needed, or if user wants to edit the selected name */}
                        <input
                            type="text"
                            required
                            value={formData.leadName}
                            onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                            disabled={isLeadLocked}
                            className={`w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 ${isLeadDropdownOpen ? 'hidden' : 'block'} ${isLeadLocked ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            placeholder="Nome do cliente"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.property')}</label>

                        {/* Searchable Dropdown Trigger */}
                        <div
                            className="relative mb-3"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className={`w-full h-10 px-3 flex items-center justify-between bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 ${isDropdownOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
                                <span className={`block truncate ${!formData.propertyId ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {formData.propertyId
                                        ? properties.find(p => p.id === formData.propertyId)?.title
                                        : (t('visit.form.select_property_placeholder') || 'Selecione um imóvel...')}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Overlay to close dropdown */}
                            {isDropdownOpen && (
                                <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); }}></div>
                            )}

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute z-[70] w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
                                    <div className="p-2 sticky top-0 bg-white border-b border-gray-100" onClick={e => e.stopPropagation()}>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                placeholder="Buscar imóvel..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <div
                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${!formData.propertyId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                                            onClick={() => {
                                                setFormData({ ...formData, propertyId: '', propertyTitle: '' });
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <span>Outro (Digitar manualmente)</span>
                                            {!formData.propertyId && <Check className="w-4 h-4" />}
                                        </div>

                                        {filteredProperties.map(prop => (
                                            <div
                                                key={prop.id}
                                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${formData.propertyId === prop.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        propertyId: prop.id,
                                                        propertyTitle: prop.title
                                                    });
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <span className="truncate">{prop.title}</span>
                                                {formData.propertyId === prop.id && <Check className="w-4 h-4" />}
                                            </div>
                                        ))}

                                        {filteredProperties.length === 0 && (
                                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                                Nenhum imóvel encontrado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.property_title')}</label>
                        <input
                            type="text"
                            value={formData.propertyTitle}
                            onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                            disabled={!!formData.propertyId}
                            className={`w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 ${!!formData.propertyId ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            placeholder={!!formData.propertyId ? 'Preenchido automaticamente' : 'Digite o local ou nome do imóvel'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.date')}</label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.broker')}</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <select
                            value={formData.brokerId}
                            onChange={(e) => setFormData({ ...formData, brokerId: e.target.value })}
                            disabled={!isAdmin}
                            className={`w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none ${!isAdmin ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                        >
                            {team.filter(member => {
                                if (isAdmin) return true;
                                return member.id === user?.id;
                            }).map(member => (
                                <option key={String(member.id)} value={member.id}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Visit['status'] })}
                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="PENDING">{t('visit.status.pending')}</option>
                        <option value="CONFIRMED">{t('visit.status.confirmed')}</option>
                        <option value="COMPLETED">{t('visit.status.completed')}</option>
                        <option value="CANCELLED">{t('visit.status.cancelled')}</option>
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
                                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
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
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

export default VisitFormModal;
