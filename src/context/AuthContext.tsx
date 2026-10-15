import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Organization, Entitlement, Wallet, Plan } from '../types';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  entitlement: Entitlement | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Simulated data for demo
const DEMO_PLANS: Plan[] = [
  { id: '1', slug: 'free', name: 'Free', priceMonthly: 0, priceYearly: 0, creditsMonthly: 50, maxUsers: 1, storageBytes: 104857600, features: ['Herramientas básicas', '1 usuario', '100 MB'], isActive: true },
  { id: '2', slug: 'creator', name: 'Creator', priceMonthly: 1900, priceYearly: 19000, creditsMonthly: 500, maxUsers: 1, storageBytes: 5368709120, features: ['Todas las herramientas estándar', '1 usuario', '5 GB', 'Soporte email'], isActive: true },
  { id: '3', slug: 'pro', name: 'Pro', priceMonthly: 4900, priceYearly: 49000, creditsMonthly: 2000, maxUsers: 5, storageBytes: 26843545600, features: ['Todas las herramientas', '5 usuarios', '25 GB', 'Soporte prioritario'], isActive: true },
  { id: '4', slug: 'studio', name: 'Studio', priceMonthly: 14900, priceYearly: 149000, creditsMonthly: 8000, maxUsers: 20, storageBytes: 107374182400, features: ['Todas + prioridad', '20 usuarios', '100 GB', 'Soporte dedicado'], isActive: true },
  { id: '5', slug: 'enterprise', name: 'Enterprise', priceMonthly: -1, priceYearly: -1, creditsMonthly: -1, maxUsers: -1, storageBytes: -1, features: ['Personalizado', 'Ilimitado', 'SLA', 'Contactar'], isActive: true },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const login = async (_email: string, _password: string): Promise<boolean> => {
    // SIMULATED — No real auth in demo
    setUser({
      id: 'demo-user-1',
      email: _email,
      emailVerified: true,
      name: 'Usuario Demo',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    });
    setOrganization({
      id: 'demo-org-1',
      name: 'Mi Estudio',
      slug: 'mi-estudio',
      planId: '2',
      createdAt: new Date().toISOString(),
    });
    setEntitlement({
      id: 'demo-ent-1',
      organizationId: 'demo-org-1',
      planId: '2',
      creditsTotal: 500,
      creditsUsed: 42,
      activeSince: new Date().toISOString(),
      activeUntil: null,
    });
    setWallet({
      id: 'demo-wallet-1',
      organizationId: 'demo-org-1',
      balance: 458,
    });
    return true;
  };

  const register = async (email: string, _password: string, name: string): Promise<boolean> => {
    // SIMULATED — No real registration in demo
    setUser({
      id: 'demo-user-new',
      email,
      emailVerified: false,
      name,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    setEntitlement(null);
    setWallet(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      entitlement,
      wallet,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { DEMO_PLANS };
