import React from 'react';
import { useLanguage } from '../../config/i18n';
import { useData } from '../../context/dataContext';
import { TrendingUp, Users, Building2, DollarSign, Activity, AlertTriangle } from 'lucide-react';

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-sm">
        <TrendingUp className="w-4 h-4 text-green-500" />
        <span className="text-green-600 font-medium">{trend}</span>
        <span className="text-gray-500">vs mês anterior</span>
      </div>
    )}
  </div>
);

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { tenants, allInvoices } = useData();

  // Calcular métricas
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const trialTenants = tenants.filter(t => t.status === 'TRIAL').length;
  const totalRevenue = allInvoices
    .filter(inv => inv.status === 'PAID')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const pendingInvoices = allInvoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard - Super Admin</h1>
        <p className="text-gray-500 text-sm">Visão geral da plataforma</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Tenants"
          value={tenants.length}
          subtitle={`${activeTenants} ativos, ${trialTenants} em trial`}
          icon={Building2}
          color="bg-indigo-600"
        />
        <MetricCard
          title="Tenants Ativos"
          value={activeTenants}
          icon={Activity}
          trend="+12%"
          color="bg-green-600"
        />
        <MetricCard
          title="Receita Mensal"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          trend="+8%"
          color="bg-emerald-600"
        />
        <MetricCard
          title="Faturas Pendentes"
          value={pendingInvoices}
          subtitle="Requer atenção"
          icon={AlertTriangle}
          color="bg-orange-600"
        />
      </div>

      {/* Resumo de status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Status dos Tenants</h3>
          <div className="space-y-3">
            {[
              { status: 'ACTIVE', label: 'Ativos', count: activeTenants, color: 'bg-green-500' },
              { status: 'TRIAL', label: 'Em Trial', count: trialTenants, color: 'bg-blue-500' },
              { status: 'INACTIVE', label: 'Inativos', count: tenants.filter(t => t.status === 'INACTIVE').length, color: 'bg-gray-400' },
              { status: 'PAST_DUE', label: 'Inadimplentes', count: tenants.filter(t => t.status === 'PAST_DUE').length, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Últimas Atividades</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Novo tenant criado</p>
                <p className="text-xs text-gray-500">Há 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Pagamento recebido</p>
                <p className="text-xs text-gray-500">Há 3 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Trial expirando em breve</p>
                <p className="text-xs text-gray-500">Há 5 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
