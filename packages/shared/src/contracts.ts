/**
 * Contratos compartidos entre frontend y backend
 * ANDALUS STUDIO - FASE 02
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const EmailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email demasiado largo')
  .transform((email) => email.toLowerCase().trim());

export const PasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener mayúsculas, minúsculas y números'
  );

export const DisplayNameSchema = z
  .string()
  .min(1, 'El nombre es obligatorio')
  .max(100, 'El nombre es demasiado largo')
  .trim();

// ═══════════════════════════════════════════
// SCHEMAS DE PETICIÓN
// ═══════════════════════════════════════════

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: DisplayNameSchema,
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const VerifyEmailSchema = z.object({
  token: z.string().uuid('Token inválido'),
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordSchema = z.object({
  token: z.string().uuid('Token inválido'),
  password: PasswordSchema,
});

export const UpdateProfileSchema = z.object({
  displayName: DisplayNameSchema.optional(),
});

// ═══════════════════════════════════════════
// TIPOS DE RESPUESTA
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

export interface Session {
  id: string;
  userId: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface ProfileResponse {
  user: User;
}

export interface SessionsResponse {
  sessions: Session[];
  currentSessionId: string;
}

// ═══════════════════════════════════════════
// ERRORES
// ═══════════════════════════════════════════

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_DISABLED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_ALREADY_USED'
  | 'SESSION_EXPIRED'
  | 'SESSION_REVOKED'
  | 'CSRF_INVALID'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ValidationError extends ApiError {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      fields: Record<string, string[]>;
    };
  };
}

// ═══════════════════════════════════════════
// TIPOS DE AUDITORÍA
// ═══════════════════════════════════════════

export type AuditAction =
  | 'user.register'
  | 'user.login'
  | 'user.logout'
  | 'user.logout_all'
  | 'user.verify_email'
  | 'user.forgot_password'
  | 'user.reset_password'
  | 'user.update_profile'
  | 'session.revoke'
  | 'security.login_failed'
  | 'security.rate_limit';

export interface AuditEvent {
  id: string;
  action: AuditAction;
  userId: string | null;
  sessionId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ═══════════════════════════════════════════
// HERRAMIENTAS - CALCULADORA MIDI
// ═══════════════════════════════════════════

export const MidiNoteSchema = z
  .number()
  .int('El número MIDI debe ser entero')
  .min(0, 'El número MIDI mínimo es 0')
  .max(127, 'El número MIDI máximo es 127');

export const FrequencySchema = z
  .number()
  .positive('La frecuencia debe ser positiva')
  .finite('La frecuencia debe ser un número finito');

export interface MidiToFrequencyRequest {
  midi: number;
  tuningFrequency?: number; // A4 reference, default 440
}

export interface FrequencyToMidiRequest {
  frequency: number;
  tuningFrequency?: number;
}

export interface MidiNoteInfo {
  midi: number;
  note: string; // e.g., "A4"
  octave: number;
  frequency: number;
  cents: number; // Deviation from equal temperament
}

export interface MidiToFrequencyResponse {
  note: MidiNoteInfo;
  tuningSystem: string;
  tuningFrequency: number;
}

export interface FrequencyToMidiResponse {
  midi: number;
  nearestMidi: number;
  note: string;
  octave: number;
  exactFrequency: number;
  cents: number;
  tuningSystem: string;
  tuningFrequency: number;
}
