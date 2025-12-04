import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserRole, Permission, User, Tenant } from '../types/types';
import { ROLE_PERMISSIONS, MOCK_TEAM, MOCK_TENANTS } from '../utils/constants';

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
    console.log('[Auth] Checking session on load. Token exists:', !!token);

    if (!token) {
      console.log('[Auth] No token found, clearing session');
      sessionStorage.removeItem('apollo_session_user');
      setUser(null);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        console.log('[Auth] Validating token with /users/me...');
        // validate token by fetching /users/me
        const { user: me } = await (await import('../services/api')).api.getMe();
        console.log('[Auth] Token valid, user:', me?.email);
        setUser(me || null);
        if (me) sessionStorage.setItem('apollo_session_user', JSON.stringify(me));
      } catch (err) {
        console.warn('[Auth] Validation failed:', err);
        // Try to recover from sessionStorage before logging out
        const cachedUser = sessionStorage.getItem('apollo_session_user');
        console.log('[Auth] Falling back to cached user:', !!cachedUser);

        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            console.log('[Auth] Restored user from cache:', parsed.email);
            setUser(parsed);
          } catch {
            console.error('[Auth] Cached user data invalid');
            sessionStorage.removeItem('apollo_token');
            sessionStorage.removeItem('apollo_session_user');
            setUser(null);
          }
        } else {
          console.log('[Auth] No cached user to restore');
          sessionStorage.removeItem('apollo_token');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('[Auth] Attempting login for:', email);
      const { api } = await import('../services/api');
      const resp = await api.login(email, password);
      // resp: { token, user }
      if (!resp || !resp.token) {
        console.error('[Auth] Login response missing token:', resp);
        throw new Error('auth.error.invalid');
      }

      console.log('[Auth] Login successful. Saving token:', resp.token.substring(0, 10) + '...');
      sessionStorage.setItem('apollo_token', resp.token);
      sessionStorage.setItem('apollo_session_user', JSON.stringify(resp.user));

      // Verify immediate storage
      const storedToken = sessionStorage.getItem('apollo_token');
      console.log('[Auth] Immediate verification - Token in storage:', !!storedToken);

      if (resp.user && (resp.user as any).tenantId) {
        sessionStorage.setItem('apollo_current_tenant', JSON.stringify((resp.user as any).tenantId));
      }
      setUser(resp.user);
    } catch (err) {
      console.error('[Auth] Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[Auth] Logging out...');
    setUser(null);
    sessionStorage.removeItem('apollo_session_user');
    sessionStorage.removeItem('apollo_token');
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