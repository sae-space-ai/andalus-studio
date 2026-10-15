// =====================================================================
// ANDALUS CREATIVE WORLD — API Fastify (FASE 00)
// Rutas reales montadas bajo /api/v1. Sin rutas decorativas:
// lo que no está implementado responde 501 con estado honesto.
// =====================================================================
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import csrf from "@fastify/csrf-protection";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createProjectSchema,
  uploadDocumentMetaSchema,
  API_VERSION,
} from "@acw/contracts";
import env from "./config/env.js";
import { prisma } from "./db.js";
import {
  register,
  login,
  verifyEmailToken,
  forgotPassword,
  resetPassword,
  createSession,
  destroySession,
  getSessionUser,
  recordSecurityEvent,
} from "./modules/auth/auth.js";
import { SESSION_COOKIE, CSRF_COOKIE } from "./modules/auth/session.js";
import { googleEnabled, startAuth, completeAuth } from "./modules/auth/google.js";
import { extractPdfText, sha256File, storageKeyFor } from "./modules/documents/pdf.js";

export async function buildServer() {
  const app = Fastify({ logger: false });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie);
  await app.register(csrf, { cookieKey: CSRF_COOKIE, rotateInvalid: true });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  await app.register(multipart, { limits: { fileSize: env.maxUploadBytes, files: 1 } });

  // --- Helpers ---
  const userDto = (u: { id: string; email: string; displayName: string; emailVerifiedAt: Date | null; createdAt: Date }) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    emailVerified: !!u.emailVerifiedAt,
    createdAt: u.createdAt.toISOString(),
  });

  async function requireAuth(req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) {
    const user = await getSessionUser(req);
    if (!user) {
      await reply.code(401).send({ error: { code: "UNAUTHENTICATED", message: "Inicia sesión para continuar." } });
      return null;
    }
    return user;
  }

  // Excepciones CSRF: las mutaciones autenticadas requieren header csrf-token
  // (doble submit). Las rutas de auth pre-sesión también lo requieren una vez
  // se emitió cookie CSRF; el frontend la obtiene en GET /auth/csrf-token.
  app.addHook("onRequest", async (req, reply) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      try {
        await app.applyCsrf(req, reply);
      } catch {
        await recordSecurityEvent(null, "csrf_rejected", { path: req.url });
        await reply.code(403).send({ error: { code: "CSRF_FAILED", message: "Verificación CSRF fallida." } });
      }
    }
  });

  // ---------- HEALTH & CAPABILITIES (honestidad técnica) ----------
  app.get("/health", async () => ({ ok: true, apiVersion: API_VERSION }));

  app.get("/api/v1/capabilities", async () => ({
    google: {
      enabled: googleEnabled(),
      reason: googleEnabled() ? null : "Faltan credenciales Google OIDC (GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI). Login social NO operativo.",
    },
    stripe: {
      enabled: env.stripe.enabled,
      mode: env.stripe.mode,
    },
    promotionWelcome20x20: {
      active: false,
      note: "Promoción 20+20 diseñada y con modelo de datos, BLOQUEADA hasta aprobación comercial y Stripe test real.",
    },
    apiVersion: API_VERSION,
  }));

  app.get("/api/v1/auth/csrf-token", async (_req, reply) => {
    const token = reply.generateCsrf();
    return { csrfToken: token };
  });

  // ---------- AUTH ----------
  app.post("/api/v1/auth/register", { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: "VALIDATION", message: parsed.error.issues[0]?.message ?? "Datos no válidos." } });
    }
    const res = await register(parsed.data.email, parsed.data.password, parsed.data.displayName);
    if (!res.ok) {
      return reply.code(409).send({ error: { code: res.code, message: res.message } });
    }
    return reply.code(201).send({ ok: true, message: "Cuenta creada. Revisa tu correo para verificarla." });
  });

  app.post("/api/v1/auth/login", { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: "VALIDATION", message: "Datos no válidos." } });
    }
    const res = await login(parsed.data.email, parsed.data.password);
    if (!res.ok) {
      await recordSecurityEvent(null, "login_failed_generic", { code: res.code });
      return reply.code(401).send({ error: { code: res.code, message: res.message } });
    }
    await createSession(req, reply, res.userId);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: res.userId } });
    return reply.send({ ok: true, user: userDto(user) });
  });

  app.post("/api/v1/auth/logout", async (req, reply) => {
    await destroySession(req, reply);
    return { ok: true };
  });

  app.get("/api/v1/auth/me", async (req, reply) => {
    const s = await getSessionUser(req);
    if (!s) return reply.code(401).send({ authenticated: false, user: null });
    return { authenticated: true, user: userDto(s as never) };
  });

  app.post("/api/v1/auth/verify-email", async (req, reply) => {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: { code: "VALIDATION", message: "Token no válido." } });
    const res = await verifyEmailToken(parsed.data.token);
    if (!res.ok) return reply.code(400).send({ error: { code: res.code, message: res.message } });
    return { ok: true, message: "Correo verificado." };
  });

  app.post("/api/v1/auth/forgot-password", { config: { rateLimit: { max: 5, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: { code: "VALIDATION", message: "Correo no válido." } });
    const res = await forgotPassword(parsed.data.email);
    return { ok: true, message: res.message };
  });

  app.post("/api/v1/auth/reset-password", { config: { rateLimit: { max: 5, timeWindow: "15 minutes" } } }, async (req, reply) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: "VALIDATION", message: parsed.error.issues[0]?.message ?? "Datos no válidos." } });
    }
    const res = await resetPassword(parsed.data.token, parsed.data.password);
    if (!res.ok) return reply.code(400).send({ error: { code: res.code, message: res.message } });
    return { ok: true, message: "Contraseña actualizada. Inicia sesión de nuevo." };
  });

  // ---------- GOOGLE OIDC ----------
  app.get("/api/v1/auth/google/start", async (req, reply) => {
    if (!googleEnabled()) {
      return reply.code(503).send({ error: { code: "GOOGLE_NOT_CONFIGURED", message: "Google Login no está configurado en este entorno." } });
    }
    const stateSid = crypto.randomUUID();
    const { url } = await startAuth(stateSid);
    return reply.redirect(url, 302);
  });

  app.get("/api/v1/auth/google/callback", async (req, reply) => {
    if (!googleEnabled()) {
      return reply.code(503).send({ error: { code: "GOOGLE_NOT_CONFIGURED", message: "Google Login no está configurado en este entorno." } });
    }
    const q = req.query as { code?: string; state?: string; error?: string };
    if (q.error) {
      return reply.redirect(`${env.frontendUrl}/login?google=cancelled`, 302);
    }
    try {
      const res = await completeAuth(q);
      await createSession(req, reply, res.userId);
      return reply.redirect(`${env.frontendUrl}/dashboard`, 302);
    } catch (e) {
      const code = (e as Error).message;
      await recordSecurityEvent(null, "google_oidc_failed", { code });
      if (code === "ACCOUNT_EXISTS_LINK_REQUIRED") {
        return reply.redirect(`${env.frontendUrl}/login?google=link_required`, 302);
      }
      return reply.redirect(`${env.frontendUrl}/login?google=error`, 302);
    }
  });

  // ---------- CUENTA ----------
  app.get("/api/v1/account", async (req, reply) => {
    const s = await requireAuth(req, reply);
    if (!s) return;
    const u = await prisma.user.findUniqueOrThrow({ where: { id: s.id } });
    return userDto(u);
  });

  app.patch("/api/v1/account", async (req, reply) => {
    const s = await requireAuth(req, reply);
    if (!s) return;
    const body = req.body as { displayName?: string };
    const name = typeof body?.displayName === "string" ? body.displayName.trim().slice(0, 80) : "";
    const u = await prisma.user.update({ where: { id: s.id }, data: { displayName: name || s.displayName } });
    return userDto(u);
  });

  app.get("/api/v1/billing/balance", async (req, reply) => {
    const s = await requireAuth(req, reply);
    if (!s) return;
    const w = await prisma.creditWallet.findUnique({ where: { userId: s.id } });
    if (!w) return { purchasedUnits: "0", promoUnits: "0", reservedUnits: "0", consumedUnits: "0", currencyCode: "EUR_CREDIT", conversionVersion: "v1" };
    return {
      purchasedUnits: w.purchasedUnits.toString(),
      promoUnits: w.promoUnits.toString(),
      reservedUnits: w.reservedUnits.toString(),
      consumedUnits: w.consumedUnits.toString(),
      currencyCode: w.currencyCode,
      conversionVersion: w.conversionVersion,
    };
  });

  app.get("/api/v1/billing/promotions", async (req, reply) => {
    const s = await requireAuth(req, reply);
    if (!s) return;
    return {
      promotions: [],
      note: "Sin promociones activas. La campaña de bienvenida 20+20 está DISEÑADA pero BLOQUEADA hasta aprobación del propietario y Stripe test real.",
    };
  });

  // ---------- PROYECTOS ----------
  app.get("/api/v1/projects", async (req, reply) => {
    const s = await requireAuth(req, reply);
    if (!s) return;
    const projects = await prisma.project.findMany({
      where: { ownerId: s.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { documents: true } } },
    });
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      visibility: p.visibility,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      documentCount: p._count.documents,
    }));
  });

  app.post("/api/v1/projects", async (req, reply) => {
    const s = await requireAuth(req, reply);
    if (!s) return;
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: "VALIDATION", message: "El nombre debe tener entre 2 y 120 caracteres." } });
    }
    const p = await prisma.project.create({ data: { ownerId: s.id, name: parsed.data.name } });
    return reply.code(201).send({ id: p.id, name: p.name, visibility: p.visibility, status: p.status, createdAt: p.createdAt.toISOString(), documentCount: 0 });
  });

  async function ownedProject(req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) {
    const s = await requireAuth(req, reply);
    if (!s) return null;
    const { id } = req.params as { id: string };
    const p = await prisma.project.findUnique({ where: { id } });
    if (!p || p.ownerId !== s.id) {
      await reply.code(404).send({ error: { code: "NOT_FOUND", message: "Proyecto no encontrado." } });
      return null;
    }
    return { s, p };
  }

  app.get("/api/v1/projects/:id", async (req, reply) => {
    const ctx = await ownedProject(req, reply);
    if (!ctx) return;
    const docs = await prisma.sourceDocument.findMany({ where: { projectId: ctx.p.id }, orderBy: { createdAt: "desc" } });
    return {
      id: ctx.p.id,
      name: ctx.p.name,
      visibility: ctx.p.visibility,
      status: ctx.p.status,
      createdAt: ctx.p.createdAt.toISOString(),
      documentCount: docs.length,
      documents: docs.map(toDocDto),
    };
  });

  function toDocDto(d: {
    id: string; projectId: string; filename: string; mimeType: string; sizeBytes: bigint;
    status: string; pagesCount: number | null; extractedChars: number | null; errorMessage: string | null;
    rightsBasis: string | null; createdAt: Date;
  }) {
    return {
      id: d.id,
      projectId: d.projectId,
      filename: d.filename,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes.toString(),
      status: d.status,
      pagesCount: d.pagesCount,
      extractedChars: d.extractedChars,
      errorMessage: d.errorMessage,
      rightsBasis: d.rightsBasis,
      createdAt: d.createdAt.toISOString(),
    };
  }

  app.get("/api/v1/projects/:id/documents", async (req, reply) => {
    const ctx = await ownedProject(req, reply);
    if (!ctx) return;
    const docs = await prisma.sourceDocument.findMany({ where: { projectId: ctx.p.id }, orderBy: { createdAt: "desc" } });
    return docs.map(toDocDto);
  });

  // Subida de PDF: privado, validación real, declaración de derechos obligatoria
  app.post("/api/v1/projects/:id/documents", async (req, reply) => {
    const ctx = await ownedProject(req, reply);
    if (!ctx) return;
    if (!req.isMultipart()) {
      return reply.code(400).send({ error: { code: "MULTIPART_REQUIRED", message: "Envía el archivo como multipart/form-data." } });
    }
    const parts = req.parts();
    let meta: Record<string, string> = {};
    let savedPath: string | null = null;
    let filename = "";
    let size = 0;

    for await (const part of parts) {
      if (part.type === "file") {
        filename = part.filename;
        const key = storageKeyFor(ctx.s.id, filename);
        const dir = path.join(env.storageDir, ctx.s.id);
        fs.mkdirSync(dir, { recursive: true });
        savedPath = path.join(dir, path.basename(key));
        size = await new Promise<number>((resolve, reject) => {
          const ws = fs.createWriteStream(savedPath!);
          let total = 0;
          part.file.on("data", (c: Buffer) => (total += c.length));
          part.file.on("limit", () => reject(new Error("FILE_TOO_LARGE")));
          part.file.pipe(ws);
          ws.on("finish", () => resolve(total));
          ws.on("error", reject);
        }).catch(async (e) => {
          fs.rmSync(savedPath!, { force: true });
          throw e;
        });
      } else if (part.type === "field" && typeof part.value === "string") {
        meta[part.fieldname] = part.value;
      }
    }

    if (!savedPath) {
      return reply.code(400).send({ error: { code: "NO_FILE", message: "No se recibió ningún archivo." } });
    }

    const parsedMeta = uploadDocumentMetaSchema.safeParse({
      rightsDeclared: meta.rightsDeclared === "true",
      rightsBasis: meta.rightsBasis,
    });
    if (!parsedMeta.success) {
      fs.rmSync(savedPath, { force: true });
      return reply.code(400).send({ error: { code: "RIGHTS_REQUIRED", message: "Debes declarar derechos suficientes y su base (own_work, public_domain, licensed, permission)." } });
    }

    // Validación de tipo REAL por contenido, no por extensión
    const realPdf = (() => {
      try {
        const fd = fs.openSync(savedPath, "r");
        const buf = Buffer.alloc(5);
        const r = fs.readSync(fd, buf, 0, 5, 0);
        fs.closeSync(fd);
        return r === 5 && buf.toString("latin1") === "%PDF-";
      } catch {
        return false;
      }
    })();
    if (!realPdf) {
      fs.rmSync(savedPath, { force: true });
      return reply.code(400).send({ error: { code: "INVALID_TYPE", message: "El archivo no es un PDF real (validado por contenido)." } });
    }

    const checksum = sha256File(savedPath);
    const storageKey = `${ctx.s.id}/${path.basename(savedPath)}`;
    const doc = await prisma.sourceDocument.create({
      data: {
        projectId: ctx.p.id,
        ownerId: ctx.s.id,
        filename: filename.slice(0, 200),
        storageKey,
        mimeType: "application/pdf",
        sizeBytes: BigInt(size),
        checksumSha256: checksum,
        rightsDeclared: true,
        rightsBasis: parsedMeta.data.rightsBasis,
        status: "processing",
      },
    });
    const job = await prisma.documentProcessingJob.create({
      data: { documentId: doc.id, kind: "pdf_text_extraction", status: "running", startedAt: new Date() },
    });

    // Extracción síncrona en Fase 00 (documentada): worker dedicado llegará con jobs pesados
    const result = await extractPdfText(savedPath);
    if (result.ok) {
      await prisma.$transaction([
        prisma.documentPage.createMany({
          data: result.pages.map((p) => ({ documentId: doc.id, pageNumber: p.pageNumber, text: p.text, charCount: p.text.length })),
        }),
        prisma.sourceDocument.update({
          where: { id: doc.id },
          data: { status: "extracted", pagesCount: result.pagesCount, extractedChars: result.totalChars, errorMessage: null },
        }),
        prisma.documentProcessingJob.update({
          where: { id: job.id },
          data: { status: "succeeded", finishedAt: new Date() },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.sourceDocument.update({
          where: { id: doc.id },
          data: { status: result.status, pagesCount: result.pagesCount || null, extractedChars: result.totalChars, errorMessage: result.error ?? "Error de extracción" },
        }),
        prisma.documentProcessingJob.update({
          where: { id: job.id },
          data: { status: "failed", error: result.error ?? "Error", finishedAt: new Date() },
        }),
      ]);
    }

    const fresh = await prisma.sourceDocument.findUniqueOrThrow({ where: { id: doc.id } });
    return reply.code(201).send(toDocDto(fresh));
  });

  app.get("/api/v1/documents/:id", async (req, reply) => {
    const s = await requireAuth(req, reply);
    if (!s) return;
    const { id } = req.params as { id: string };
    const doc = await prisma.sourceDocument.findUnique({
      where: { id },
      include: { pages: { orderBy: { pageNumber: "asc" }, take: 50 } },
    });
    if (!doc || doc.ownerId !== s.id) {
      return reply.code(404).send({ error: { code: "NOT_FOUND", message: "Documento no encontrado." } });
    }
    return {
      document: toDocDto(doc),
      pages: doc.pages.map((p) => ({ pageNumber: p.pageNumber, charCount: p.charCount, text: p.text })),
    };
  });

  // ---------- MÓDULOS NO IMPLEMENTADOS: estado honesto (501) ----------
  const notImplemented = (module: string, phase: string) => async (_req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => {
    return reply.code(501).send({
      error: { code: "NOT_IMPLEMENTED", message: `El módulo ${module} está DISEÑADO pero no implementado. Previsto para ${phase}.` },
    });
  };
  app.route({ method: ["GET", "POST"], url: "/api/v1/cinema/*", handler: notImplemented("Andalus Cinema (generación audiovisual)", "Fases 03–06") });
  app.route({ method: ["GET", "POST"], url: "/api/v1/community/*", handler: notImplemented("Andalus Community", "Fase 08") });
  app.route({ method: ["GET", "POST"], url: "/api/v1/festivals/*", handler: notImplemented("Andalus Festivals", "Fase 09") });
  app.route({ method: ["POST"], url: "/api/v1/billing/checkout", handler: notImplemented("Pagos Stripe", "Fase 07 (pendiente de claves test y aprobación)") });

  return app;
}

// Arranque directo (solo cuando este archivo es el entrypoint real, no en tests)
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const isMain = invokedPath !== "" && /server\.(ts|js)$/.test(invokedPath) &&
  import.meta.url.endsWith(path.basename(invokedPath));
if (isMain) {
  const app = await buildServer();
  await app.listen({ port: env.port, host: "0.0.0.0" });
  console.log(`API Andalus Creative World escuchando en :${env.port}`);
}
