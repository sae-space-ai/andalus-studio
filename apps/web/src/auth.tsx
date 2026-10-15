// Contexto de autenticación conectado a la API REAL. Sin usuarios simulados.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, initApi } from "./api/client";
import type { UserDto, Capabilities } from "@acw/contracts";

interface AuthState {
  loading: boolean;
  user: UserDto | null;
  caps: Capabilities | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState>(null as never);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);
  const [caps, setCaps] = useState<Capabilities | null>(null);

  async function refresh() {
    const me = await api.get<{ authenticated: boolean; user: UserDto | null }>("/auth/me");
    setUser(me.data?.authenticated ? me.data.user : null);
  }

  useEffect(() => {
    (async () => {
      await initApi();
      const c = await api.get<Capabilities>("/capabilities");
      setCaps(c.data);
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const r = await api.post<{ user: UserDto }>("/auth/login", { email, password });
    if (r.status === 200 && r.data) {
      setUser(r.data.user);
      return { ok: true };
    }
    return { ok: false, error: r.error ?? "No se pudo iniciar sesión." };
  }

  async function register(email: string, password: string, displayName?: string) {
    const r = await api.post("/auth/register", { email, password, displayName });
    if (r.status === 201) return { ok: true };
    return { ok: false, error: r.error ?? "No se pudo crear la cuenta." };
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return <Ctx.Provider value={{ loading, user, caps, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}
