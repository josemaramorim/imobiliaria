import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Bell, Edit2, Trash2, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../config/i18n';
import { useData } from '../context/dataContext';
import { usePermission } from '../context/auth';
import { Visit, UserRole } from '../types/types';

interface CalendarViewProps {
    visits: Visit[];
    onAdd: () => void;
    onEdit: (v: Visit) => void;
    onDelete: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ visits, onAdd, onEdit, onDelete }) => {
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

    const getStatusColor = (status: Visit['status']) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200';
            case 'COMPLETED': return 'bg-green-100 text-green-900 border-green-200 hover:bg-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-900 border-red-200 hover:bg-red-200 opacity-75';
            default: return 'bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-200';
        }
    };

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
                    {isAdmin && (
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

                    {!isAdmin && (
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
                                    const statusColor = getStatusColor(event.status);
                                    return (
                                        <div key={event.id} className={`group/event relative text-[10px] p-1.5 rounded border cursor-pointer transition-colors ${statusColor}`}>
                                            <div className="font-bold flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Clock className={`w-3 h-3 ${event.status === 'CANCELLED' ? 'text-red-600' : event.status === 'COMPLETED' ? 'text-green-600' : event.status === 'CONFIRMED' ? 'text-purple-600' : 'text-indigo-600'}`} />
                                                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

export default CalendarView;
