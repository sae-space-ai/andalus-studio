/* ═══════════════════════════════════════════
   TIPOS DEL CATÁLOGO DE HERRAMIENTAS
   Andalus Studio — FASE 01
   ═══════════════════════════════════════════ */

// ─── ESTADOS DE HERRAMIENTA ───────────────
export type ToolStatus =
  | 'PLANNED'          // Prevista, no iniciada
  | 'IN_DEVELOPMENT'   // En construcción activa
  | 'TESTING'          // Sometida a pruebas
  | 'BETA'             // Ejecutable con limitaciones comunicadas
  | 'AVAILABLE'        // Funcional, superó control de calidad
  | 'DISABLED';        // Temporalmente no disponible

// ─── NIVEL DE ACCESO ──────────────────────
export type AccessLevel = 'FREE' | 'CREATOR' | 'PRO' | 'STUDIO' | 'ENTERPRISE';

// ─── MODO DE EJECUCIÓN ────────────────────
export type ExecutionMode =
  | 'DETERMINISTIC'    // Algoritmo local, sin IA
  | 'SERVICE'          // Servicio backend
  | 'SPECIALIST'       // Especialista IA
  | 'ORCHESTRATED';    // Múltiples especialistas coordinados

// ─── POLÍTICA DE COSTE ────────────────────
export type CostPolicy =
  | 'FREE_NO_LIMIT'    // Gratuita sin límite
  | 'FREE_LIMITED'     // Gratuita con límite diario
  | 'LOW_COST'         // Cálculo local económico
  | 'STANDARD'         // Procesamiento ligero
  | 'INTENSIVE'        // Procesamiento pesado
  | 'SPECIALIZED';     // Bajo condiciones específicas

// ─── FORMATO DE ENTRADA/SALIDA ─────────────
export type FileFormat =
  | 'audio/wav'
  | 'audio/mp3'
  | 'audio/flac'
  | 'audio/ogg'
  | 'audio/aac'
  | 'midi'
  | 'musicxml'
  | 'text/plain'
  | 'text/markdown'
  | 'image/png'
  | 'image/jpeg'
  | 'image/svg+xml'
  | 'video/mp4'
  | 'video/webm'
  | 'application/json'
  | 'application/pdf';

// ─── CAPACIDAD ─────────────────────────────
export interface ToolCapability {
  id: string;
  name: string;
  description: string;
}

// ─── CALIDAD ───────────────────────────────
export interface ToolQualityStatus {
  hasImplementation: boolean;
  hasInputContract: boolean;
  hasOutputContract: boolean;
  hasValidations: boolean;
  hasErrorHandling: boolean;
  hasFunctionalTests: boolean;
  hasVerifiedResults: boolean;
  hasDocumentation: boolean;
  hasKnownLimitations: boolean;
  hasCostControl: boolean;
  passedQualityGate: boolean;
}

// ─── FAMILIA / CATEGORÍA ───────────────────
export type ToolFamily =
  | 'composition'       // Composición musical
  | 'midi-theory'       // MIDI y teoría
  | 'lyrics-language'   // Letras y lenguaje
  | 'voice-singing'     // Voz y canto
  | 'audio-pro'         // Audio profesional
  | 'image-video'       // Imagen y vídeo
  | 'sonification'      // Sonificación
  | 'utilities'         // Utilidades musicales
  | 'education'         // Educación
  | 'studio';           // Estudio integrado

// ─── DEFINICIÓN DE HERRAMIENTA ─────────────
export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  family: ToolFamily;
  tags: string[];
  version: string;
  status: ToolStatus;
  visibility: 'PUBLIC' | 'AUTHENTICATED' | 'INTERNAL';
  accessLevel: AccessLevel;
  capabilities: ToolCapability[];
  inputFormats: FileFormat[];
  outputFormats: FileFormat[];
  executionMode: ExecutionMode;
  costPolicy: CostPolicy;
  estimatedCredits: number | null; // null = no definido aún
  requiredServices: string[];
  supportedLanguages: string[];
  limitations: string[];
  documentation: string;
  qualityGate: ToolQualityStatus;
  lastVerifiedAt: string | null; // null = nunca verificada
  relatedTools: string[]; // slugs de herramientas relacionadas
  examples: ToolExample[];
}

// ─── EJEMPLO DE USO ────────────────────────
export interface ToolExample {
  title: string;
  description: string;
  inputSummary: string;
  outputSummary: string;
}

// ─── CONTRATO DE EJECUCIÓN ─────────────────
export interface ToolInput {
  toolId: string;
  parameters: Record<string, unknown>;
  files?: File[];
}

export interface ToolOutput {
  toolId: string;
  runId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  results: Record<string, unknown>;
  artifacts: ToolArtifact[];
  creditsConsumed: number;
  executionTimeMs: number;
  warnings: string[];
}

export interface ToolArtifact {
  id: string;
  name: string;
  format: FileFormat;
  sizeBytes: number;
  downloadUrl: string | null;
  previewUrl: string | null;
}

export interface ToolExecutionContext {
  userId: string;
  organizationId: string;
  creditsAvailable: number;
  planAccessLevel: AccessLevel;
}

export interface ToolResult {
  ok: boolean;
  data?: ToolOutput;
  error?: ToolError;
}

export interface ToolError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ─── FAMILIAS METADATA ─────────────────────
export interface FamilyMetadata {
  id: ToolFamily;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const TOOL_FAMILIES: FamilyMetadata[] = [
  { id: 'composition', name: 'Composición Musical', icon: '🎼', description: 'Melodía, armonía, arreglos, orquestación y composición algorítmica.', color: '#007A3D' },
  { id: 'midi-theory', name: 'MIDI y Teoría', icon: '🎹', description: 'Análisis, armonización, partituras, tonalidad y conversión MIDI.', color: '#059669' },
  { id: 'lyrics-language', name: 'Letras y Lenguaje', icon: '✍️', description: 'Asistente de letras, métrica, rima, fonética y traducción.', color: '#0D9488' },
  { id: 'voice-singing', name: 'Voz y Canto', icon: '🎤', description: 'Procesamiento vocal, karaoke, locución y análisis de interpretación.', color: '#0284C7' },
  { id: 'audio-pro', name: 'Audio Profesional', icon: '🎧', description: 'Análisis espectral, restauración, mezcla, separación y masterización.', color: '#4F46E5' },
  { id: 'image-video', name: 'Imagen y Vídeo', icon: '🖼️', description: 'Portadas, vídeo musical, sincronización y visualizadores.', color: '#7C3AED' },
  { id: 'sonification', name: 'Sonificación', icon: '🔊', description: 'Transformación de datos en música y representación sonora.', color: '#9333EA' },
  { id: 'utilities', name: 'Utilidades Musicales', icon: '🔧', description: 'BPM, afinación, intervalos, metrónomo y conversión de notas.', color: '#C026D3' },
  { id: 'education', name: 'Educación', icon: '📚', description: 'Entrenamiento auditivo, teoría interactiva y análisis armónico.', color: '#E11D48' },
  { id: 'studio', name: 'Estudio Integrado', icon: '🎛️', description: 'Proyectos, grabaciones, versiones, exportaciones y dirección creativa.', color: '#DC2626' },
];

// ─── FUNCIONES DE UTILIDAD ─────────────────

export function getStatusLabel(status: ToolStatus): string {
  const labels: Record<ToolStatus, string> = {
    PLANNED: 'Planificada',
    IN_DEVELOPMENT: 'En desarrollo',
    TESTING: 'En pruebas',
    BETA: 'Beta',
    AVAILABLE: 'Disponible',
    DISABLED: 'Desactivada',
  };
  return labels[status];
}

export function getStatusColor(status: ToolStatus): string {
  const colors: Record<ToolStatus, string> = {
    PLANNED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    IN_DEVELOPMENT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    TESTING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    BETA: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    AVAILABLE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    DISABLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return colors[status];
}

export function getCostPolicyLabel(policy: CostPolicy): string {
  const labels: Record<CostPolicy, string> = {
    FREE_NO_LIMIT: 'Gratuita',
    FREE_LIMITED: 'Gratuita (limitada)',
    LOW_COST: 'Bajo coste',
    STANDARD: 'Estándar',
    INTENSIVE: 'Intensiva',
    SPECIALIZED: 'Especializada',
  };
  return labels[policy];
}

export function canToolExecute(tool: ToolDefinition): boolean {
  return tool.status === 'AVAILABLE' || tool.status === 'BETA';
}

export function isToolPublic(tool: ToolDefinition): boolean {
  return tool.visibility === 'PUBLIC' && tool.status !== 'DISABLED';
}
