/**
 * Configuración del servidor ANDALUS STUDIO API
 * FASE 02 - Backend Real
 */

import { z } from 'zod';

const envSchema = z.object({
  // Servidor
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  
  // Frontend URL (para CORS)
  FRONTEND_URL: z.string().url(),
  
  // Base de datos
  DATABASE_URL: z.string().url(),
  
  // Sesiones
  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE_DAYS: z.coerce.number().default(7),
  
  // Cookies
  COOKIE_SECURE: z.coerce.boolean().default(false), // true en producción con HTTPS
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  
  // Email (opcional en desarrollo)
  EMAIL_PROVIDER: z.enum(['smtp', 'console', 'none']).default('console'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@andalus.ai'),
  
  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  
  // Tokens
  EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS: z.coerce.number().default(24),
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS: z.coerce.number().default(1),
  
  // ═══════════════════════════════════════════
  // STRIPE (FASE 03)
  // ═══════════════════════════════════════════
  
  // Modo Stripe (TEST o LIVE)
  STRIPE_MODE: z.enum(['TEST', 'LIVE']).default('TEST'),
  
  // Claves de Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // IDs de precios en Stripe
  STRIPE_PRICE_CREATOR_MONTHLY: z.string().optional(),
  STRIPE_PRICE_CREATOR_YEARLY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
  STRIPE_PRICE_STUDIO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_STUDIO_YEARLY: z.string().optional(),
  
  // Configuración del portal de Stripe
  STRIPE_PORTAL_CONFIGURATION_ID: z.string().optional(),
  
  // URLs
  API_URL: z.string().url().default('http://localhost:3001'),
  STRIPE_WEBHOOK_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Variables de entorno inválidas:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}

export function isProduction(env: Env): boolean {
  return env.NODE_ENV === 'production';
}

export function isDevelopment(env: Env): boolean {
  return env.NODE_ENV === 'development';
}

export function isTest(env: Env): boolean {
  return env.NODE_ENV === 'test';
}

export function isStripeConfigured(env: Env): boolean {
  return !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET;
}

export function isStripeLive(env: Env): boolean {
  return env.STRIPE_MODE === 'LIVE';
}

export function validateStripeKey(key: string | undefined, env: Env): void {
  if (!key) {
    throw new Error('Stripe key not configured');
  }
  
  if (env.STRIPE_MODE === 'TEST' && key.startsWith('sk_live_')) {
    throw new Error('LIVE Stripe key used in TEST mode');
  }
  
  if (env.STRIPE_MODE === 'LIVE' && key.startsWith('sk_test_')) {
    throw new Error('TEST Stripe key used in LIVE mode');
  }
}
