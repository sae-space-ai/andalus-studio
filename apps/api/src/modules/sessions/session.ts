/**
 * Módulo de Sesiones
 * ANDALUS STUDIO API - FASE 02
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { generateSessionId } from '../security/crypto';
import { Env } from '../config/env';

export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Crea una nueva sesión para un usuario
 */
export async function createSession(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  userAgent: string | null,
  ip: string | null
): Promise<{ sessionId: string; expiresAt: Date }> {
  const sessionId = generateSessionId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.SESSION_MAX_AGE_DAYS);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
      userAgent,
      ip,
    },
  });

  return { sessionId, expiresAt };
}

/**
 * Valida una sesión y retorna los datos si es válida
 */
export async function validateSession(
  prisma: PrismaClient,
  sessionId: string
): Promise<SessionData | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return null;
  }

  // Verificar expiración
  if (session.expiresAt < new Date()) {
    // Eliminar sesión expirada
    await prisma.session.delete({
      where: { id: sessionId },
    });
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
  };
}

/**
 * Revoca una sesión específica
 */
export async function revokeSession(
  prisma: PrismaClient,
  sessionId: string
): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  });
}

/**
 * Revoca todas las sesiones de un usuario
 */
export async function revokeAllUserSessions(
  prisma: PrismaClient,
  userId: string,
  exceptSessionId?: string
): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      ...(exceptSessionId && { id: { not: exceptSessionId } }),
    },
  });
}

/**
 * Obtiene todas las sesiones de un usuario
 */
export async function getUserSessions(
  prisma: PrismaClient,
  userId: string
): Promise<Array<{
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
  expiresAt: Date;
}>> {
  return prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Establece la cookie de sesión
 */
export function setSessionCookie(
  reply: FastifyReply,
  env: Env,
  sessionId: string
): void {
  reply.setCookie('session_id', sessionId, {
    path: '/',
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60, // segundos
  });
}

/**
 * Elimina la cookie de sesión
 */
export function clearSessionCookie(
  reply: FastifyReply,
  env: Env
): void {
  reply.clearCookie('session_id', {
    path: '/',
  });
}

/**
 * Obtiene el ID de sesión de la cookie
 */
export function getSessionIdFromCookie(
  request: FastifyRequest
): string | null {
  const cookie = request.cookies.session_id;
  return cookie?.value || null;
}

/**
 * Middleware para requerir autenticación
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<SessionData> {
  const context = (request.server as any).context;
  const sessionId = getSessionIdFromCookie(request);

  if (!sessionId) {
    return reply.status(401).send({
      error: {
        code: 'SESSION_EXPIRED',
        message: 'No hay sesión activa',
      },
    });
  }

  const session = await validateSession(context.prisma, sessionId);

  if (!session) {
    clearSessionCookie(reply, context.env);
    return reply.status(401).send({
      error: {
        code: 'SESSION_EXPIRED',
        message: 'La sesión ha expirado o sido revocada',
      },
    });
  }

  // Adjuntar sesión al request
  (request as any).session = session;

  return session;
}
