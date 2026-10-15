/**
 * Calculadora de BPM - Motor Real
 * FASE 05 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const TapTempoInputSchema = z.object({
  taps: z.array(z.number()).min(2).describe('Array de timestamps en milisegundos'),
});

export const TapTempoOutputSchema = z.object({
  bpm: z.number().describe('Tempo calculado en BPM'),
  confidence: z.number().describe('Confianza del cálculo (0-1)'),
  averageInterval: z.number().describe('Intervalo promedio en ms'),
  tapCount: z.number().describe('Número de taps utilizados'),
});

// ═══════════════════════════════════════════
// MOTOR DE CÁLCULO
// ═══════════════════════════════════════════

/**
 * Calcula el BPM a partir de una serie de taps
 * 
 * Algoritmo:
 * 1. Calcular intervalos entre taps consecutivos
 * 2. Calcular promedio de intervalos
 * 3. Convertir a BPM: 60000 / promedio
 * 4. Calcular confianza basada en varianza
 */
export function calculateBPMFromTaps(taps: number[]): {
  bpm: number;
  confidence: number;
  averageInterval: number;
  tapCount: number;
} {
  if (taps.length < 2) {
    throw new Error('Se necesitan al menos 2 taps para calcular el BPM');
  }

  // Ordenar taps cronológicamente
  const sortedTaps = [...taps].sort((a, b) => a - b);

  // Calcular intervalos
  const intervals: number[] = [];
  for (let i = 1; i < sortedTaps.length; i++) {
    intervals.push(sortedTaps[i] - sortedTaps[i - 1]);
  }

  // Calcular promedio
  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  // Calcular BPM
  const bpm = 60000 / averageInterval;

  // Calcular confianza (basada en varianza)
  const variance = intervals.reduce((sum, interval) => {
    return sum + Math.pow(interval - averageInterval, 2);
  }, 0) / intervals.length;

  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / averageInterval;
  
  // Confianza: 1.0 es perfecto, 0.0 es muy inconsistente
  const confidence = Math.max(0, Math.min(1, 1 - coefficientOfVariation));

  return {
    bpm: Math.round(bpm * 100) / 100, // Redondear a 2 decimales
    confidence: Math.round(confidence * 100) / 100,
    averageInterval: Math.round(averageInterval * 100) / 100,
    tapCount: taps.length,
  };
}

/**
 * Calcula BPM a partir de duración total y número de beats
 */
export function calculateBPMFromDuration(
  totalDurationMs: number,
  beatCount: number
): {
  bpm: number;
  beatDuration: number;
} {
  if (beatCount <= 0) {
    throw new Error('El número de beats debe ser mayor que 0');
  }

  if (totalDurationMs <= 0) {
    throw new Error('La duración debe ser mayor que 0');
  }

  const beatDuration = totalDurationMs / beatCount;
  const bpm = 60000 / beatDuration;

  return {
    bpm: Math.round(bpm * 100) / 100,
    beatDuration: Math.round(beatDuration * 100) / 100,
  };
}

/**
 * Convierte BPM a duración de beat en milisegundos
 */
export function bpmToBeatDuration(bpm: number): number {
  if (bpm <= 0) {
    throw new Error('El BPM debe ser mayor que 0');
  }
  return 60000 / bpm;
}

/**
 * Convierte duración de beat a BPM
 */
export function beatDurationToBPM(beatDurationMs: number): number {
  if (beatDurationMs <= 0) {
    throw new Error('La duración del beat debe ser mayor que 0');
  }
  return 60000 / beatDurationMs;
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testBPMCalculator() {
  const tests = [
    {
      name: '120 BPM perfecto (500ms entre taps)',
      taps: [0, 500, 1000, 1500, 2000],
      expected: { bpm: 120, confidence: 1.0 },
    },
    {
      name: '60 BPM perfecto (1000ms entre taps)',
      taps: [0, 1000, 2000, 3000],
      expected: { bpm: 60, confidence: 1.0 },
    },
    {
      name: '180 BPM perfecto (333.33ms entre taps)',
      taps: [0, 333.33, 666.66, 999.99],
      expected: { bpm: 180, confidence: 1.0 },
    },
    {
      name: 'BPM con variación moderada',
      taps: [0, 500, 1020, 1480, 2010],
      expected: { confidence: 0.9 }, // Alta confianza pero no perfecta
    },
  ];

  const results = tests.map((test) => {
    try {
      const result = calculateBPMFromTaps(test.taps);
      
      const bpmMatch = test.expected.bpm 
        ? Math.abs(result.bpm - test.expected.bpm) < 0.1
        : true;
      
      const confidenceMatch = test.expected.confidence
        ? result.confidence >= test.expected.confidence
        : true;

      return {
        name: test.name,
        passed: bpmMatch && confidenceMatch,
        expected: test.expected,
        actual: result,
      };
    } catch (error) {
      return {
        name: test.name,
        passed: false,
        expected: test.expected,
        actual: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
