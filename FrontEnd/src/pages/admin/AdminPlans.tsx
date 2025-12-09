import React, { useState } from 'react';
import { SubscriptionPlan } from '../../types/types';
import { useData } from '../../context/dataContext';
import { useLanguage } from '../../config/i18n';
import { Package, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

const AdminPlans = () => {
    const { t } = useLanguage();
    const { plans } = useData();

    const getPlanColor = (index: number) => {
        const colors = ['indigo', 'purple', 'blue', 'green'];
        return colors[index % colors.length];
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Planos de Assinatura</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie os planos disponíveis para os tenants</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Plus className="w-4 h-4" />
                    Novo Plano
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total de Planos</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{plans.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Planos Mensais</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                                {plans.filter(p => p.billingCycle === 'MENSAL').length}
                            </p>
                        </div>
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Planos Anuais</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {plans.filter(p => p.billingCycle === 'ANUAL').length}
                            </p>
                        </div>
                        <Package className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan, index) => {
                    const color = getPlanColor(index);
                    return (
                        <div key={plan.id} className="bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all duration-200 overflow-hidden">
                            {/* Plan Header */}
                            <div className={`bg-${color}-600 text-white p-6`} style={{ backgroundColor: `var(--${color}-600, #4f46e5)` }}>
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">
                                        {new Intl.NumberFormat('pt-BR', { 
                                            style: 'currency', 
                                            currency: 'BRL' 
                                        }).format(plan.price)}
                                    </span>
                                    <span className="text-sm opacity-80">
                                        /{plan.billingCycle === 'MENSAL' ? 'mês' : 'ano'}
                                    </span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-6">
                                <div className="space-y-3 mb-6">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                                        <Edit2 className="w-4 h-4" />
                                        Editar
                                    </button>
                                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {plans.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum plano cadastrado</h3>
                    <p className="text-gray-500 mb-6">Crie seu primeiro plano de assinatura</p>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Criar Plano
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminPlans;
