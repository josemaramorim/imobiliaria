import React, { useState } from 'react';
import CalendarView from '../components/CalendarView';
import VisitFormModal from '../components/VisitFormModal';
import { useData } from '../context/dataContext';
import { useLanguage } from '../config/i18n';
import { usePermission } from '../context/auth';
import { Visit } from '../types/types';

const Agenda = () => {
    const { visits, addVisit, updateVisit, deleteVisit } = useData();
    const { t } = useLanguage();
    const { user } = usePermission();

    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | undefined>(undefined);

    const handleSaveVisit = (data: Partial<Visit>) => {
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
                reminderEnabled: data.reminderEnabled,
                tenantId: user?.tenantId || ''
            };
            addVisit(newVisit as Visit);
        }
        setIsVisitModalOpen(false);
        setEditingVisit(undefined);
    };

    const handleEditVisit = (visit: Visit) => {
        setEditingVisit(visit);
        setIsVisitModalOpen(true);
    };

    const handleDeleteVisit = (id: string) => {
        if (window.confirm(t('visit.delete_confirm'))) {
            deleteVisit(id);
        }
    };

    const openNewVisitModal = () => {
        setEditingVisit(undefined);
        setIsVisitModalOpen(true);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Agenda de Visitas</h1>
                <p className="text-gray-500 mt-1">Visualize e gerencie todas as visitas agendadas</p>
            </div>

            <CalendarView
                visits={visits}
                onAdd={openNewVisitModal}
                onEdit={handleEditVisit}
                onDelete={handleDeleteVisit}
            />

            <VisitFormModal
                isOpen={isVisitModalOpen}
                onClose={() => setIsVisitModalOpen(false)}
                onSubmit={handleSaveVisit}
                initialData={editingVisit}
            />
        </div>
    );
};

export default Agenda;
