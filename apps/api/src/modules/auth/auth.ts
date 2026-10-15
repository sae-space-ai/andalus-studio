// Módulo de autenticación: registro, login, verificación email, recuperación.
// Decisiones de seguridad:
// - Argon2id para contraseñas.
// - Tokens opacos de un solo uso con caducidad; se guarda solo SHA-256 del token.
// - Errores sin filtración: "correo o contraseña incorrectos" (no revela si existe cuenta).
// - En login/registro SIEMPRE se ejecuta un hash argon2 dummy para igualar tiempos.
import crypto from "node:crypto";
import { prisma } from "../../db.js";
import env from "../../config/env.js";
import { sendMail } from "../email/email.js";
import { hashPassword, verifyPassword, generateToken, hashToken } from "./crypto.js";
import { createSession, destroySession, getSessionUser } from "./session.js";

const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=1$c2FsdHNhbHRzYWx0$8Xy4vJm1s0k0mYQ6wGmZ0pQeS3r7t1u9w5x2c4v6b8n0m1q3r5t7y9u1i3o5p7a9"; // coste constante anti-timing

export async function register(emailRaw: string, password: string, displayName?: string) {
  const emailLower = emailRaw.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { emailLower } });
  if (existing) {
    // Igualamos tiempo con un hash dummy y respondemos genérico (sin filtración)
    await argon2VerifyDummy(password);
    return { ok: false as const, code: "EMAIL_TAKEN_OR_UNKNOWN", message: "No se pudo completar el registro." };
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: emailRaw.trim(),
      emailLower,
      passwordHash,
      displayName: displayName?.trim() || emailLower.split("@")[0],
    },
  });
  await ensureWallet(user.id);

  const token = generateToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });
  const verifyUrl = `${env.frontendUrl}/verify-email?token=${token}`;
  const mailResult = await sendMail({
    to: user.email,
    subject: "Verifica tu correo — Andalus Creative World",
    text: `Bienvenido a Andalus Creative World.\n\nVerifica tu correo entrando en este enlace (caduca en 24 h):\n${verifyUrl}\n\nSi no solicitaste esta cuenta, ignora este mensaje.`,
  });

  return { ok: true as const, userId: user.id, verifyUrl, mailDelivered: mailResult.delivered };
}

async function argon2VerifyDummy(password: string) {
  try {
    // rehash de una constante: coste equivalente al de un intento real
    await verifyPassword(DUMMY_HASH, password);
  } catch {
    /* noop */
  }
}

export async function login(emailRaw: string, password: string) {
  const emailLower = emailRaw.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { emailLower } });
  if (!user || !user.passwordHash) {
    await argon2VerifyDummy(password);
    return { ok: false as const, code: "INVALID_CREDENTIALS", message: "Correo o contraseña incorrectos." };
  }
  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    await recordSecurityEvent(user.id, "login_failed");
    return { ok: false as const, code: "INVALID_CREDENTIALS", message: "Correo o contraseña incorrectos." };
  }
  return { ok: true as const, userId: user.id };
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashToken(token);
  const rec = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
    return { ok: false as const, code: "TOKEN_INVALID", message: "Enlace no válido o caducado." };
  }
  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: rec.userId }, data: { emailVerifiedAt: new Date() } }),
  ]);
  return { ok: true as const, userId: rec.userId };
}

export async function forgotPassword(emailRaw: string) {
  const emailLower = emailRaw.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { emailLower } });
  // Respuesta siempre idéntica desde el punto de vista del cliente (anti enumeración)
  if (user) {
    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60 * 30 * 1000), // 30 min
      },
    });
    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Restablecer contraseña — Andalus Creative World",
      text: `Alguien ha solicitado restablecer tu contraseña.\n\nSi fuiste tú, entra en este enlace (caduca en 30 minutos):\n${resetUrl}\n\nSi no fuiste tú, ignora este mensaje. Tu contraseña no cambiará.`,
    });
  } else {
    await sleepRandom();
  }
  return { ok: true as const, message: "Si el correo existe, recibirás instrucciones." };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const rec = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
    await argon2VerifyDummy(newPassword);
    return { ok: false as const, code: "TOKEN_INVALID", message: "Enlace no válido o caducado." };
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: rec.userId }, data: { passwordHash } }),
    // Invalidar todas las sesiones existentes tras cambio de contraseña
    prisma.session.deleteMany({ where: { userId: rec.userId } }),
  ]);
  await recordSecurityEvent(rec.userId, "password_reset");
  return { ok: true as const };
}

export async function recordSecurityEvent(userId: string | null, type: string, meta?: object) {
  await prisma.securityEvent
    .create({ data: { userId, type, meta: (meta as object) ?? undefined } })
    .catch(() => {});
}

async function ensureWallet(userId: string) {
  await prisma.creditWallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

function sleepRandom() {
  return new Promise((r) => setTimeout(r, 150 + crypto.randomInt(150)));
}

export { createSession, destroySession, getSessionUser };
