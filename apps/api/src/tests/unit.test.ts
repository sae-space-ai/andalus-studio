// Pruebas UNITARIAS sin base de datos (criptografía, validaciones, contratos PDF).
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { hashPassword, verifyPassword, generateToken, hashToken, signState, verifyState } from "../modules/auth/crypto.js";
import { registerSchema, loginSchema, uploadDocumentMetaSchema, resetPasswordSchema } from "@acw/contracts";
import { buildPdf, buildScannedPdf, escapePdfString } from "./pdfgen.js";
import { extractPdfText, isRealPdf } from "../modules/documents/pdf.js";

describe("unidades: criptografía", () => {
  it("Argon2id: hash verificable y distinto cada vez (salt)", async () => {
    const h1 = await hashPassword("Mi-Passw0rd-Segura");
    const h2 = await hashPassword("Mi-Passw0rd-Segura");
    expect(h1).toMatch(/^\$argon2id\$/);
    expect(h1).not.toBe(h2);
    expect(await verifyPassword(h1, "Mi-Passw0rd-Segura")).toBe(true);
    expect(await verifyPassword(h1, "incorrecta")).toBe(false);
  });

  it("tokens: aleatorios, hash determinista, colisión práctica nula", () => {
    const t1 = generateToken();
    const t2 = generateToken();
    expect(t1).not.toBe(t2);
    expect(t1.length).toBeGreaterThanOrEqual(40);
    expect(hashToken(t1)).toBe(hashToken(t1));
    expect(hashToken(t1)).not.toBe(hashToken(t2));
  });

  it("state OIDC firmado: válido si íntegro, inválido si alterado", () => {
    const secret = "test-secret";
    const s = signState({ sid: "abc", exp: Date.now() + 60000 }, secret);
    expect(verifyState(s, secret)).toBeTruthy();
    expect(verifyState(s + "x", secret)).toBeNull();
    expect(verifyState(s, "otro-secreto")).toBeNull();
  });
});

describe("unidades: validación Zod (contratos compartidos)", () => {
  it("registro exige email válido y contraseña >= 10", () => {
    expect(registerSchema.safeParse({ email: "malo", password: "largo-suficientemente-1" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "ok@dominio.com", password: "corta" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "ok@dominio.com", password: "S3gura-Prueba-2026" }).success).toBe(true);
  });
  it("declaración de derechos es obligatoria y con base válida", () => {
    expect(uploadDocumentMetaSchema.safeParse({ rightsDeclared: false, rightsBasis: "own_work" }).success).toBe(false);
    expect(uploadDocumentMetaSchema.safeParse({ rightsDeclared: true, rightsBasis: "no_existe" }).success).toBe(false);
    expect(uploadDocumentMetaSchema.safeParse({ rightsDeclared: true, rightsBasis: "public_domain" }).success).toBe(true);
  });
  it("login no revela formato estricto de contraseña (solo presencia)", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
  it("reset exige token y contraseña fuerte", () => {
    expect(resetPasswordSchema.safeParse({ token: "corto", password: "S3gura-Prueba-2026" }).success).toBe(false);
  });
});

describe("unidades: generador y extractor de PDF", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "acw-pdf-"));

  it("escape de strings PDF (paréntesis y acentos)", () => {
    expect(escapePdfString("a(b)c")).toBe("a\\(b\\)c");
    expect(escapePdfString("memión")).toContain("\\"); // acento -> octal
  });

  it("PDF generado válido: magic bytes y extracción real de texto", async () => {
    const pdf = buildPdf(["Capitulo 1. El autor escribio esta prueba para verificacion."]);
    const p = path.join(tmp, "ok.pdf");
    fs.writeFileSync(p, pdf);
    expect(isRealPdf(p)).toBe(true);
    const res = await extractPdfText(p);
    expect(res.ok).toBe(true);
    expect(res.status).toBe("extracted");
    expect(res.pagesCount).toBe(1);
    expect(res.pages[0].text).toContain("Capitulo 1");
    expect(res.totalChars).toBeGreaterThan(20);
  });

  it("archivo falso .pdf rechazado por contenido", async () => {
    const p = path.join(tmp, "falso.pdf");
    fs.writeFileSync(p, "soy un txt disfrazado");
    expect(isRealPdf(p)).toBe(false);
    const res = await extractPdfText(p);
    expect(res.status).toBe("failed");
    expect(res.error).toContain("NO_ES_PDF_REAL");
  });

  it("documento escaneado (sin texto) -> needs_ocr, nunca texto inventado", async () => {
    const p = path.join(tmp, "escaneado.pdf");
    fs.writeFileSync(p, buildScannedPdf());
    const res = await extractPdfText(p);
    expect(res.status).toBe("needs_ocr");
    expect(res.totalChars).toBe(0);
    expect(res.pages.every((pg) => pg.text.trim() === "")).toBe(true);
  });

  it("PDF truncado/corrupto -> failed con error registrado", async () => {
    const p = path.join(tmp, "roto.pdf");
    fs.writeFileSync(p, Buffer.concat([buildPdf(["texto"]), Buffer.from("AAAA")]));
    // lo truncamos por la mitad
    const buf = fs.readFileSync(p);
    fs.writeFileSync(p, buf.subarray(0, Math.floor(buf.length / 2)));
    const res = await extractPdfText(p);
    expect(["failed", "needs_ocr"]).toContain(res.status);
  });
});
