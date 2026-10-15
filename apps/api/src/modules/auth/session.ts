// Sesiones seguras: cookie HttpOnly + hash en BD + protección CSRF doble-submit.
// NUNCA localStorage para sesiones o contraseñas.
import type { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import { prisma } from "../../db.js";
import env from "../../config/env.js";
import { generateSessionToken, hashToken, pseudonymize } from "./crypto.js";

export const SESSION_COOKIE = "acw_session";
export const CSRF_COOKIE = "acw_csrf";

const SESSION_TTL_DAYS = 30;

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: Date | null;
}

export async function createSession(
  req: FastifyRequest,
  reply: FastifyReply,
  userId: string,
): Promise<void> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 3600 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipHash: req.ip ? pseudonymize(req.ip, env.sessionSecret) : null,
      userAgentHash: req.headers["user-agent"]
        ? pseudonymize(String(req.headers["user-agent"]), env.sessionSecret)
        : null,
    },
  });

  const secure = env.isProd; // en producción detrás de HTTPS
  reply.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  // Token CSRF (doble submit): legible por el frontend, sin valor de sesión
  const csrfToken = crypto.randomBytes(24).toString("base64url");
  reply.cookie(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser(req: FastifyRequest): Promise<SessionUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }
  // lastSeenAt sin bloquear la respuesta
  prisma.session
    .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
    .catch(() => {});
  const u = session.user;
  return { id: u.id, email: u.email, displayName: u.displayName, emailVerifiedAt: u.emailVerifiedAt };
}

export async function destroySession(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }
  reply.clearCookie(SESSION_COOKIE, { path: "/" });
  reply.clearCookie(CSRF_COOKIE, { path: "/" });
}

export function getCsrfTokenFromCookie(req: FastifyRequest): string | undefined {
  return req.cookies?.[CSRF_COOKIE];
}
