import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserRole, Permission, User, Tenant } from './types';
import { ROLE_PERMISSIONS, MOCK_TEAM, MOCK_TENANTS } from './constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_USER: User = {
    id: 'usr_super_admin', name: 'Super Admin', email: 'admin@saas.com', role: UserRole.ADMIN,
    avatarUrl: 'https://ui-avatars.com/api/?name=SA&background=000&color=fff', status: 'ACTIVE', tenantId: 'saas_global',
};

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to recover session from sessionStorage and validate with backend
  // NOTE: only restore session if a token exists — prevents the app from
  // treating a stale `apollo_session_user` without a token as authenticated.
  useEffect(() => {
    const token = sessionStorage.getItem('apollo_token');
    if (!token) {
      // no token => ensure any stale session data is cleared
      sessionStorage.removeItem('apollo_session_user');
      sessionStorage.removeItem('apollo_current_tenant');
      setUser(null);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // validate token by fetching /users/me
        const { user: me } = await (await import('./services/api')).api.getMe();
        setUser(me || null);
        if (me) sessionStorage.setItem('apollo_session_user', JSON.stringify(me));
      } catch (err) {
        // invalid token, clear everything
        sessionStorage.removeItem('apollo_token');
        sessionStorage.removeItem('apollo_session_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { api } = await import('./services/api');
      const resp = await api.login(email, password);
      // resp: { token, user }
      if (!resp || !resp.token) throw new Error('auth.error.invalid');
      sessionStorage.setItem('apollo_token', resp.token);
      sessionStorage.setItem('apollo_session_user', JSON.stringify(resp.user));
      if (resp.user && (resp.user as any).tenantId) {
        sessionStorage.setItem('apollo_current_tenant', JSON.stringify((resp.user as any).tenantId));
      }
        // If the logged user has no tenant (eg. super admin), ensure any previous
        // selected tenant is cleared to avoid being redirected to a tenant view.
        if (!resp.user || !(resp.user as any).tenantId) {
          sessionStorage.removeItem('apollo_current_tenant');
        }
      setUser(resp.user);
      try {
        // notify other parts of the app that login completed
        const detail = { role: resp.user?.role || null, tenantId: (resp.user as any)?.tenantId || null };
        // if super admin, ensure no tenant is selected
        if (detail.role === 'SUPER_ADMIN') {
          sessionStorage.removeItem('apollo_current_tenant');
        }
        const ev = new CustomEvent('apollo:login', { detail });
        window.dispatchEvent(ev);
      } catch (e) { /* ignore */ }
      // After login, navigate to the appropriate area. Use a short delay
      // to allow other listeners (DataProvider) to process the login event.
      try {
        const role = resp.user?.role;
        const tenantId = (resp.user as any)?.tenantId || null;
        // ensure sessionStorage reflects final state before navigation
        if (role === 'SUPER_ADMIN') {
          try { sessionStorage.removeItem('apollo_current_tenant'); } catch (e) {}
        } else if (tenantId) {
          try { sessionStorage.setItem('apollo_current_tenant', JSON.stringify(tenantId)); } catch (e) {}
        }
        setTimeout(() => {
          try {
            if (role === 'SUPER_ADMIN') {
              window.location.href = window.location.href.split('#')[0] + '#/admin/tenants';
            } else if (tenantId) {
              window.location.href = window.location.href.split('#')[0] + '#/';
            } else {
              window.location.href = window.location.href.split('#')[0] + '#/';
            }
          } catch (e) { /* ignore navigation errors */ }
        }, 120);
      } catch (e) { /* ignore */ }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('apollo_session_user');
    sessionStorage.removeItem('apollo_token');
    sessionStorage.removeItem('apollo_current_tenant');
    // additional check / cleanup after logout to avoid stale tenant selection
    try {
      // call global cleaner if available
      const win: any = window as any;
      if (win.clearApolloKeys && typeof win.clearApolloKeys === 'function') win.clearApolloKeys();
      // verify the key is not present
      const tenant = sessionStorage.getItem('apollo_current_tenant');
      const anyApollo = Object.keys(sessionStorage).some(k => k.startsWith('apollo_')) || Object.keys(localStorage).some(k => k.startsWith('apollo_'));
      console.debug('[Auth] post-logout check - apollo_current_tenant:', tenant, 'anyApolloKeysLeft:', anyApollo);
    } catch (e) { /* ignore */ }
    try { window.dispatchEvent(new Event('apollo:logout')); } catch (e) { /* ignore */ }
    window.location.hash = '/login';
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.email === 'admin@saas.com') return true;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  const setRole = (role: UserRole) => {
      if (user) setUser({ ...user, role });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('usePermission must be used within AuthProvider');
  return context;
};

export const Can = ({ permission, children, fallback = null }: { permission: Permission, children?: ReactNode, fallback?: ReactNode }) => {
  const { hasPermission } = usePermission();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};