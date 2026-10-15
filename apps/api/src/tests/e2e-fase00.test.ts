// =====================================================================
// PRUEBAS DE INTEGRACIÓN E2E REALES — FASE 00
// Requieren PostgreSQL (ver tests/README.md). NO usan mocks de BD.
// Cubren el primer flujo real de Fase 00:
// registro -> verificación email -> login -> dashboard -> proyecto ->
// subida PDF -> extracción real de texto -> persistencia -> logout -> relogin.
// =====================================================================
import { describe, it, expect, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildServer } from "../server.js";
import { prisma } from "../db.js";
import { hashToken } from "../modules/auth/crypto.js";
import { buildPdf, buildScannedPdf } from "./pdfgen.js";

const EMAIL = `test-e2e-${Date.now()}@example.com`;
const PASSWORD = "S3gura-Prueba-2026!";

let csrf = "";
const cookieJar: Record<string, string> = {};

function cookieHeader(): string {
  return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
}
function storeCookies(res: { headers: Record<string | number, string | string[] | undefined> }) {
  const raw = res.headers["set-cookie"];
  if (!raw) return;
  for (const c of Array.isArray(raw) ? raw : [raw]) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    cookieJar[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
}

async function call(method: string, url: string, body?: unknown, form?: FormData) {
  const payload = form !== undefined ? form : body !== undefined ? JSON.stringify(body) : undefined;
  const res = await app.inject({
    method,
    url,
    headers: {
      ...(payload !== undefined && form === undefined ? { "content-type": "application/json" } : {}),
      ...(method !== "GET" ? { "csrf-token": csrf } : {}),
      ...(Object.keys(cookieJar).length ? { cookie: cookieHeader() } : {}),
    },
    payload: payload as never,
  });
  storeCookies(res);
  return res;
}

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer();
});

describe("Fase 00 — flujo real de extremo a extremo", () => {
  it("01 health y capabilities honestas (Google/Stripe deshabilitados sin credenciales)", async () => {
    const h = await call("GET", "/health");
    expect(h.statusCode).toBe(200);
    const c = await call("GET", "/api/v1/capabilities");
    expect(c.statusCode).toBe(200);
    const cap = c.json() as { google: { enabled: boolean }; stripe: { enabled: boolean }; promotionWelcome20x20: { active: boolean } };
    // Sin credenciales reales en este entorno: NADA debe aparecer como operativo
    expect(cap.google.enabled).toBe(false);
    expect(cap.stripe.enabled).toBe(false);
    expect(cap.promotionWelcome20x20.active).toBe(false);
  });

  it("02 obtiene token CSRF", async () => {
    const r = await call("GET", "/api/v1/auth/csrf-token");
    expect(r.statusCode).toBe(200);
    csrf = (r.json() as { csrfToken: string }).csrfToken;
    expect(csrf.length).toBeGreaterThan(10);
  });

  it("03 rechaza POST sin CSRF (protección CSRF operativa)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ email: "no-csrf@example.com", password: PASSWORD }),
    });
    expect(res.statusCode).toBe(403);
  });

  it("04 valida formulario de registro (email inválido / contraseña corta)", async () => {
    const bad = await call("POST", "/api/v1/auth/register", { email: "no-es-email", password: PASSWORD });
    expect(bad.statusCode).toBe(400);
    const short = await call("POST", "/api/v1/auth/register", { email: "ok@example.com", password: "corta" });
    expect(short.statusCode).toBe(400);
  });

  it("05 registra cuenta con email real", async () => {
    const r = await call("POST", "/api/v1/auth/register", { email: EMAIL, password: PASSWORD, displayName: "Test E2E" });
    expect(r.statusCode).toBe(201);
    const u = await prisma.user.findUnique({ where: { emailLower: EMAIL.toLowerCase() } });
    expect(u).not.toBeNull();
    expect(u!.passwordHash).toMatch(/^\$argon2id\$/); // hashing Argon2id verificado
  });

  it("06 rechaza email duplicado", async () => {
    const r = await call("POST", "/api/v1/auth/register", { email: EMAIL.toUpperCase(), password: PASSWORD });
    expect([409, 400]).toContain(r.statusCode);
  });

  it("07 verifica el email mediante token de un solo uso (servicio de desarrollo)", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { emailLower: EMAIL.toLowerCase() } });
    const tok = await prisma.emailVerificationToken.findFirstOrThrow({ where: { userId: user.id } });
    // Recuperamos el token claro desde outbox de desarrollo
    const { devOutbox } = await import("../modules/email/email.js");
    const mail = devOutbox.find((m) => m.to === user.email && m.subject.includes("Verifica"));
    expect(mail).toBeDefined();
    const match = mail!.text.match(/token=([\w-]+)/);
    expect(match).not.toBeNull();
    const token = match![1];
    expect(hashToken(token)).toBe(tok.tokenHash); // coherencia token/hash

    const r = await call("POST", "/api/v1/auth/verify-email", { token });
    expect(r.statusCode).toBe(200);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.emailVerifiedAt).not.toBeNull();

    // Un solo uso: reutilizar el mismo token debe fallar
    const again = await call("POST", "/api/v1/auth/verify-email", { token });
    expect(again.statusCode).toBe(400);
  });

  it("08 rechaza login con contraseña incorrecta (sin filtración)", async () => {
    const r = await call("POST", "/api/v1/auth/login", { email: EMAIL, password: "Contrasena-Equivocada-1!" });
    expect(r.statusCode).toBe(401);
    expect(r.body).toContain("Correo o contraseña incorrectos");
  });

  it("09 inicia sesión y crea sesión HttpOnly persistente", async () => {
    const r = await call("POST", "/api/v1/auth/login", { email: EMAIL, password: PASSWORD });
    expect(r.statusCode).toBe(200);
    expect(cookieJar["acw_session"]).toBeTruthy();
    const me = await call("GET", "/api/v1/auth/me");
    expect(me.statusCode).toBe(200);
    const body = me.json() as { authenticated: boolean; user: { emailVerified: boolean } };
    expect(body.authenticated).toBe(true);
    expect(body.user.emailVerified).toBe(true);
  });

  it("10 dashboard autenticado: crea proyecto privado", async () => {
    const r = await call("POST", "/api/v1/projects", { name: "Mi Primera Novela" });
    expect(r.statusCode).toBe(201);
    const p = r.json() as { id: string; visibility: string };
    expect(p.visibility).toBe("private");
    projectId = p.id;
  });
  let projectId = "";

  it("11 lista proyectos del propietario", async () => {
    const r = await call("GET", "/api/v1/projects");
    expect(r.statusCode).toBe(200);
    const list = r.json() as Array<{ id: string }>;
    expect(list.some((p) => p.id === projectId)).toBe(true);
  });

  it("12 rechaza subir documento sin declaración de derechos", async () => {
    const form = new FormData();
    form.append("file", new Blob([buildPdf(["Texto cualquiera."])], { type: "application/pdf" }), "libro.pdf");
    const r = await call("POST", `/api/v1/projects/${projectId}/documents`, undefined, form);
    expect(r.statusCode).toBe(400);
    expect((r.json() as { error: { code: string } }).error.code).toBe("RIGHTS_REQUIRED");
  });

  it("13 rechaza archivo que no es PDF real (validación por contenido)", async () => {
    const form = new FormData();
    form.append("rightsDeclared", "true");
    form.append("rightsBasis", "own_work");
    form.append("file", new Blob([Buffer.from("esto no es un pdf")]), "falso.pdf");
    const r = await call("POST", `/api/v1/projects/${projectId}/documents`, undefined, form);
    expect(r.statusCode).toBe(400);
    expect((r.json() as { error: { code: string } }).error.code).toBe("INVALID_TYPE");
  });

  it("14 sube PDF autorizado y extrae TEXTO REAL por páginas", async () => {
    const text = "Capitulo 1. La ciudad de la memoria guardaba secretos entre sus murallas verdes.";
    const form = new FormData();
    form.append("rightsDeclared", "true");
    form.append("rightsBasis", "own_work");
    form.append("file", new Blob([buildPdf([text])], { type: "application/pdf" }), "mi-novela.pdf");
    const r = await call("POST", `/api/v1/projects/${projectId}/documents`, undefined, form);
    expect(r.statusCode).toBe(201);
    const doc = r.json() as { id: string; status: string; pagesCount: number | null; extractedChars: number | null };
    expect(doc.status).toBe("extracted");
    expect(doc.pagesCount).toBeGreaterThanOrEqual(1);
    expect(doc.extractedChars!).toBeGreaterThan(20);
    documentId = doc.id;

    const detail = await call("GET", `/api/v1/documents/${documentId}`);
    expect(detail.statusCode).toBe(200);
    const d = detail.json() as { pages: Array<{ pageNumber: number; text: string }> };
    expect(d.pages[0].pageNumber).toBe(1);
    expect(d.pages[0].text.toLowerCase()).toContain("capitulo");
    expect(d.pages[0].text.toLowerCase()).toContain("murallas verdes");
  });

  it("15 detecta documento escaneado -> needs_ocr, sin inventar texto", async () => {
    const form = new FormData();
    form.append("rightsDeclared", "true");
    form.append("rightsBasis", "own_work");
    form.append("file", new Blob([buildScannedPdf()], { type: "application/pdf" }), "escaneado.pdf");
    const r = await call("POST", `/api/v1/projects/${projectId}/documents`, undefined, form);
    expect(r.statusCode).toBe(201);
    const doc = r.json() as { status: string; errorMessage: string | null };
    expect(doc.status).toBe("needs_ocr");
    expect(doc.errorMessage).toContain("OCR");
  });

  it("16 aislamiento entre usuarios: otro usuario no ve el proyecto ni el documento", async () => {
    // Segundo usuario
    const jarBackup = { ...cookieJar };
    for (const k of Object.keys(cookieJar)) delete cookieJar[k];
    const otherEmail = `intruso-${Date.now()}@example.com`;
    await call("POST", "/api/v1/auth/register", { email: otherEmail, password: PASSWORD });
    await call("POST", "/api/v1/auth/login", { email: otherEmail, password: PASSWORD });
    const p = await call("GET", `/api/v1/projects/${projectId}`);
    expect(p.statusCode).toBe(404);
    const d = await call("GET", `/api/v1/documents/${documentId}`);
    expect(d.statusCode).toBe(404);
    const mine = await call("GET", "/api/v1/projects");
    expect((mine.json() as unknown[]).length).toBe(0);
    // restaurar sesión original
    for (const k of Object.keys(cookieJar)) delete cookieJar[k];
    Object.assign(cookieJar, jarBackup);
  });

  it("17 rutas de módulos no implementados responden 501 honesto", async () => {
    const c = await call("GET", "/api/v1/cinema/scenes");
    expect(c.statusCode).toBe(501);
    const f = await call("GET", "/api/v1/festivals/list");
    expect(f.statusCode).toBe(501);
    const checkout = await call("POST", "/api/v1/billing/checkout", {});
    expect(checkout.statusCode).toBe(501);
  });

  it("18 forgot/reset password con token caducable y de un solo uso", async () => {
    const fp = await call("POST", "/api/v1/auth/forgot-password", { email: EMAIL });
    expect(fp.statusCode).toBe(200);
    // respuesta idéntica para correo inexistente (anti enumeración)
    const fp2 = await call("POST", "/api/v1/auth/forgot-password", { email: "nadie-" + Date.now() + "@example.com" });
    expect(fp2.statusCode).toBe(200);
    expect(fp2.json()).toEqual(fp.json());

    const { devOutbox } = await import("../modules/email/email.js");
    const mail = [...devOutbox].reverse().find((m) => m.to === EMAIL && m.subject.includes("Restablecer"));
    expect(mail).toBeDefined();
    const token = mail!.text.match(/token=([\w-]+)/)![1];
    const NEWPASS = "Nueva-S3gura-Prueba!";
    const rp = await call("POST", "/api/v1/auth/reset-password", { token, password: NEWPASS });
    expect(rp.statusCode).toBe(200);
    // token usado una sola vez
    const rp2 = await call("POST", "/api/v1/auth/reset-password", { token, password: NEWPASS });
    expect(rp2.statusCode).toBe(400);
    // login con nueva contraseña
    for (const k of Object.keys(cookieJar)) delete cookieJar[k];
    const lg = await call("POST", "/api/v1/auth/login", { email: EMAIL, password: NEWPASS });
    expect(lg.statusCode).toBe(200);
    // la antigua ya no funciona
    for (const k of Object.keys(cookieJar)) delete cookieJar[k];
    const old = await call("POST", "/api/v1/auth/login", { email: EMAIL, password: PASSWORD });
    expect(old.statusCode).toBe(401);
    csrf = ((await call("GET", "/api/v1/auth/csrf-token")).json() as { csrfToken: string }).csrfToken ?? csrf;
  });

  it("19 logout y persistencia tras volver a entrar", async () => {
    // asegurar sesión activa
    const lg = await call("POST", "/api/v1/auth/login", { email: EMAIL, password: "Nueva-S3gura-Prueba!" });
    expect(lg.statusCode).toBe(200);
    const out = await call("POST", "/api/v1/auth/logout");
    expect(out.statusCode).toBe(200);
    const me = await call("GET", "/api/v1/auth/me");
    expect(me.statusCode).toBe(401);
    // relogin: proyecto y documento siguen guardados
    await call("POST", "/api/v1/auth/login", { email: EMAIL, password: "Nueva-S3gura-Prueba!" });
    const proj = await call("GET", `/api/v1/projects/${projectId}`);
    expect(proj.statusCode).toBe(200);
    const body = proj.json() as { documents: Array<{ id: string }> };
    expect(body.documents.some((d) => d.id === documentId)).toBe(true);
  });

  it("20 balance de créditos existe y es cero (sin cobros activados)", async () => {
    const b = await call("GET", "/api/v1/billing/balance");
    expect(b.statusCode).toBe(200);
    const bal = b.json() as { purchasedUnits: string; promoUnits: string };
    expect(bal.purchasedUnits).toBe("0");
    expect(bal.promoUnits).toBe("0");
  });

  it("21 eventos de seguridad registrados (auditoría)", async () => {
    const events = await prisma.securityEvent.count({ where: { type: "login_failed" } });
    expect(events).toBeGreaterThan(0);
  });
});
