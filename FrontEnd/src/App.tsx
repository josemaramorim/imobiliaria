

import React, { useState, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  Briefcase,
  Globe,
  Shield,
  CalendarDays,
  Contact,
  LayoutGrid,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Package
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import CRM from './pages/CRM';
import Leads from './pages/Leads';
import Agenda from './pages/Agenda';
import Team from './pages/Team';
import AppSettings from './pages/AppSettings';
import SaaSAdmin from './pages/SaaSAdmin';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import MaintenancePage from './pages/Maintenance';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTenants from './pages/admin/AdminTenants';
import AdminPlans from './pages/admin/AdminPlans';
import AdminGateways from './pages/admin/AdminGateways';
import AdminSettings from './pages/admin/AdminSettings';

import { Tenant, UserRole } from './types/types';
import { LanguageProvider, useLanguage } from './config/i18n';
import { AuthProvider, usePermission } from './context/auth';
import { DataProvider, useData } from './context/dataContext';
import { ToastProvider } from './context/toastContext';

// --- Components ---

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
      ? 'bg-primary-50 text-primary-700'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
    <span>{label}</span>
  </Link>
);

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();
  const path = location.pathname;
  const { t } = useLanguage();
  const { hasPermission, setRole, user, logout } = usePermission();
  const { currentTenant, tenants, switchTenant } = useData();
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  // Super Admin pode não ter tenant selecionado — mostrar layout especial
  if (!currentTenant) {
    if (isSuperAdmin) {
      return (
        <div className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="font-semibold text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button className="ml-auto lg:hidden" onClick={onClose}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" active={path === '/admin'} />
              <SidebarItem to="/admin/tenants" icon={Building2} label="Tenants" active={path === '/admin/tenants'} />
              <SidebarItem to="/admin/users" icon={Users} label="Usuários" active={path === '/admin/users'} />
              <SidebarItem to="/admin/plans" icon={Package} label="Planos" active={path === '/admin/plans'} />
              <SidebarItem to="/admin/gateways" icon={CreditCard} label="Gateways" active={path === '/admin/gateways'} />
              <SidebarItem to="/admin/settings" icon={Settings} label="Configurações" active={path === '/admin/settings'} />
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="w-5 h-5 text-gray-400" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Usuários comuns aguardam tenant carregar
    return (
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-center px-6 border-b border-gray-100 flex-shrink-0">
            <p className="text-sm text-gray-500">{t('common.loading') || 'Carregando...'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which tenants to show in the switcher
  const availableTenants = isSuperAdmin
    ? tenants
    : tenants.filter(t => t.id === user?.tenantId);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-800/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: currentTenant.themeColor }}>
                {currentTenant.name.substring(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-gray-900 tracking-tight block leading-tight truncate">{currentTenant.name}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">SaaS Cloud</span>
              </div>
            </div>
            <button className="ml-auto lg:hidden" onClick={onClose}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tenant Switcher */}
          {isSuperAdmin && currentTenant && (
            <div className="p-4 relative flex-shrink-0">
              <button
                onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm transition-all text-left"
                disabled={availableTenants.length <= 1}
              >
                <div className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center font-bold text-xs border border-gray-200">
                  {currentTenant.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tenant</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{currentTenant.name}</p>
                </div>
                {availableTenants.length > 1 && (
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${tenantMenuOpen ? 'rotate-90' : ''}`} />
                )}
              </button>

              {tenantMenuOpen && availableTenants.length > 1 && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1">
                  {availableTenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => { switchTenant(tenant.id); setTenantMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${currentTenant.id === tenant.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tenant.themeColor }}></div>
                      <span className="truncate">{tenant.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Super Admin: label informativa quando está acessando tenant */}
            {user && !user.tenantId && currentTenant && (
              <div className="px-3 py-2 mb-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white" />
                  <p className="text-xs font-bold text-white">Super Admin</p>
                </div>
                <p className="text-xs text-purple-100 mt-1">Acessando como administrador</p>
              </div>
            )}
            
            <SidebarItem to="/" icon={LayoutDashboard} label={t('nav.dashboard')} active={path === '/'} />
            <SidebarItem to="/properties" icon={Building2} label={t('nav.properties')} active={path === '/properties'} />
            <SidebarItem to="/crm" icon={Briefcase} label={t('nav.crm')} active={path === '/crm'} />
            <SidebarItem to="/leads" icon={Contact} label={t('nav.leads')} active={path === '/leads'} />
            <SidebarItem to="/agenda" icon={CalendarDays} label={t('nav.agenda')} active={path === '/agenda'} />
            <SidebarItem to="/team" icon={Users} label={t('nav.team')} active={path === '/team'} />
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            {!isSuperAdmin && (
              <SidebarItem to="/settings" icon={Settings} label={t('nav.settings')} active={path === '/settings'} />
            )}
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="w-5 h-5 text-gray-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = usePermission();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <img src={user?.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
      </div>
    </header>
  );
};

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { globalSettings } = useData();
  const { user, hasPermission } = usePermission();

  if (globalSettings.maintenanceMode && user?.email !== 'admin@saas.com') {
    return <Navigate to="/maintenance" />;
  }

  // Super Admin (sem tenantId) deve ser redirecionado para admin
  // EXCETO se ele selecionou um tenant para acessar
  const isSuperAdmin = user && !user.tenantId;
  const location = window.location.hash.replace('#', '');
  const hasTenantSelected = sessionStorage.getItem('apollo_current_tenant');
  
  const shouldRedirect = isSuperAdmin && !hasTenantSelected && location !== '/admin/tenants' && !location.startsWith('/admin/');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sempre renderizar o Sidebar para permitir logout */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Se Super Admin sem tenant, redirecionar apenas no conteúdo */}
          {shouldRedirect ? (
            <Navigate to="/admin/tenants" />
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<AppSettings />} />
              {/* Admin routes */}
              <Route path="/admin" element={
                hasPermission('saas.manage') ? <AdminDashboard /> : <Navigate to="/" />
              } />
              <Route path="/admin/tenants" element={
                hasPermission('saas.manage') ? <AdminTenants /> : <Navigate to="/" />
              } />
              <Route path="/admin/users" element={
                hasPermission('saas.manage') ? <AdminUsers /> : <Navigate to="/" />
              } />
              <Route path="/admin/plans" element={
                hasPermission('saas.manage') ? <AdminPlans /> : <Navigate to="/" />
              } />
              <Route path="/admin/gateways" element={
                hasPermission('saas.manage') ? <AdminGateways /> : <Navigate to="/" />
              } />
              <Route path="/admin/settings" element={
                hasPermission('saas.manage') ? <AdminSettings /> : <Navigate to="/" />
              } />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
};

// FIX: Changed children prop to be optional to fix "Property 'children' is missing" error.
const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated, isLoading } = usePermission();
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  // If user is not authenticated, render the Login component directly
  // instead of redirecting — this guarantees the login screen appears
  // regardless of router/hash issues.
  return isAuthenticated ? <>{children}</> : <Login />;
};

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <DataProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <ProtectedLayout />
                  </ProtectedRoute>
                } />
              </Routes>
            </ToastProvider>
          </DataProvider>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;