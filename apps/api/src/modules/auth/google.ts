// Google OpenID Connect — Authorization Code Flow con state + nonce.
// Implementado sobre openid-client (librería mantenida; no reinventamos OIDC).
// Validaciones: issuer, audience, expiry, nonce, state, sub estable.
// SI NO HAY CREDENCIALES: las rutas devuelven 503 con motivo honesto y el
// frontend muestra Google como "en preparación" (nunca como operativo).
import crypto from "node:crypto";
import { custom } from "openid-client";
import env from "../../config/env.js";
import { prisma } from "../../db.js";
import { signState, verifyState } from "./crypto.js";

const CLIENT_NAME = "google";

async function getGoogleClient() {
  const config = await custom(
    async () => ({
      issuer: "https://accounts.google.com",
      authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      token_endpoint: "https://oauth2.googleapis.com/token",
      jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
      response_types_supported: ["code"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "email", "profile"],
      subject_types_supported: ["public"],
      token_endpoint_auth_methods_supported: ["client_secret_post"],
      claims_supported: ["sub", "email", "email_verified", "name", "picture", "aud", "iss", "exp"],
    }),
    { client_id: env.google.clientId, client_secret: env.google.clientSecret },
  );
  return config;
}

export function googleEnabled(): boolean {
  return env.google.enabled;
}

export async function startAuth(reqId: string): Promise<{ url: string }> {
  if (!googleEnabled()) throw new Error("GOOGLE_NOT_CONFIGURED");
  const client = await getGoogleClient();
  const statePayload = { sid: reqId, iat: Date.now(), exp: Date.now() + 10 * 60 * 1000 };
  const nonce = crypto.randomBytes(24).toString("base64url");
  // Guardamos el nonce firmado en el propio state para no depender de almacenamiento extra
  const stateWithNonce = signState({ ...statePayload, nonce }, env.sessionSecret);
  const url = client.authorizationUrl({
    redirect_uri: env.google.redirectUri,
    scope: "openid email profile",
    state: stateWithNonce,
    nonce,
    prompt: "select_account",
  });
  return { url };
}

export interface GoogleIdentityResult {
  userId: string;
  isNewUser: boolean;
  email: string;
  displayName: string;
}

export async function completeAuth(params: {
  code?: string;
  state?: string;
}): Promise<GoogleIdentityResult> {
  if (!googleEnabled()) throw new Error("GOOGLE_NOT_CONFIGURED");
  if (!params.code || !params.state) throw new Error("MISSING_PARAMS");

  const stateData = verifyState(params.state, env.sessionSecret) as {
    sid: string;
    iat: number;
    exp: number;
    nonce: string;
  } | null;
  if (!stateData || stateData.exp < Date.now()) throw new Error("BAD_STATE");

  const client = await getGoogleClient();
  // grantIdempotent: exchange del código de autorización (el cliente valida JWT ID token:
  // iss, aud, exp y firma contra JWKS de Google automáticamente)
  const tokenSet = await client.callback(env.google.redirectUri, { code: params.code, state: params.state }, {
    state: stateData.sid,
    nonce: stateData.nonce,
  });

  const claims = tokenSet.claims();
  if (!claims.sub) throw new Error("NO_SUBJECT");
  if (claims.email_verified !== true && claims.email) {
    // No aceptamos emails no verificados por Google para crear cuentas
    throw new Error("EMAIL_NOT_VERIFIED_AT_PROVIDER");
  }
  const sub = String(claims.sub);
  const email = String(claims.email ?? "").toLowerCase();
  const name = String(claims.name ?? email.split("@")[0] ?? "");

  // Identidad externa estable: (provider, sub). NUNCA vincular solo por coincidencia de email
  // sin prueba de control; si existe un usuario con ese email pero sin identidad Google,
  // se requiere que el usuario inicie sesión con contraseña primero (flujo pendiente fase futura).
  const identity = await prisma.externalIdentity.findUnique({
    where: { provider_subject: { provider: CLIENT_NAME, subject: sub } },
  });

  if (identity) {
    return { userId: identity.userId, isNewUser: false, email, displayName: name };
  }

  // ¿Existe ya una cuenta de correo igual? No vinculamos automáticamente.
  const existingByEmail = email ? await prisma.user.findUnique({ where: { emailLower: email } }) : null;
  if (existingByEmail) {
    throw new Error("ACCOUNT_EXISTS_LINK_REQUIRED");
  }

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email,
        emailLower: email,
        displayName: name,
        passwordHash: null,
        emailVerifiedAt: new Date(), // Google ya verificó el correo (email_verified=true)
      },
    });
    await tx.creditWallet.create({ data: { userId: u.id } });
    await tx.externalIdentity.create({
      data: { userId: u.id, provider: CLIENT_NAME, subject: sub, emailAtProvider: email },
    });
    return u;
  });

  return { userId: user.id, isNewUser: true, email, displayName: name };
}
