
import React, { useState, useEffect } from 'react';
import { useData } from '../context/dataContext';
import { User, UserRole } from '../types/types';
import { Mail, Phone, Plus, CheckCircle, XCircle, TrendingUp, DollarSign, Target, X, Edit2, Trash2, User as UserIcon, Shield, Briefcase, Search, LayoutGrid, List as ListIcon, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../config/i18n';
import { Can, usePermission } from '../context/auth';

// --- Delete Confirmation Modal ---
interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center relative">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common.delete')}?</h3>
                <p className="text-sm text-gray-500 mb-1">{t('common.confirm_delete')}</p>
                <p className="text-sm font-bold text-gray-800 mb-6">"{userName}"</p>
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

interface TeamMemberFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<User>) => void;
    initialData?: User | null;
}

const TeamMemberFormModal: React.FC<TeamMemberFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { t } = useLanguage();
    const { user } = usePermission();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: UserRole.BROKER,
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
    });

    const [emailValid, setEmailValid] = useState<boolean | null>(null);

    const isEditingSelf = initialData?.id === user?.id;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    email: initialData.email,
                    phone: initialData.phone || '',
                    role: initialData.role,
                    status: initialData.status
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: UserRole.BROKER,
                    status: 'ACTIVE'
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

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

    const getRoleDescription = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return 'Acesso total ao sistema';
            case UserRole.MANAGER: return 'Gerencia equipe e relatórios';
            case UserRole.BROKER: return 'Gerencia leads e imóveis';
            default: return '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                {initialData ? t('team.edit_member') : t('team.invite')}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {initialData ? 'Atualize as informações do membro' : 'Convide um novo membro para sua equipe'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                {t('team.form.name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Maria Silva"
                                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-orange-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                {t('team.form.email')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    placeholder="maria@empresa.com"
                                    className="w-full h-10 px-3 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-orange-500 transition-all"
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
                                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-orange-500 transition-all"
                            />
                        </div>
                        <Can permission="team.edit">
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.role')}</label>
                                    <select
                                        disabled={isEditingSelf}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:border-transparent focus:ring-orange-500 transition-all"
                                    >
                                        <option value={UserRole.BROKER}>{t('team.role.BROKER')}</option>
                                        <option value={UserRole.MANAGER}>{t('team.role.MANAGER')}</option>
                                        <option value={UserRole.ADMIN}>{t('team.role.ADMIN')}</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">{getRoleDescription(formData.role)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        disabled={isEditingSelf}
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:border-transparent focus:ring-orange-500 transition-all"
                                    >
                                        <option value="ACTIVE">{t('team.status.ACTIVE')}</option>
                                        <option value="INACTIVE">{t('team.status.INACTIVE')}</option>
                                    </select>
                                </div>
                            </>
                        </Can>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3 justify-end">
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
                            className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserIcon className="w-4 h-4" />
                            {initialData ? t('common.update') : t('team.invite')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Team = () => {
    const { t } = useLanguage();
    const { team, addTeamMember, updateTeamMember, deleteTeamMember } = useData();
    const { user } = usePermission();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const filteredTeam = team.filter(member => {
        // Non-admins can only see themselves
        if (user?.role !== 'ADMIN' && member.email !== user?.email) {
            return false;
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            if (!member.name.toLowerCase().includes(lowerSearch) && !member.email.toLowerCase().includes(lowerSearch)) {
                return false;
            }
        }
        if (roleFilter !== 'ALL' && member.role !== roleFilter) return false;
        if (statusFilter !== 'ALL' && member.status !== statusFilter) return false;
        return true;
    });

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Shield className="w-3 h-3" />{t('team.role.ADMIN')}</span>;
            case UserRole.MANAGER: return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Briefcase className="w-3 h-3" />{t('team.role.MANAGER')}</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><UserIcon className="w-3 h-3" />{t('team.role.BROKER')}</span>;
        }
    };

    const handleCreateOrUpdate = (data: Partial<User>) => {
        if (editingMember) {
            updateTeamMember({ ...editingMember, ...data } as User);
        } else {
            const newUser: User = {
                id: `usr_${Date.now()}`,
                name: data.name || 'Unknown',
                email: data.email || '',
                phone: data.phone,
                role: data.role || UserRole.BROKER,
                status: data.status || 'ACTIVE',
                avatarUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random`,
                tenantId: user?.tenantId
            };
            addTeamMember(newUser);
        }
        setIsModalOpen(false);
        setEditingMember(null);
    };

    const handleEditClick = (member: User) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const confirmDelete = (member: User) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (memberToDelete) {
            deleteTeamMember(memberToDelete.id);
            setMemberToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingMember(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('team.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('team.subtitle')}</p>
                </div>
                <Can permission="team.invite">
                    <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        {t('team.invite')}
                    </button>
                </Can>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="flex-1 flex gap-4 w-full md:w-auto">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="w-full md:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                        <option value="ALL">Todos os Cargos</option>
                        <option value={UserRole.ADMIN}>{t('team.role.ADMIN')}</option>
                        <option value={UserRole.MANAGER}>{t('team.role.MANAGER')}</option>
                        <option value={UserRole.BROKER}>{t('team.role.BROKER')}</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full md:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                        <option value="ALL">Todos os Status</option>
                        <option value="ACTIVE">{t('team.status.ACTIVE')}</option>
                        <option value="INACTIVE">{t('team.status.INACTIVE')}</option>
                    </select>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}><ListIcon className="w-4 h-4" /></button>
                </div>
            </div>

            {filteredTeam.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredTeam.map(member => {
                                const isCurrentUser = member.id === user?.id;
                                return (
                                    <div key={member.id} className="bg-white border border-gray-200 rounded-xl group shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={member.avatarUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                                        {getRoleBadge(member.role)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Can permission="team.edit">
                                                        <button onClick={() => handleEditClick(member)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-50"><Edit2 className="w-4 h-4" /></button>
                                                    </Can>
                                                    <Can permission="team.delete">
                                                        {!isCurrentUser && <button onClick={() => confirmDelete(member)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50"><Trash2 className="w-4 h-4" /></button>}
                                                    </Can>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {member.email}</p>
                                                {member.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {member.phone}</p>}
                                                <p className="flex items-center gap-2">
                                                    {member.status === 'ACTIVE'
                                                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                                                        : <XCircle className="w-4 h-4 text-red-500" />}
                                                    Status: <span className="font-medium">{t(`team.status.${member.status}`)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {member.performance && (
                                            <div className="grid grid-cols-3 gap-px bg-gray-50 border-t rounded-b-xl mt-auto">
                                                <div className="p-3 text-center">
                                                    <p className="text-xs text-gray-500">{t('team.stats.deals')}</p>
                                                    <p className="font-bold text-gray-800">{member.performance.deals}</p>
                                                </div>
                                                <div className="p-3 text-center">
                                                    <p className="text-xs text-gray-500">{t('team.stats.value')}</p>
                                                    <p className="font-bold text-gray-800">{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(member.performance.value)}</p>
                                                </div>
                                                <div className="p-3 text-center">
                                                    <p className="text-xs text-gray-500">{t('team.stats.conversion')}</p>
                                                    <p className="font-bold text-gray-800">{member.performance.conversionRate}%</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Membro</th>
                                            <th className="px-6 py-4">Contato</th>
                                            <th className="px-6 py-4">Cargo</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTeam.map(member => (
                                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                                                        <span className="font-medium text-gray-800">{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <p>{member.email}</p>
                                                    <p>{member.phone}</p>
                                                </td>
                                                <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {t(`team.status.${member.status}`)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-1">
                                                        <Can permission="team.edit">
                                                            <button onClick={() => handleEditClick(member)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"><Edit2 className="w-4 h-4" /></button>
                                                        </Can>
                                                        <Can permission="team.delete">
                                                            {member.id !== user?.id && <button onClick={() => confirmDelete(member)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4" /></button>}
                                                        </Can>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum membro encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Tente ajustar seus filtros ou convide um novo membro para sua equipe.</p>
                </div>
            )}

            <TeamMemberFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOrUpdate}
                initialData={editingMember}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDelete}
                userName={memberToDelete?.name || ''}
            />
        </div>
    );
};

export default Team;
