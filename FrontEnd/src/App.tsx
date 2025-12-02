

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
  ChevronRight
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import CRM from './pages/CRM';
import Leads from './pages/Leads';
import Team from './pages/Team';
import AppSettings from './pages/AppSettings';
import SaaSAdmin from './pages/SaaSAdmin';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import MaintenancePage from './pages/Maintenance';

import { Tenant, UserRole } from './types/types';
import { LanguageProvider, useLanguage } from './config/i18n';
import { AuthProvider, usePermission } from './context/auth';
import { DataProvider, useData } from './context/dataContext';

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

  // Determine which tenants to show in the switcher
  const isSuperAdmin = user?.email === 'admin@saas.com';
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
          {isSuperAdmin && (
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
            <SidebarItem to="/" icon={LayoutDashboard} label={t('nav.dashboard')} active={path === '/'} />
            <SidebarItem to="/properties" icon={Building2} label={t('nav.properties')} active={path === '/properties'} />
            <SidebarItem to="/crm" icon={Briefcase} label={t('nav.crm')} active={path === '/crm'} />
            <SidebarItem to="/leads" icon={Contact} label={t('nav.leads')} active={path === '/leads'} />
            <SidebarItem to="/team" icon={Users} label={t('nav.team')} active={path === '/team'} />
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            {hasPermission('saas.manage') && (
              <SidebarItem to="/admin/tenants" icon={Shield} label={t('nav.saas_admin')} active={path === '/admin/tenants'} />
            )}
            <SidebarItem to="/settings" icon={Settings} label={t('nav.settings')} active={path === '/settings'} />
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
  const { user } = usePermission();

  if (globalSettings.maintenanceMode && user?.email !== 'admin@saas.com') {
    return <Navigate to="/maintenance" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/team" element={<Team />} />
            <Route path="/settings" element={<AppSettings />} />
            {/* FIX: Removed duplicate route definition for /admin/tenants */}
            <Route path="/admin/tenants" element={
              usePermission().hasPermission('saas.manage') ? <SaaSAdmin /> : <Navigate to="/" />
            } />
          </Routes>
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
        <DataProvider>
          <HashRouter>
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
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;