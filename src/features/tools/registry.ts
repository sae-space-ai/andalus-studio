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
    id: 'tool-util-bpm',
    slug: 'calculadora-bpm',
    name: 'Calculadora de BPM',
    shortDescription: 'Detecta o calcula el tempo de un audio.',
    description: 'Detecta el tempo (BPM) de un archivo de audio o permite calcularlo manualmente.',
    family: 'utilities',
    tags: ['bpm', 'tempo', 'detección'],
    version: '0.1.0',
    status: 'PLANNED',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [],
    inputFormats: ['audio/wav'],
    outputFormats: ['application/json'],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Detección más precisa con audio rítmico'],
    documentation: 'Calculadora de tempo con detección y tap.',
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
  {
    id: 'tool-util-tuner',
    slug: 'afinador',
    name: 'Afinador',
    shortDescription: 'Afina instrumentos detectando la nota.',
    description: 'Detecta la nota que se está tocando y muestra la desviación.',
    family: 'utilities',
    tags: ['afinación', 'pitch', 'nota'],
    version: '0.1.0',
    status: 'PLANNED',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [],
    inputFormats: [],
    outputFormats: [],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Requiere micrófono'],
    documentation: 'Afinador cromático con detección en tiempo real.',
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
  {
    id: 'tool-util-metronome',
    slug: 'metronomo',
    name: 'Metrónomo',
    shortDescription: 'Metrónomo con control de tempo y compás.',
    description: 'Metrónomo visual y sonoro con control de BPM, compás y acentos.',
    family: 'utilities',
    tags: ['metrónomo', 'tempo', 'práctica'],
    version: '0.1.0',
    status: 'PLANNED',
    visibility: 'PUBLIC',
    accessLevel: 'FREE',
    capabilities: [],
    inputFormats: [],
    outputFormats: [],
    executionMode: 'DETERMINISTIC',
    costPolicy: 'FREE_NO_LIMIT',
    estimatedCredits: 0,
    requiredServices: [],
    supportedLanguages: ['es', 'en'],
    limitations: ['Requiere interacción del usuario'],
    documentation: 'Metrónomo con interfaz visual y sonora.',
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
