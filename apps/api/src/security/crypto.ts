/**
 * Utilidades de Seguridad
 * ANDALUS STUDIO API - FASE 02
 */

import argon2 from 'argon2';
import crypto from 'crypto';

// ═══════════════════════════════════════════
// HASHING DE CONTRASEÑAS
// ═══════════════════════════════════════════

/**
 * Hashea una contraseña usando Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
    saltLength: 16,
    hashLength: 32,
  });
}

/**
 * Verifica una contraseña contra un hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

// ═══════════════════════════════════════════
// GENERACIÓN DE TOKENS
// ═══════════════════════════════════════════

/**
 * Genera un token seguro para verificación de email o recuperación de contraseña
 */
export function generateSecureToken(): string {
  return crypto.randomUUID();
}

/**
 * Hashea un token para almacenamiento seguro
 */
export async function hashToken(token: string): Promise<string> {
  return argon2.hash(token, {
    type: argon2.argon2id,
    memoryCost: 32768, // 32 MB (menor que contraseñas)
    timeCost: 2,
    parallelism: 4,
    saltLength: 16,
    hashLength: 32,
  });
}

/**
 * Verifica un token contra un hash
 */
export async function verifyToken(
  token: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, token);
  } catch (error) {
    return false;
  }
}

// ═══════════════════════════════════════════
// GENERACIÓN DE SESSION ID
// ═══════════════════════════════════════════

/**
 * Genera un ID de sesión criptográficamente seguro
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ═══════════════════════════════════════════
// NORMALIZACIÓN
// ═══════════════════════════════════════════

/**
 * Normaliza un email para comparación
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ═══════════════════════════════════════════
// VALIDACIÓN
// ═══════════════════════════════════════════

/**
 * Valida que una contraseña sea suficientemente robusta
 */
export function isPasswordStrong(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (password.length > 128) {
    errors.push('La contraseña es demasiado larga');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
