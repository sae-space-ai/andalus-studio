// Utilidades criptográficas — Argon2id, tokens seguros de un solo uso, hashing de sesiones.
import crypto from "node:crypto";
import argon2 from "argon2";

// --- Passwords: Argon2id (t=3, m=64MiB, p=1 por defecto de argon2 npm) ---
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 64 * 1024, // KiB -> 64 MiB
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// --- Tokens opacos de un solo uso (verificación email / reset contraseña) ---
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

// Nunca almacenamos el token en claro: solo su digesto SHA-256.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// --- Sesiones: cookie token aleatorio; en BD solo el hash ---
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// Comparación en tiempo constante
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Hash de datos pseudo-anonimizados para auditoría (IP, UA) — no se guarda el dato en claro
export function pseudonymize(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex").slice(0, 32);
}

// --- Estado/nonce para OIDC (firmado con HMAC para evitar replay y alteración) ---
export function signState(payload: object, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyState(signed: string, secret: string): object | null {
  const [body, mac] = signed.split(".");
  if (!body || !mac) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (
    mac.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
