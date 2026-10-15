// ═══════════════════════════════════════════
// CONTRATOS Y MODELOS — Andalus Studio
// ═══════════════════════════════════════════

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type ToolStatus = 'DRAFT' | 'DEVELOPMENT' | 'TESTED' | 'PUBLISHED' | 'DISABLED';

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type LedgerEntryType = 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND' | 'EXPIRATION';

export type ToolCategory = 
  | 'musica-composicion'
  | 'midi'
  | 'letras-idiomas'
  | 'voz-audio'
  | 'imagen-video'
  | 'sonificacion'
  | 'educacion';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planId: string | null;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  priceMonthly: number; // céntimos
  priceYearly: number;
  creditsMonthly: number;
  maxUsers: number;
  storageBytes: number;
  features: string[];
  isActive: boolean;
}

export interface Entitlement {
  id: string;
  organizationId: string;
  planId: string;
  creditsTotal: number;
  creditsUsed: number;
  activeSince: string;
  activeUntil: string | null;
}

export interface Wallet {
  id: string;
  organizationId: string;
  balance: number;
}

export interface CreditLedgerEntry {
  id: string;
  walletId: string;
  type: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  creditCost: number;
  createdAt: string;
}

export interface ToolRun {
  id: string;
  organizationId: string;
  toolId: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown> | null;
  creditsUsed: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export interface AuditEvent {
  id: string;
  userId: string | null;
  organizationId: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: { page: number; total: number };
}

export interface ApiError {
  ok: false;
  error: { code: string; message: string };
}

// Category labels
export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  'musica-composicion': '🎵 Música y Composición',
  'midi': '🎹 MIDI',
  'letras-idiomas': '✍️ Letras e Idiomas',
  'voz-audio': '🎤 Voz y Audio',
  'imagen-video': '🖼️ Imagen y Vídeo',
  'sonificacion': '🔊 Sonificación',
  'educacion': '📚 Educación',
};

export const STATUS_LABELS: Record<ToolStatus, string> = {
  DRAFT: 'Borrador',
  DEVELOPMENT: 'En desarrollo',
  TESTED: 'Probada',
  PUBLISHED: 'Publicada',
  DISABLED: 'Desactivada',
};

export const STATUS_COLORS: Record<ToolStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  DEVELOPMENT: 'bg-yellow-100 text-yellow-700',
  TESTED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  DISABLED: 'bg-red-100 text-red-700',
};
