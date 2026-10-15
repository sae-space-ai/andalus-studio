/**
 * Contexto de Autenticación Real - ANDALUS STUDIO
 * FASE 04 - Conexión con Backend
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, ApiRequestError } from '../lib/api';

// Planes de demostración (se cargarán del backend en producción)
export const DEMO_PLANS = [
  { id: '1', slug: 'free', name: 'Free', priceMonthly: 0, priceYearly: 0, creditsMonthly: 50, maxUsers: 1, storageBytes: 104857600, features: ['Herramientas básicas', '1 usuario', '100 MB'], isActive: true },
  { id: '2', slug: 'creator', name: 'Creator', priceMonthly: 1900, priceYearly: 19000, creditsMonthly: 500, maxUsers: 1, storageBytes: 5368709120, features: ['Todas las herramientas estándar', '1 usuario', '5 GB', 'Soporte email'], isActive: true },
  { id: '3', slug: 'pro', name: 'Pro', priceMonthly: 4900, priceYearly: 49000, creditsMonthly: 2000, maxUsers: 5, storageBytes: 26843545600, features: ['Todas las herramientas', '5 usuarios', '25 GB', 'Soporte prioritario'], isActive: true },
  { id: '4', slug: 'studio', name: 'Studio', priceMonthly: 14900, priceYearly: 149000, creditsMonthly: 8000, maxUsers: 20, storageBytes: 107374182400, features: ['Todas + prioridad', '20 usuarios', '100 GB', 'Soporte dedicado'], isActive: true },
  { id: '5', slug: 'enterprise', name: 'Enterprise', priceMonthly: -1, priceYearly: -1, creditsMonthly: -1, maxUsers: -1, storageBytes: -1, features: ['Personalizado', 'Ilimitado', 'SLA', 'Contactar'], isActive: true },
];

// Tipo de usuario extendido para compatibilidad
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  displayName?: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Entitlement {
  creditsTotal: number;
  creditsUsed: number;
}

interface Wallet {
  balance: number;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  entitlement: Entitlement | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization] = useState<Organization | null>({
    id: 'demo-org-1',
    name: 'Mi Estudio',
    slug: 'mi-estudio',
  });
  const [entitlement] = useState<Entitlement | null>({
    creditsTotal: 500,
    creditsUsed: 42,
  });
  const [wallet] = useState<Wallet | null>({
    balance: 458,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verificar sesión al montar el componente
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifica si hay una sesión activa
   */
  async function checkAuth() {
    try {
      setIsLoading(true);
      const response = await authApi.me();
      setUser({
        id: response.user.id,
        email: response.user.email,
        emailVerified: response.user.emailVerified,
        name: response.user.displayName,
        avatarUrl: null,
        createdAt: response.user.createdAt,
      });
    } catch (err) {
      // Si no hay sesión, el usuario no está autenticado
      if (err instanceof ApiRequestError && err.status === 401) {
        setUser(null);
      } else {
        console.error('Error verificando autenticación:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Inicio de sesión
   */
  async function login(email: string, password: string): Promise<boolean> {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener token CSRF primero
      await authApi.getCsrfToken();
      
      // Realizar login
      const response = await authApi.login({ email, password });
      setUser({
        id: response.user.id,
        email: response.user.email,
        emailVerified: response.user.emailVerified,
        name: response.user.displayName,
        avatarUrl: null,
        createdAt: response.user.createdAt,
      });
      return true;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Error desconocido al iniciar sesión');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Registro de usuario
   */
  async function register(email: string, password: string, name: string): Promise<boolean> {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener token CSRF primero
      await authApi.getCsrfToken();
      
      // Realizar registro
      await authApi.register({ email, password, displayName: name });
      
      // El usuario debe verificar su email antes de iniciar sesión
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Error desconocido al registrar');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Cerrar sesión
   */
  function logout() {
    authApi.logout().catch(err => {
      console.error('Error al cerrar sesión:', err);
    });
    setUser(null);
  }

  /**
   * Refrescar datos del usuario
   */
  async function refreshUser() {
    try {
      const response = await authApi.me();
      setUser({
        id: response.user.id,
        email: response.user.email,
        emailVerified: response.user.emailVerified,
        name: response.user.displayName,
        avatarUrl: null,
        createdAt: response.user.createdAt,
      });
    } catch (err) {
      console.error('Error al refrescar usuario:', err);
    }
  }

  /**
   * Limpiar error
   */
  function clearError() {
    setError(null);
  }

  const value = {
    user,
    organization,
    entitlement,
    wallet,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
