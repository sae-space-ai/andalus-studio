/**
 * Tests de Seguridad
 * ANDALUS STUDIO API - FASE 02
 */

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  verifyToken,
  generateSessionId,
  normalizeEmail,
  isPasswordStrong,
} from '../security/crypto';

describe('Seguridad', () => {
  describe('hashPassword', () => {
    it('hashea una contraseña correctamente', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$argon2id$')).toBe(true);
    });

    it('genera hashes diferentes para la misma contraseña', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('verifica una contraseña correcta', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('rechaza una contraseña incorrecta', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('maneja hashes inválidos gracefully', async () => {
      const isValid = await verifyPassword('TestPassword123', 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('genera tokens únicos', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).not.toBe(token2);
    });

    it('genera tokens UUID válidos', () => {
      const token = generateSecureToken();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(token).toMatch(uuidRegex);
    });
  });

  describe('hashToken', () => {
    it('hashea un token correctamente', async () => {
      const token = generateSecureToken();
      const hash = await hashToken(token);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(token);
      expect(hash.startsWith('$argon2id$')).toBe(true);
    });
  });

  describe('verifyToken', () => {
    it('verifica un token correcto', async () => {
      const token = generateSecureToken();
      const hash = await hashToken(token);
      
      const isValid = await verifyToken(token, hash);
      expect(isValid).toBe(true);
    });

    it('rechaza un token incorrecto', async () => {
      const token = generateSecureToken();
      const hash = await hashToken(token);
      
      const isValid = await verifyToken(generateSecureToken(), hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateSessionId', () => {
    it('genera IDs de sesión únicos', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      
      expect(id1).not.toBe(id2);
    });

    it('genera IDs de 64 caracteres hexadecimales', () => {
      const id = generateSessionId();
      
      expect(id).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(id)).toBe(true);
    });
  });

  describe('normalizeEmail', () => {
    it('convierte a minúsculas', () => {
      expect(normalizeEmail('Test@Example.COM')).toBe('test@example.com');
    });

    it('elimina espacios', () => {
      expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
    });
  });

  describe('isPasswordStrong', () => {
    it('acepta contraseñas fuertes', () => {
      const result = isPasswordStrong('TestPassword123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rechaza contraseñas sin mayúsculas', () => {
      const result = isPasswordStrong('testpassword123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra mayúscula');
    });

    it('rechaza contraseñas sin minúsculas', () => {
      const result = isPasswordStrong('TESTPASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra minúscula');
    });

    it('rechaza contraseñas sin números', () => {
      const result = isPasswordStrong('TestPassword');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    it('rechaza contraseñas muy cortas', () => {
      const result = isPasswordStrong('Test1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });
  });
});
