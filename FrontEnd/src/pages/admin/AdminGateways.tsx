import React, { useState } from 'react';
import { PaymentGateway } from '../../types/types';
import { useData } from '../../context/dataContext';
import { useLanguage } from '../../config/i18n';
import { CreditCard, Plus, Settings, Trash2, Power, PowerOff } from 'lucide-react';

const AdminGateways = () => {
    const { t } = useLanguage();
    const { paymentGateways } = useData();

    const activeGateways = paymentGateways.filter(g => g.status === 'ACTIVE');
    const inactiveGateways = paymentGateways.filter(g => g.status === 'INACTIVE');

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gateways de Pagamento</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie os métodos de pagamento disponíveis</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Plus className="w-4 h-4" />
                    Novo Gateway
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total de Gateways</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{paymentGateways.length}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ativos</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{activeGateways.length}</p>
                        </div>
                        <Power className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Inativos</p>
                            <p className="text-2xl font-bold text-gray-600 mt-1">{inactiveGateways.length}</p>
                        </div>
                        <PowerOff className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Gateways List */}
            <div className="space-y-4">
                {/* Active Gateways */}
                {activeGateways.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Gateways Ativos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeGateways.map((gateway) => (
                                <div key={gateway.id} className="bg-white rounded-lg border-2 border-green-200 p-6 hover:shadow-lg transition-shadow">
                                    {/* Gateway Logo & Name */}
                                    <div className="flex items-center justify-between mb-4">
                                        <img src={gateway.logo} alt={gateway.name} className="h-8 object-contain" />
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            ATIVO
                                        </span>
                                    </div>

                                    {/* Gateway Info */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{gateway.name}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: gateway.themeColor }}></div>
                                        <span className="text-sm text-gray-500">{gateway.themeColor}</span>
                                    </div>

                                    {/* Config Fields */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-2">Campos de configuração:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {gateway.configFields.map((field, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {field.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                            <Settings className="w-4 h-4" />
                                            Configurar
                                        </button>
                                        <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                                            <PowerOff className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inactive Gateways */}
                {inactiveGateways.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-8">Gateways Inativos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {inactiveGateways.map((gateway) => (
                                <div key={gateway.id} className="bg-white rounded-lg border border-gray-200 p-6 opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-between mb-4">
                                        <img src={gateway.logo} alt={gateway.name} className="h-8 object-contain grayscale" />
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                            INATIVO
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-4">{gateway.name}</h3>

                                    <div className="flex gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                            <Power className="w-4 h-4" />
                                            Ativar
                                        </button>
                                        <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {paymentGateways.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum gateway configurado</h3>
                    <p className="text-gray-500 mb-6">Configure seu primeiro gateway de pagamento</p>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Adicionar Gateway
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminGateways;
