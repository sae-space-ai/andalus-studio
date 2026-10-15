/**
 * Rutas de Cuenta de Usuario
 * ANDALUS STUDIO API - FASE 02
 */

import { FastifyPluginAsync } from 'fastify';
import { UpdateProfileSchema } from '../../../packages/shared/src/contracts';
import { requireAuth } from '../modules/sessions/session';

export const accountRoutes: FastifyPluginAsync = async (app) => {
  const context = (app as any).context;

  // Todas las rutas requieren autenticación
  app.addHook('onRequest', async (request, reply) => {
    await requireAuth(request, reply);
  });

  // ═══════════════════════════════════════════
  // OBTENER PERFIL
  // ═══════════════════════════════════════════

  app.get('/profile', async (request, reply) => {
    const session = (request as any).session;

    const user = await context.prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        },
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: !!user.emailVerifiedAt,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
      },
    };
  });

  // ═══════════════════════════════════════════
  // ACTUALIZAR PERFIL
  // ═══════════════════════════════════════════

  app.patch('/profile', async (request, reply) => {
    const session = (request as any).session;
    const body = UpdateProfileSchema.parse(request.body);

    const user = await context.prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(body.displayName && { displayName: body.displayName }),
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'user.update_profile',
        userId: user.id,
        sessionId: session.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { changes: Object.keys(body) },
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: !!user.emailVerifiedAt,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
      },
    };
  });

  // ═══════════════════════════════════════════
  // OBTENER SESIONES ACTIVAS
  // ═══════════════════════════════════════════

  app.get('/sessions', async (request, reply) => {
    const session = (request as any).session;

    const sessions = await context.prisma.session.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        userAgent: s.userAgent,
        ip: s.ip,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        isCurrent: s.id === session.id,
      })),
      currentSessionId: session.id,
    };
  });

  // ═══════════════════════════════════════════
  // REVOCAR SESIÓN ESPECÍFICA
  // ═══════════════════════════════════════════

  app.delete('/sessions/:sessionId', async (request, reply) => {
    const session = (request as any).session;
    const { sessionId } = request.params as { sessionId: string };

    // Verificar que la sesión pertenece al usuario
    const targetSession = await context.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: session.userId,
      },
    });

    if (!targetSession) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Sesión no encontrada',
        },
      });
    }

    // No permitir revocar la sesión actual
    if (sessionId === session.id) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No puedes revocar la sesión actual. Usa /logout en su lugar.',
        },
      });
    }

    // Revocar sesión
    await context.prisma.session.delete({
      where: { id: sessionId },
    });

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'session.revoke',
        userId: session.userId,
        sessionId: session.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { revokedSessionId: sessionId },
      },
    });

    return { message: 'Sesión revocada correctamente' };
  });

  // ═══════════════════════════════════════════
  // REVOCAR TODAS LAS SESIONES
  // ═══════════════════════════════════════════

  app.post('/logout-all', async (request, reply) => {
    const session = (request as any).session;

    // Revocar todas las sesiones excepto la actual
    await context.prisma.session.deleteMany({
      where: {
        userId: session.userId,
        id: { not: session.id },
      },
    });

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'user.logout_all',
        userId: session.userId,
        sessionId: session.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return { message: 'Todas las demás sesiones han sido cerradas' };
  });
};
