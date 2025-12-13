import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserRole, Permission, User, Tenant } from '../types/types';
import { ROLE_PERMISSIONS } from '../utils/constants';

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
  id: 'usr_super_admin', name: 'Super Admin', email: 'admin@saas.com', role: UserRole.SUPER_ADMIN,
  avatarUrl: 'https://ui-avatars.com/api/?name=SA&background=000&color=fff', status: 'ACTIVE', tenantId: 'saas_global',
};

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  // Initialize from sessionStorage if possible
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cachedUser = sessionStorage.getItem('apollo_session_user');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        console.log('🔐 [AuthProvider] Usuário carregado do cache na inicialização:', user.email);
        return user;
      }
    } catch (e) {
      console.warn('🔐 [AuthProvider] Erro ao carregar cache na inicialização:', e);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Try to recover session from sessionStorage and validate with backend
  useEffect(() => {
    const token = sessionStorage.getItem('apollo_token');
    const cachedUser = sessionStorage.getItem('apollo_session_user');
    
    console.log('🔐 [AuthProvider] Token no sessionStorage:', token ? '✓' : '✗');
    console.log('🔐 [AuthProvider] User em cache:', cachedUser ? '✓' : '✗');

    if (!token) {
      // no token => ensure any stale session data is cleared
      sessionStorage.removeItem('apollo_session_user');
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Se temos token e usuário em cache, usar o cache imediatamente
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        console.log('🔐 [AuthProvider] Usando usuário do cache:', user.email);
        setUser(user);
        setIsLoading(false);
        
        // Ainda assim, validar o token silenciosamente em background
        (async () => {
          try {
            const { user: me } = await (await import('../services/api')).api.getMe();
            console.log('🔐 [AuthProvider] Token validado com sucesso');
            if (me) {
              setUser(me);
              sessionStorage.setItem('apollo_session_user', JSON.stringify(me));
            }
          } catch (err) {
            console.warn('🔐 [AuthProvider] Validação de token falhou, mas usando cache', err);
          }
        })();
        return;
      } catch (e) {
        console.warn('🔐 [AuthProvider] Erro ao parsear cache:', e);
      }
    }

    // Caso contrário, validar token
    (async () => {
      try {
        const { user: me } = await (await import('../services/api')).api.getMe();
        console.log('🔐 [AuthProvider] getMe() sucesso:', me?.email);
        setUser(me || null);
        if (me) sessionStorage.setItem('apollo_session_user', JSON.stringify(me));
      } catch (err) {
        console.warn('🔐 [AuthProvider] getMe() erro:', err);
        sessionStorage.removeItem('apollo_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { api } = await import('../services/api');
      const resp = await api.login(email, password);
      // resp: { token, user }
      if (!resp || !resp.token) throw new Error('auth.error.invalid');

      console.log('🔐 [AuthProvider] Login bem-sucedido, salvando token...');
      sessionStorage.setItem('apollo_token', resp.token);
      sessionStorage.setItem('apollo_session_user', JSON.stringify(resp.user));
      console.log('🔐 [AuthProvider] Token salvo:', resp.token.substring(0, 20) + '...');

      // Atualiza o estado do usuário ANTES de redirecionar para evitar race-conditions
      setUser(resp.user);

      if (resp.user && (resp.user as any).tenantId) {
        sessionStorage.setItem('apollo_current_tenant', (resp.user as any).tenantId);
      } else if (resp.user && resp.user.role === UserRole.SUPER_ADMIN) {
        // Super Admin não tem tenant; remover qualquer tenant atual e redirecionar
        sessionStorage.removeItem('apollo_current_tenant');
        // Use setTimeout 0 para garantir que o React aplique o setUser antes do hash change
        setTimeout(() => { window.location.hash = '#/admin/tenants'; }, 0);
      }
    } catch (err) {
      console.error('🔐 [AuthProvider] Erro no login:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('apollo_session_user');
    sessionStorage.removeItem('apollo_token');
    window.location.hash = '/login';
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;
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