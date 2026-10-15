/**
 * Servidor Fastify - ANDALUS STUDIO API
 * FASE 02 - Backend Real
 */

import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import csrf from '@fastify/csrf-protection';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import { loadEnv, Env } from './config/env';
import { authRoutes } from './routes/auth';
import { accountRoutes } from './routes/account';
import { healthRoutes } from './routes/health';

export interface AppContext {
  env: Env;
  prisma: PrismaClient;
}

export async function buildServer() {
  const env = loadEnv();
  
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    trustProxy: env.NODE_ENV === 'production',
  });

  // ═══════════════════════════════════════════
  // PLUGINS DE SEGURIDAD
  // ═══════════════════════════════════════════

  // Helmet - Headers de seguridad
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  // CORS - Orígenes permitidos
  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  });

  // Cookies - Sesiones
  await app.register(cookie, {
    secret: env.SESSION_SECRET,
    hook: 'onRequest',
  });

  // CSRF Protection
  await app.register(csrf, {
    cookieOpts: {
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: '/',
      httpOnly: true,
    },
  });

  // Rate Limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (request) => {
      return request.ip;
    },
  });

  // ═══════════════════════════════════════════
  // BASE DE DATOS
  // ═══════════════════════════════════════════

  const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Conectar a la base de datos
  try {
    await prisma.$connect();
    app.log.info('✅ Conectado a PostgreSQL');
  } catch (error) {
    app.log.error('❌ Error conectando a PostgreSQL:', error);
    process.exit(1);
  }

  // Contexto de la aplicación
  const context: AppContext = {
    env,
    prisma,
  };

  // Decorar Fastify con el contexto
  app.decorate('context', context);

  // ═══════════════════════════════════════════
  // RUTAS
  // ═══════════════════════════════════════════

  // Health check (sin autenticación)
  app.register(healthRoutes, { prefix: '/api' });

  // Autenticación (registro, login, verificación, recuperación)
  app.register(authRoutes, { prefix: '/api/auth' });

  // Cuenta de usuario (requiere autenticación)
  app.register(accountRoutes, { prefix: '/api/account' });

  // ═══════════════════════════════════════════
  // MANEJO DE ERRORES
  // ═══════════════════════════════════════════

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // Errores de validación de Zod
    if (error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: error.validation,
        },
      });
    }

    // Errores de CSRF
    if (error.code === 'FST_CSRF_INVALID_TOKEN') {
      return reply.status(403).send({
        error: {
          code: 'CSRF_INVALID',
          message: 'Token CSRF inválido',
        },
      });
    }

    // Errores de rate limit
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
        },
      });
    }

    // Error genérico
    const statusCode = error.statusCode || 500;
    const message = env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message;

    return reply.status(statusCode).send({
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    });
  });

  // ═══════════════════════════════════════════
  // CIERRE
  // ═══════════════════════════════════════════

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
    app.log.info('✅ Servidor cerrado correctamente');
  });

  return app;
}

// ═══════════════════════════════════════════
// INICIO DEL SERVIDOR
// ═══════════════════════════════════════════

async function start() {
  const app = await buildServer();
  const env = loadEnv();

  try {
    await app.listen({
      port: env.API_PORT,
      host: env.API_HOST,
    });
    
    app.log.info(`🚀 Servidor iniciado en http://${env.API_HOST}:${env.API_PORT}`);
    app.log.info(`📊 Entorno: ${env.NODE_ENV}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

// Iniciar solo si este archivo se ejecuta directamente
if (require.main === module) {
  start();
}

export { start };
