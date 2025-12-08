import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, DollarSign, Home } from 'lucide-react';
import { useLanguage } from '../config/i18n';
import { useData } from '../context/dataContext';
import { OpportunityStage } from '../types/types';

const Dashboard = () => {
  const { t } = useLanguage();
  const { opportunities, leads, properties, currentTenant } = useData();

  // --- Real Time Metrics ---

  // 1. Revenue (Sum of Closed Won deals)
  const totalRevenue = opportunities
    .filter(o => o.stage === OpportunityStage.CLOSED_WON)
    .reduce((acc, curr) => acc + curr.value, 0);

  // 2. Active Opportunities (Not Won/Lost)
  const activeOpportunities = opportunities.filter(
    o => o.stage !== OpportunityStage.CLOSED_WON && o.stage !== OpportunityStage.CLOSED_LOST
  ).length;

  // 3. Total Leads
  const totalLeads = leads.length;

  // 4. Listings
  const totalListings = properties.length;

  // --- Mock Chart Data (Since we don't have historical snapshots in this simple model) ---
  // In a real backend, you would fetch "sales by month". Here we simulate based on current volume.
  const chartData = [
    { name: 'Mon', leads: Math.floor(totalLeads * 0.1), value: totalRevenue * 0.05 },
    { name: 'Tue', leads: Math.floor(totalLeads * 0.15), value: totalRevenue * 0.1 },
    { name: 'Wed', leads: Math.floor(totalLeads * 0.2), value: totalRevenue * 0.15 },
    { name: 'Thu', leads: Math.floor(totalLeads * 0.25), value: totalRevenue * 0.25 },
    { name: 'Fri', leads: Math.floor(totalLeads * 0.18), value: totalRevenue * 0.2 },
    { name: 'Sat', leads: Math.floor(totalLeads * 0.08), value: totalRevenue * 0.15 },
    { name: 'Sun', leads: Math.floor(totalLeads * 0.04), value: totalRevenue * 0.1 },
  ];

  const StatCard = ({ title, value, change, icon: Icon, trend, subtitle }: { title: string, value: string, change: string, icon: any, trend: 'up' | 'down', subtitle: string }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {change}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
    </div>
  );

  const formattedRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue);

  if (!currentTenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{t('common.loading') || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')} - {currentTenant.name}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
            <option>{t('dashboard.week')}</option>
            <option>{t('dashboard.month')}</option>
            <option>{t('dashboard.quarter')}</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.revenue')} value={formattedRevenue} change="+12.5%" icon={DollarSign} trend="up" subtitle={t('dashboard.vs_last_month')} />
        <StatCard title={t('dashboard.opportunities')} value={activeOpportunities.toString()} change="+4.3%" icon={TrendingUp} trend="up" subtitle={t('dashboard.vs_last_month')} />
        <StatCard title={t('dashboard.leads')} value={totalLeads.toString()} change="-2.1%" icon={Users} trend="down" subtitle={t('dashboard.vs_last_month')} />
        <StatCard title={t('dashboard.listings')} value={totalListings.toString()} change="+8.2%" icon={Home} trend="up" subtitle={t('dashboard.vs_last_month')} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Source */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{t('dashboard.trend_pipeline')}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{t('dashboard.activity_leads')}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;