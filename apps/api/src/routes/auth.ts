/**
 * Rutas de Autenticación
 * ANDALUS STUDIO API - FASE 02
 */

import { FastifyPluginAsync } from 'fastify';
import { RegisterSchema, LoginSchema, VerifyEmailSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../../../packages/shared/src/contracts';
import { hashPassword, verifyPassword, generateSecureToken, hashToken } from '../security/crypto';
import { createSession, setSessionCookie, clearSessionCookie, getSessionIdFromCookie, revokeSession, requireAuth } from '../modules/sessions/session';
import { sendVerificationEmail, sendPasswordResetEmail } from '../modules/email/email';

export const authRoutes: FastifyPluginAsync = async (app) => {
  const context = (app as any).context;

  // ═══════════════════════════════════════════
  // OBTENER TOKEN CSRF
  // ═══════════════════════════════════════════

  app.get('/csrf', async (request, reply) => {
    const csrfToken = reply.generateCsrf();
    return { csrfToken };
  });

  // ═══════════════════════════════════════════
  // REGISTRO
  // ═══════════════════════════════════════════

  app.post('/register', async (request, reply) => {
    const body = RegisterSchema.parse(request.body);

    // Verificar si el email ya existe
    const existingUser = await context.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      // No revelar si el email existe (seguridad)
      return reply.status(201).send({
        message: 'Si el email es válido, recibirás un correo de verificación.',
      });
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(body.password);

    // Crear usuario
    const user = await context.prisma.user.create({
      data: {
        email: body.email,
        displayName: body.displayName,
        passwordHash,
        role: 'USER',
        status: 'PENDING_VERIFICATION',
      },
    });

    // Generar token de verificación
    const token = generateSecureToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + context.env.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS);

    await context.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    // Enviar email de verificación
    await sendVerificationEmail(
      context.env,
      user.email,
      token,
      user.displayName
    );

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'user.register',
        userId: user.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reply.status(201).send({
      message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
      userId: user.id,
    });
  });

  // ═══════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════

  app.post('/login', async (request, reply) => {
    const body = LoginSchema.parse(request.body);

    // Buscar usuario
    const user = await context.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      // No revelar si el usuario existe
      await context.prisma.loginAttempt.create({
        data: {
          email: body.email,
          ip: request.ip,
          success: false,
          reason: 'user_not_found',
        },
      });

      return reply.status(401).send({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas',
        },
      });
    }

    // Verificar contraseña
    const validPassword = await verifyPassword(body.password, user.passwordHash);

    if (!validPassword) {
      await context.prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: body.email,
          ip: request.ip,
          success: false,
          reason: 'invalid_password',
        },
      });

      return reply.status(401).send({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas',
        },
      });
    }

    // Verificar estado de la cuenta
    if (user.status === 'SUSPENDED') {
      return reply.status(403).send({
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Tu cuenta ha sido suspendida',
        },
      });
    }

    if (user.status === 'DISABLED') {
      return reply.status(403).send({
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Tu cuenta ha sido deshabilitada',
        },
      });
    }

    // Verificar email
    if (!user.emailVerifiedAt) {
      return reply.status(403).send({
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Debes verificar tu email antes de iniciar sesión',
        },
      });
    }

    // Crear sesión
    const { sessionId, expiresAt } = await createSession(
      context.prisma,
      context.env,
      user.id,
      request.headers['user-agent'] || null,
      request.ip
    );

    // Establecer cookie
    setSessionCookie(reply, context.env, sessionId);

    // Actualizar último login
    await context.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Registrar intento exitoso
    await context.prisma.loginAttempt.create({
      data: {
        userId: user.id,
        email: body.email,
        ip: request.ip,
        success: true,
      },
    });

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'user.login',
        userId: user.id,
        sessionId,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
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
      session: {
        id: sessionId,
        userId: user.id,
        expiresAt: expiresAt.toISOString(),
      },
    };
  });

  // ═══════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════

  app.post('/logout', async (request, reply) => {
    const sessionId = getSessionIdFromCookie(request);

    if (sessionId) {
      try {
        const session = await context.prisma.session.findUnique({
          where: { id: sessionId },
        });

        if (session) {
          // Registrar evento de auditoría
          await context.prisma.auditEvent.create({
            data: {
              action: 'user.logout',
              userId: session.userId,
              sessionId,
              ip: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });

          // Eliminar sesión
          await revokeSession(context.prisma, sessionId);
        }
      } catch (error) {
        // Ignorar errores al cerrar sesión
      }
    }

    clearSessionCookie(reply, context.env);

    return { message: 'Sesión cerrada correctamente' };
  });

  // ═══════════════════════════════════════════
  // VERIFICAR SESIÓN ACTUAL
  // ═══════════════════════════════════════════

  app.get('/me', async (request, reply) => {
    const session = await requireAuth(request, reply);

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
  // VERIFICAR EMAIL
  // ═══════════════════════════════════════════

  app.post('/verify-email', async (request, reply) => {
    const body = VerifyEmailSchema.parse(request.body);

    // Buscar token
    const verification = await context.prisma.emailVerification.findFirst({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido o expirado',
        },
      });
    }

    // Verificar token
    const validToken = await (await import('../security/crypto')).verifyToken(
      body.token,
      verification.token
    );

    if (!validToken) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido',
        },
      });
    }

    // Marcar token como usado
    await context.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    });

    // Activar usuario
    await context.prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
      },
    });

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'user.verify_email',
        userId: verification.userId,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return { message: 'Email verificado correctamente' };
  });

  // ═══════════════════════════════════════════
  // REENVIAR VERIFICACIÓN
  // ═══════════════════════════════════════════

  app.post('/resend-verification', async (request, reply) => {
    const body = ForgotPasswordSchema.parse(request.body);

    const user = await context.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || user.emailVerifiedAt) {
      // No revelar si el usuario existe
      return reply.status(200).send({
        message: 'Si el email es válido y no está verificado, recibirás un nuevo correo.',
      });
    }

    // Verificar límite de reenvíos (máximo 3 en 24 horas)
    const recentTokens = await context.prisma.emailVerification.count({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentTokens >= 3) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
        },
      });
    }

    // Generar nuevo token
    const token = generateSecureToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + context.env.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS);

    await context.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    // Enviar email
    await sendVerificationEmail(
      context.env,
      user.email,
      token,
      user.displayName
    );

    return { message: 'Email de verificación reenviado' };
  });

  // ═══════════════════════════════════════════
  // OLVIDÉ MI CONTRASEÑA
  // ═══════════════════════════════════════════

  app.post('/forgot-password', async (request, reply) => {
    const body = ForgotPasswordSchema.parse(request.body);

    const user = await context.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      // No revelar si el usuario existe
      return reply.status(200).send({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
      });
    }

    // Verificar límite de solicitudes (máximo 3 en 1 hora)
    const recentTokens = await context.prisma.passwordReset.count({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentTokens >= 3) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
        },
      });
    }

    // Generar token
    const token = generateSecureToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + context.env.PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

    await context.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    // Enviar email
    await sendPasswordResetEmail(
      context.env,
      user.email,
      token,
      user.displayName
    );

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'user.forgot_password',
        userId: user.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return { message: 'Instrucciones enviadas si el email existe' };
  });

  // ═══════════════════════════════════════════
  // RESTABLECER CONTRASEÑA
  // ═══════════════════════════════════════════

  app.post('/reset-password', async (request, reply) => {
    const body = ResetPasswordSchema.parse(request.body);

    // Buscar token
    const reset = await context.prisma.passwordReset.findFirst({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!reset) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido o expirado',
        },
      });
    }

    // Verificar token
    const validToken = await (await import('../security/crypto')).verifyToken(
      body.token,
      reset.token
    );

    if (!validToken) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido',
        },
      });
    }

    // Hashear nueva contraseña
    const passwordHash = await hashPassword(body.password);

    // Actualizar contraseña
    await context.prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    });

    // Marcar token como usado
    await context.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });

    // Revocar todas las sesiones excepto la actual (si existe)
    const sessionId = getSessionIdFromCookie(request);
    if (sessionId) {
      await context.prisma.session.deleteMany({
        where: {
          userId: reset.userId,
          id: { not: sessionId },
        },
      });
    } else {
      await context.prisma.session.deleteMany({
        where: { userId: reset.userId },
      });
    }

    // Registrar evento de auditoría
    await context.prisma.auditEvent.create({
      data: {
        action: 'user.reset_password',
        userId: reset.userId,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return { message: 'Contraseña restablecida correctamente' };
  });
};
