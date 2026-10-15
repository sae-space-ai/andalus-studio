/**
 * Cliente API Centralizado - ANDALUS STUDIO
 * FASE 04 - Conexión React con Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ═══════════════════════════════════════════
// TIPOS DE RESPUESTA
// ═══════════════════════════════════════════

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    total?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ═══════════════════════════════════════════
// CONFIGURACIÓN DEL CLIENTE
// ═══════════════════════════════════════════

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  requireAuth?: boolean;
}

const DEFAULT_TIMEOUT = 30000; // 30 segundos

// ═══════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════

/**
 * Obtiene el token CSRF de la cookie
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/_csrf=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Construye headers con CSRF token si es necesario
 */
function buildHeaders(config: RequestConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // Añadir CSRF token para mutaciones
  if (config.method && config.method !== 'GET') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  return headers;
}

/**
 * Maneja timeouts con AbortController
 */
function createTimeoutController(timeout: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}

// ═══════════════════════════════════════════
// FUNCIÓN PRINCIPAL DE PETICIÓN
// ═══════════════════════════════════════════

/**
 * Realiza una petición HTTP al backend
 */
export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    timeout = DEFAULT_TIMEOUT,
    requireAuth = false,
  } = config;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = buildHeaders(config);
  const { controller, timeoutId } = createTimeoutController(timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Incluir cookies
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Manejar respuestas de error
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: {
          code: 'PARSE_ERROR',
          message: 'Error al procesar la respuesta del servidor',
        },
      }));

      // Manejar sesión expirada
      if (response.status === 401) {
        // Redirigir a login si es necesario
        if (requireAuth && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }

      throw new ApiRequestError(
        errorData.error.message,
        errorData.error.code,
        response.status,
        errorData.error.details
      );
    }

    // Manejar respuestas vacías
    if (response.status === 204) {
      return {} as T;
    }

    // Parsear respuesta JSON
    const data: T = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Manejar timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError(
        'La petición tardó demasiado en responder',
        'TIMEOUT',
        408
      );
    }

    // Manejar errores de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiRequestError(
        'No se puede conectar con el servidor. Verifica tu conexión.',
        'NETWORK_ERROR',
        0
      );
    }

    // Re-lanzar errores de API
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Error desconocido
    throw new ApiRequestError(
      'Error desconocido al procesar la petición',
      'UNKNOWN_ERROR',
      0
    );
  }
}

// ═══════════════════════════════════════════
// CLASE DE ERROR PERSONALIZADA
// ═══════════════════════════════════════════

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// ═══════════════════════════════════════════
// MÉTODOS CONVENIENTES
// ═══════════════════════════════════════════

export const api = {
  /**
   * Petición GET
   */
  get<T>(endpoint: string, requireAuth = false): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET', requireAuth });
  },

  /**
   * Petición POST
   */
  post<T>(endpoint: string, body?: unknown, requireAuth = false): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'POST', body, requireAuth });
  },

  /**
   * Petición PUT
   */
  put<T>(endpoint: string, body?: unknown, requireAuth = false): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'PUT', body, requireAuth });
  },

  /**
   * Petición PATCH
   */
  patch<T>(endpoint: string, body?: unknown, requireAuth = false): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'PATCH', body, requireAuth });
  },

  /**
   * Petición DELETE
   */
  delete<T>(endpoint: string, requireAuth = false): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE', requireAuth });
  },
};

// ═══════════════════════════════════════════
// ENDPOINTS DE AUTENTICACIÓN
// ═══════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface AuthResponse {
  user: User;
}

export interface CsrfResponse {
  csrfToken: string;
}

export const authApi = {
  /**
   * Obtener token CSRF
   */
  getCsrfToken(): Promise<CsrfResponse> {
    return api.get<CsrfResponse>('/auth/csrf');
  },

  /**
   * Registro de usuario
   */
  register(data: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<{ message: string; userId: string }> {
    return api.post('/auth/register', data);
  },

  /**
   * Inicio de sesión
   */
  login(data: { email: string; password: string }): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', data);
  },

  /**
   * Cerrar sesión
   */
  logout(): Promise<{ message: string }> {
    return api.post('/auth/logout');
  },

  /**
   * Obtener usuario actual
   */
  me(): Promise<AuthResponse> {
    return api.get<AuthResponse>('/auth/me', true);
  },

  /**
   * Verificar email
   */
  verifyEmail(token: string): Promise<{ message: string }> {
    return api.post('/auth/verify-email', { token });
  },

  /**
   * Reenviar verificación de email
   */
  resendVerification(email: string): Promise<{ message: string }> {
    return api.post('/auth/resend-verification', { email });
  },

  /**
   * Solicitar recuperación de contraseña
   */
  forgotPassword(email: string): Promise<{ message: string }> {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Restablecer contraseña
   */
  resetPassword(token: string, password: string): Promise<{ message: string }> {
    return api.post('/auth/reset-password', { token, password });
  },
};

// ═══════════════════════════════════════════
// ENDPOINTS DE CUENTA
// ═══════════════════════════════════════════

export interface Session {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export const accountApi = {
  /**
   * Obtener perfil
   */
  getProfile(): Promise<{ user: User }> {
    return api.get('/account/profile', true);
  },

  /**
   * Actualizar perfil
   */
  updateProfile(data: { displayName?: string }): Promise<{ user: User }> {
    return api.patch('/account/profile', data, true);
  },

  /**
   * Obtener sesiones activas
   */
  getSessions(): Promise<{ sessions: Session[]; currentSessionId: string }> {
    return api.get('/account/sessions', true);
  },

  /**
   * Revocar sesión específica
   */
  revokeSession(sessionId: string): Promise<{ message: string }> {
    return api.delete(`/account/sessions/${sessionId}`, true);
  },

  /**
   * Cerrar todas las sesiones excepto la actual
   */
  logoutAll(): Promise<{ message: string }> {
    return api.post('/account/logout-all', undefined, true);
  },
};

// ═══════════════════════════════════════════
// ENDPOINTS DE BILLING
// ═══════════════════════════════════════════

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  includedCredits: number;
  maxUsers: number;
  features: Record<string, unknown>;
  limits: Record<string, unknown> | null;
}

export interface Subscription {
  id: string;
  plan: {
    id: string;
    slug: string;
    name: string;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

export interface Invoice {
  id: string;
  number: string | null;
  status: string;
  currency: string;
  amountTotal: number;
  amountPaid: number;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
  createdAt: string;
}

export const billingApi = {
  /**
   * Obtener planes disponibles
   */
  getPlans(): Promise<{ plans: Plan[] }> {
    return api.get('/billing/plans');
  },

  /**
   * Obtener suscripción actual
   */
  getSubscription(): Promise<{ subscription: Subscription | null }> {
    return api.get('/billing/subscription', true);
  },

  /**
   * Crear sesión de checkout
   */
  createCheckout(data: {
    planSlug: string;
    billingInterval: 'monthly' | 'yearly';
  }): Promise<{ checkoutUrl: string; sessionId: string }> {
    return api.post('/billing/checkout', data, true);
  },

  /**
   * Crear sesión de portal
   */
  createPortal(returnUrl: string): Promise<{ portalUrl: string }> {
    return api.post('/billing/portal', { returnUrl }, true);
  },

  /**
   * Obtener facturas
   */
  getInvoices(): Promise<{ invoices: Invoice[] }> {
    return api.get('/billing/invoices', true);
  },

  /**
   * Verificar estado de checkout
   */
  getCheckoutStatus(sessionId: string): Promise<{
    status: 'completed' | 'pending' | 'unknown';
    message: string;
  }> {
    return api.get(`/billing/checkout/${sessionId}/status`, true);
  },
};

// ═══════════════════════════════════════════
// ENDPOINTS DE CRÉDITOS
// ═══════════════════════════════════════════

export interface CreditBalance {
  balance: number;
  totalReserved: number;
  availableBalance: number;
  totalCredits: number;
  totalConsumed: number;
}

export interface LedgerEntry {
  id: string;
  entryType: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  relatedJobId: string | null;
  relatedInvoiceId: string | null;
  createdAt: string;
}

export const creditsApi = {
  /**
   * Obtener balance de créditos
   */
  getBalance(): Promise<CreditBalance> {
    return api.get('/credits/balance', true);
  },

  /**
   * Obtener historial del ledger
   */
  getLedger(limit = 50, offset = 0): Promise<{
    entries: LedgerEntry[];
    total: number;
  }> {
    return api.get(`/credits/ledger?limit=${limit}&offset=${offset}`, true);
  },

  /**
   * Obtener trabajos recientes
   */
  getJobs(): Promise<{
    jobs: Array<{
      id: string;
      toolId: string;
      status: string;
      quotedCredits: number;
      reservedCredits: number;
      consumedCredits: number;
      refundedCredits: number;
      startedAt: string | null;
      completedAt: string | null;
      createdAt: string;
    }>;
  }> {
    return api.get('/credits/jobs', true);
  },

  /**
   * Obtener entitlement actual
   */
  getEntitlement(): Promise<{
    entitlement: {
      id: string;
      plan: {
        id: string;
        slug: string;
        name: string;
      };
      status: string;
      creditsTotal: number;
      creditsUsed: number;
      creditsReserved: number;
      periodStart: string;
      periodEnd: string | null;
      features: Record<string, unknown> | null;
      toolAccess: Record<string, unknown> | null;
    } | null;
  }> {
    return api.get('/credits/entitlement', true);
  },
};

// ═══════════════════════════════════════════
// ENDPOINTS DE HERRAMIENTAS
// ═══════════════════════════════════════════

export const toolsApi = {
  /**
   * Convertir MIDI a frecuencia
   */
  midiToFrequency(midi: number, tuningFrequency = 440): Promise<{
    note: {
      midi: number;
      note: string;
      octave: number;
      frequency: number;
      cents: number;
    };
    tuningSystem: string;
    tuningFrequency: number;
  }> {
    return api.post('/tools/midi-to-frequency', { midi, tuningFrequency });
  },

  /**
   * Convertir frecuencia a MIDI
   */
  frequencyToMidi(frequency: number, tuningFrequency = 440): Promise<{
    midi: number;
    nearestMidi: number;
    note: string;
    octave: number;
    exactFrequency: number;
    cents: number;
    tuningSystem: string;
    tuningFrequency: number;
  }> {
    return api.post('/tools/frequency-to-midi', { frequency, tuningFrequency });
  },

  /**
   * Verificar conversiones MIDI
   */
  verifyMidiCalculator(): Promise<{
    status: 'ok' | 'failed';
    tests: Array<{
      name: string;
      passed: boolean;
      expected: number;
      actual: number;
    }>;
    timestamp: string;
  }> {
    return api.get('/tools/midi-calculator/verify');
  },
};

// ═══════════════════════════════════════════
// ENDPOINTS DE HEALTH
// ═══════════════════════════════════════════

export const healthApi = {
  /**
   * Verificar salud del servidor
   */
  check(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    environment: string;
  }> {
    return api.get('/health');
  },

  /**
   * Verificar readiness del servidor
   */
  ready(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    return api.get('/ready');
  },
};

export default api;
