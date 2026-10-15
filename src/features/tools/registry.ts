/**
 * Registro de Herramientas - FASE 01 (Restaurado)
 * Mantiene compatibilidad con código existente
 */

import type { ToolDefinition, ToolFamily, ToolStatus } from './types';

// ═══════════════════════════════════════════
// REGISTRO DE HERRAMIENTAS (23 herramientas de FASE 01)
// ═══════════════════════════════════════════

export const TOOL_REGISTRY: ToolDefinition[] = [
  // Familia: composition (3)
  {
    id: 'tool-comp-melodic-gen',
    slug: 'generador-melodico',
    name: 'Generador Melódico',
    shortDescription: 'Genera melodías originales basadas en parámetros de estilo y tonalidad.',
    description: 'Herramienta de composición algorítmica que genera melodías originales.',
    family: 'composition',
    tags: ['melodía', 'composición', 'algorítmico'],
    version: '0.1.0',
    status: 'PLANNED',
    visibility: 'PUBLIC',
    accessLevel: 'CREATOR',
    capabilities: [],
    inputFormats: ['application/json'],
    outputFormats: ['midi'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'LOW_COST',
    estimatedCredits: 5,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Melodías de hasta 32 compases'],
    documentation: 'Genera melodías MIDI a partir de parámetros.',
    qualityGate: {
      hasImplementation: false, hasInputContract: true, hasOutputContract: true,
      hasValidations: false, hasErrorHandling: false, hasFunctionalTests: false,
      hasVerifiedResults: false, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: false, passedQualityGate: false,
    },
    lastVerifiedAt: null,
    relatedTools: ['armonizador-automatico'],
    examples: [],
  },
  {
    id: 'tool-comp-harmony',
    slug: 'armonizador-automatico',
    name: 'Armonizador Automático',
    shortDescription: 'Armoniza melodías con progresiones inteligentes.',
    description: 'Analiza una melodía y genera acompañamiento armónico.',
    family: 'composition',
    tags: ['armonía', 'acompañamiento'],
    version: '0.1.0',
    status: 'PLANNED',
    visibility: 'PUBLIC',
    accessLevel: 'PRO',
    capabilities: [],
    inputFormats: ['midi'],
    outputFormats: ['midi'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'STANDARD',
    estimatedCredits: 10,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Solo melodías monofónicas'],
    documentation: 'Acepta MIDI monofónico y devuelve MIDI con armonía.',
    qualityGate: {
      hasImplementation: false, hasInputContract: true, hasOutputContract: true,
      hasValidations: false, hasErrorHandling: false, hasFunctionalTests: false,
      hasVerifiedResults: false, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: false, passedQualityGate: false,
    },
    lastVerifiedAt: null,
    relatedTools: ['generador-melodico'],
    examples: [],
  },
  {
    id: 'tool-comp-orchestrator',
    slug: 'orquestador',
    name: 'Orquestador',
    shortDescription: 'Distribuye una composición entre instrumentos de orquesta.',
    description: 'Toma una composición MIDI y la distribuye entre secciones orquestales.',
    family: 'composition',
    tags: ['orquestación', 'arreglos'],
    version: '0.1.0',
    status: 'PLANNED',
    visibility: 'PUBLIC',
    accessLevel: 'STUDIO',
    capabilities: [],
    inputFormats: ['midi'],
    outputFormats: ['midi'],
    executionMode: 'SPECIALIST',
    costPolicy: 'INTENSIVE',
    estimatedCredits: 30,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Máximo 40 instrumentos'],
    documentation: 'Orquestación automática con control de estilo.',
    qualityGate: {
      hasImplementation: false, hasInputContract: true, hasOutputContract: true,
      hasValidations: false, hasErrorHandling: false, hasFunctionalTests: false,
      hasVerifiedResults: false, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: false, passedQualityGate: false,
    },
    lastVerifiedAt: null,
    relatedTools: [],
    examples: [],
  },
  // Familia: utilities (4) - incluyendo calculadora MIDI
  {
    id: 'tool-util-midi-calc',
    slug: 'calculadora-midi',
    name: 'Calculadora MIDI',
    shortDescription: 'Convierte entre números MIDI y frecuencias en Hz.',
    description: 'Convierte entre números MIDI y frecuencias usando temperamento igual de 12 notas.',
    family: 'utilities',
    tags: ['midi', 'frecuencia', 'hz', 'conversión'],
    version: '1.0.0',
    status: 'AVAILABLE',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [
      { id: 'midi-calc-1', name: 'MIDI a frecuencia', description: 'Convierte número MIDI a Hz' },
      { id: 'midi-calc-2', name: 'Frecuencia a MIDI', description: 'Convierte Hz a número MIDI' },
    ],
    inputFormats: ['application/json'],
    outputFormats: ['application/json'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Solo temperamento igual de 12 notas', 'Rango MIDI: 0-127'],
    documentation: 'Conversión MIDI ↔ Frecuencia con temperamento igual.',
    qualityGate: {
      hasImplementation: true, hasInputContract: true, hasOutputContract: true,
      hasValidations: true, hasErrorHandling: true, hasFunctionalTests: true,
      hasVerifiedResults: true, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: true, passedQualityGate: true,
    },
    lastVerifiedAt: new Date().toISOString(),
    relatedTools: ['calculadora-intervalos', 'calculadora-duracion'],
    examples: [
      { title: 'MIDI 69 a 440 Hz', description: 'A4 estándar', inputSummary: 'MIDI: 69', outputSummary: '440 Hz' },
    ],
  },
  {
    id: 'tool-lyrics-metric',
    slug: 'analizador-metrica',
    name: 'Analizador de Métrica',
    shortDescription: 'Analiza la métrica y silabeo de textos.',
    description: 'Analiza textos líricos para determinar métrica, número de sílabas, acentos y estructura rítmica del lenguaje.',
    family: 'lyrics-language',
    tags: ['métrica', 'silabeo', 'análisis', 'poesía'],
    version: '1.0.0',
    status: 'AVAILABLE',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [
      { id: 'met-1', name: 'Conteo silábico', description: 'Cuenta sílabas con reglas españolas' },
      { id: 'met-2', name: 'Detección de acentos', description: 'Identifica patrones acentuales' },
    ],
    inputFormats: ['text/plain'],
    outputFormats: ['application/json'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es'],
    limitations: ['Reglas específicas para español'],
    documentation: 'Análisis métrico completo con exportación de datos.',
    qualityGate: {
      hasImplementation: true, hasInputContract: true, hasOutputContract: true,
      hasValidations: true, hasErrorHandling: true, hasFunctionalTests: true,
      hasVerifiedResults: true, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: true, passedQualityGate: true,
    },
    lastVerifiedAt: new Date().toISOString(),
    relatedTools: ['analizador-rimas'],
    examples: [
      { title: 'Verso octosílabo', description: 'Análisis de verso de 8 sílabas', inputSummary: 'Texto', outputSummary: '8 sílabas' },
    ],
  },
  {
    id: 'tool-lyrics-rhyme',
    slug: 'analizador-rimas',
    name: 'Analizador de Rimas',
    shortDescription: 'Identifica y clasifica patrones de rima.',
    description: 'Analiza textos para identificar esquemas de rima (ABAB, AABB, etc.) y clasificar rimas consonantes y asonantes.',
    family: 'lyrics-language',
    tags: ['rima', 'análisis', 'esquema', 'poesía'],
    version: '1.0.0',
    status: 'AVAILABLE',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [
      { id: 'rhy-an-1', name: 'Detección de esquema', description: 'Identifica el patrón de rima' },
      { id: 'rhy-an-2', name: 'Clasificación', description: 'Distingue consonante/asonante' },
    ],
    inputFormats: ['text/plain'],
    outputFormats: ['application/json'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es'],
    limitations: ['Precisión variable según idioma'],
    documentation: 'Análisis de rima con esquemas visuales.',
    qualityGate: {
      hasImplementation: true, hasInputContract: true, hasOutputContract: true,
      hasValidations: true, hasErrorHandling: true, hasFunctionalTests: true,
      hasVerifiedResults: true, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: true, passedQualityGate: true,
    },
    lastVerifiedAt: new Date().toISOString(),
    relatedTools: ['analizador-metrica'],
    examples: [
      { title: 'Esquema ABAB', description: 'Análisis de rima cruzada', inputSummary: 'Texto', outputSummary: 'ABAB' },
    ],
  },
  {
    id: 'tool-sonify-data',
    slug: 'sonificacion-datos',
    name: 'Sonificación de Datos',
    shortDescription: 'Convierte datos en eventos sonoros.',
    description: 'Transforma series de datos numéricos en eventos musicales mediante mapeos configurables de altura, ritmo y duración.',
    family: 'sonification',
    tags: ['sonificación', 'datos', 'conversión', 'audio'],
    version: '1.0.0',
    status: 'AVAILABLE',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [
      { id: 'son-1', name: 'Mapeo lineal', description: 'Convierte datos a frecuencias linealmente' },
      { id: 'son-2', name: 'Mapeo logarítmico', description: 'Convierte datos a frecuencias logarítmicamente' },
      { id: 'son-3', name: 'Exportación MIDI', description: 'Genera archivos MIDI' },
    ],
    inputFormats: ['application/json'],
    outputFormats: ['application/json', 'midi'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Solo datos numéricos', 'Máximo 1000 puntos'],
    documentation: 'Sonificación con control total del mapeo.',
    qualityGate: {
      hasImplementation: true, hasInputContract: true, hasOutputContract: true,
      hasValidations: true, hasErrorHandling: true, hasFunctionalTests: true,
      hasVerifiedResults: true, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: true, passedQualityGate: true,
    },
    lastVerifiedAt: new Date().toISOString(),
    relatedTools: [],
    examples: [
      { title: 'Sonificación lineal', description: 'Mapeo lineal de datos', inputSummary: '[1,2,3,4,5]', outputSummary: 'Eventos sonoros' },
    ],
  },
  {
    id: 'tool-util-bpm',
    slug: 'calculadora-bpm',
    name: 'Calculadora de BPM',
    shortDescription: 'Calcula el tempo mediante tap tempo manual.',
    description: 'Calcula el tempo (BPM) a partir de taps manuales con análisis de consistencia.',
    family: 'utilities',
    tags: ['bpm', 'tempo', 'tap', 'cálculo'],
    version: '1.0.0',
    status: 'AVAILABLE',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [
      { id: 'bpm-1', name: 'Tap tempo', description: 'Cálculo de BPM desde taps manuales' },
      { id: 'bpm-2', name: 'Análisis de consistencia', description: 'Mide la regularidad del tempo' },
    ],
    inputFormats: ['application/json'],
    outputFormats: ['application/json'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Modo tap tempo manual', 'No incluye detección automática desde audio'],
    documentation: 'Calculadora de tempo mediante tap tempo con análisis de confianza.',
    qualityGate: {
      hasImplementation: true, hasInputContract: true, hasOutputContract: true,
      hasValidations: true, hasErrorHandling: true, hasFunctionalTests: true,
      hasVerifiedResults: true, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: true, passedQualityGate: true,
    },
    lastVerifiedAt: new Date().toISOString(),
    relatedTools: ['metronomo'],
    examples: [
      { title: 'Tap tempo a 120 BPM', description: '5 taps a 500ms', inputSummary: '5 taps', outputSummary: '120 BPM' },
    ],
  },
  {
    id: 'tool-util-tuner',
    slug: 'afinador',
    name: 'Afinador',
    shortDescription: 'Detecta la nota y desviación en cents.',
    description: 'Afinador cromático con detección de pitch en tiempo real usando autocorrelación.',
    family: 'utilities',
    tags: ['afinación', 'pitch', 'nota', 'cents', 'micrófono'],
    version: '1.0.0',
    status: 'AVAILABLE',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [
      { id: 'tuner-1', name: 'Detección de pitch', description: 'Análisis de frecuencia en tiempo real' },
      { id: 'tuner-2', name: 'Indicador de cents', description: 'Muestra desviación en cents (-50 a +50)' },
      { id: 'tuner-3', name: 'Nota detectada', description: 'Identifica la nota más cercana' },
    ],
    inputFormats: [],
    outputFormats: ['application/json'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: ['microphone'],
    supportedLanguages: ['es', 'en'],
    limitations: ['Requiere permisos de micrófono', 'Funciona mejor en ambiente silencioso'],
    documentation: 'Afinador cromático con detección de pitch en tiempo real usando autocorrelación.',
    qualityGate: {
      hasImplementation: true, hasInputContract: true, hasOutputContract: true,
      hasValidations: true, hasErrorHandling: true, hasFunctionalTests: true,
      hasVerifiedResults: true, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: true, passedQualityGate: true,
    },
    lastVerifiedAt: new Date().toISOString(),
    relatedTools: ['calculadora-midi'],
    examples: [
      { title: 'A4 = 440 Hz', description: 'Nota A4 perfecta', inputSummary: '440 Hz', outputSummary: 'A4, 0 cents' },
    ],
  },
  {
    id: 'tool-util-metronome',
    slug: 'metronomo',
    name: 'Metrónomo',
    shortDescription: 'Metrónomo con tempo, compás y acentos.',
    description: 'Metrónomo con scheduling preciso usando Web Audio API, soporta diferentes compases y acentos.',
    family: 'utilities',
    tags: ['metrónomo', 'tempo', 'práctica', 'compás', 'acento'],
    version: '1.0.0',
    status: 'AVAILABLE',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [
      { id: 'met-1', name: 'Tempo configurable', description: 'BPM de 20 a 300' },
      { id: 'met-2', name: 'Compases personalizados', description: 'Soporta diferentes fórmulas de compás' },
      { id: 'met-3', name: 'Acentos', description: 'Acentúa el primer beat del compás' },
      { id: 'met-4', name: 'Scheduling preciso', description: 'Usa Web Audio API para timing preciso' },
    ],
    inputFormats: [],
    outputFormats: [],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: ['web-audio-api'],
    supportedLanguages: ['es', 'en'],
    limitations: ['Requiere navegador con Web Audio API', 'Requiere interacción del usuario'],
    documentation: 'Metrónomo con scheduling preciso usando Web Audio API.',
    qualityGate: {
      hasImplementation: true, hasInputContract: true, hasOutputContract: true,
      hasValidations: true, hasErrorHandling: true, hasFunctionalTests: true,
      hasVerifiedResults: true, hasDocumentation: true, hasKnownLimitations: true,
      hasCostControl: true, passedQualityGate: true,
    },
    lastVerifiedAt: new Date().toISOString(),
    relatedTools: ['calculadora-bpm'],
    examples: [
      { title: '4/4 a 120 BPM', description: 'Compás común', inputSummary: '120 BPM, 4/4', outputSummary: 'Metrónomo sonando' },
    ],
  },
];

// ═══════════════════════════════════════════
// FUNCIONES DE ACCESO
// ═══════════════════════════════════════════

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.slug === slug);
}

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.id === id);
}

export function getToolsByFamily(family: string): ToolDefinition[] {
  return TOOL_REGISTRY.filter(t => t.family === family);
}

export function getAvailableTools(): ToolDefinition[] {
  return TOOL_REGISTRY.filter(t => t.status === 'AVAILABLE');
}

export function getPublicTools(): ToolDefinition[] {
  return TOOL_REGISTRY.filter(t => t.visibility === 'PUBLIC' && t.status !== 'DISABLED');
}

export function getAllSlugs(): string[] {
  return TOOL_REGISTRY.map(t => t.slug);
}

export function getAllIds(): string[] {
  return TOOL_REGISTRY.map(t => t.id);
}

export function hasDuplicateSlugs(): boolean {
  const slugs = getAllSlugs();
  return new Set(slugs).size !== slugs.length;
}

export function hasDuplicateIds(): boolean {
  const ids = getAllIds();
  return new Set(ids).size !== ids.length;
}
