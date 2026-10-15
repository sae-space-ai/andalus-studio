// =====================================================================
// @acw/contracts — Contratos compartidos API <-> Web (FASE 00)
// Validación con Zod. Versionado de API: prefijo /api/v1 en el servidor.
// =====================================================================
import { z } from "zod";

// ---------- AUTH ----------

export const emailSchema = z
  .string()
  .min(3)
  .max(254)
  .email("Correo electrónico no válido");

export const passwordSchema = z
  .string()
  .min(10, "La contraseña debe tener al menos 10 caracteres")
  .max(200);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(1).max(80).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10).max(200),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// DTOs de salida (nunca exponer hash, tokens ni campos internos)

export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
});
export type UserDto = z.infer<typeof userDtoSchema>;

export const authStatusSchema = z.object({
  authenticated: z.boolean(),
  user: userDtoSchema.nullable(),
});
export type AuthStatus = z.infer<typeof authStatusSchema>;

// Respuesta de capacidades reales del backend (honestidad técnica):
// el frontend SOLO muestra Google como operativo si google.enabled === true.
export const capabilitiesSchema = z.object({
  google: z.object({
    enabled: z.boolean(),
    reason: z.string().nullable(),
  }),
  stripe: z.object({
    enabled: z.boolean(),
    mode: z.enum(["none", "test", "live"]).nullable(),
  }),
  promotionWelcome20x20: z.object({
    active: z.boolean(),
    note: z.string(),
  }),
  apiVersion: z.string(),
});
export type Capabilities = z.infer<typeof capabilitiesSchema>;

// ---------- PROYECTOS ----------

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const projectDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  visibility: z.enum(["private", "public"]),
  status: z.enum(["draft", "active", "archived"]),
  createdAt: z.string(),
  documentCount: z.number().int().min(0),
});
export type ProjectDto = z.infer<typeof projectDtoSchema>;

// ---------- DOCUMENTOS ----------

export const RIGHTS_BASES = [
  "own_work",
  "public_domain",
  "licensed",
  "permission",
] as const;

export const uploadDocumentMetaSchema = z.object({
  rightsDeclared: z.literal(true, {
    errorMap: () => ({
      message: "Debes declarar que posees derechos suficientes para adaptar este material.",
    }),
  }),
  rightsBasis: z.enum(RIGHTS_BASES),
});
export type UploadDocumentMeta = z.infer<typeof uploadDocumentMetaSchema>;

export const documentStatusSchema = z.enum([
  "uploaded",
  "processing",
  "extracted",
  "failed",
  "needs_ocr",
]);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const documentDtoSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.string(), // BigInt serializado como string
  status: documentStatusSchema,
  pagesCount: z.number().int().nullable(),
  extractedChars: z.number().int().nullable(),
  errorMessage: z.string().nullable(),
  rightsBasis: z.string().nullable(),
  createdAt: z.string(),
});
export type DocumentDto = z.infer<typeof documentDtoSchema>;

export const documentPageDtoSchema = z.object({
  pageNumber: z.number().int().min(1),
  charCount: z.number().int().min(0),
  text: z.string(),
});
export type DocumentPageDto = z.infer<typeof documentPageDtoSchema>;

export const documentDetailSchema = z.object({
  document: documentDtoSchema,
  pages: z.array(documentPageDtoSchema),
});
export type DocumentDetail = z.infer<typeof documentDetailSchema>;

// ---------- CUENTA / ECONOMÍA (solo lectura en Fase 00) ----------

export const balanceDtoSchema = z.object({
  purchasedUnits: z.string(),
  promoUnits: z.string(),
  reservedUnits: z.string(),
  consumedUnits: z.string(),
  currencyCode: z.string(),
  conversionVersion: z.string(),
});
export type BalanceDto = z.infer<typeof balanceDtoSchema>;

// ---------- ERRORES ----------

export const errorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ApiError = z.infer<typeof errorSchema>;

export const API_VERSION = "v1";
