// Configuración de entorno. Sin secretos hardcodeados.
// Si faltan credenciales externas, la capacidad correspondiente queda DESHABILITADA
// (honestidad técnica: nada se muestra como operativo sin configuración real).
import fs from "node:fs";
import path from "node:path";

function loadDotEnv() {
  const p = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}
loadDotEnv();

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}

const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.API_PORT ?? 3001),
  databaseUrl: req("DATABASE_URL"),
  sessionSecret: req("SESSION_SECRET"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  apiPublicUrl: process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 3001}`,

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
    get enabled(): boolean {
      return !!(this.clientId && this.clientSecret && this.redirectUri);
    },
  },

  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 1025),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "noreply@andaluscreative.world",
    get enabled(): boolean {
      return !!this.host;
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    get enabled(): boolean {
      return this.secretKey.startsWith("sk_test_");
    },
    get mode(): "test" | "live" | null {
      if (this.secretKey.startsWith("sk_test_")) return "test";
      if (this.secretKey.startsWith("sk_live_")) return "live"; // Fase 00: NO debe ocurrir
      return null;
    },
  },

  storageDir: process.env.STORAGE_DIR ?? "./storage-dev",
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB ?? 25) * 1024 * 1024,
};

if (env.stripe.mode === "live") {
  throw new Error("FASE 00: no se permite una clave Stripe LIVE. Usa sk_test_ o déjala vacía.");
}

export default env;
