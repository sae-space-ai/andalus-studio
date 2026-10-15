/**
 * Sonificación Básica - Motor Real
 * FASE 05.1 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const SonificationInputSchema = z.object({
  data: z.array(z.number()).min(1).describe('Array de valores numéricos'),
  mapping: z.object({
    pitch: z.enum(['linear', 'logarithmic']).default('linear').describe('Mapeo de altura'),
    rhythm: z.enum(['linear', 'inverse']).default('linear').describe('Mapeo de ritmo'),
    duration: z.number().min(0.1).max(10).default(1).describe('Duración total en segundos'),
    minFrequency: z.number().min(20).max(20000).default(200).describe('Frecuencia mínima en Hz'),
    maxFrequency: z.number().min(20).max(20000).default(2000).describe('Frecuencia máxima en Hz'),
  }),
});

export const SonificationOutputSchema = z.object({
  events: z.array(z.object({
    time: z.number(),
    frequency: z.number(),
    duration: z.number(),
    value: z.number(),
  })),
  totalDuration: z.number(),
  minValue: z.number(),
  maxValue: z.number(),
  dataPoints: z.number(),
  mapping: z.object({
    pitch: z.string(),
    rhythm: z.string(),
    duration: z.number(),
    minFrequency: z.number(),
    maxFrequency: z.number(),
  }),
});

// Tipo exportado
export type SonificationOutput = z.infer<typeof SonificationOutputSchema>;

// ═══════════════════════════════════════════
// MOTOR DE SONIFICACIÓN
// ═══════════════════════════════════════════

/**
 * Normaliza un valor a un rango [0, 1]
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Mapea un valor normalizado a un rango de frecuencias (lineal)
 */
function mapLinear(normalized: number, minFreq: number, maxFreq: number): number {
  return minFreq + normalized * (maxFreq - minFreq);
}

/**
 * Mapea un valor normalizado a un rango de frecuencias (logarítmico)
 */
function mapLogarithmic(normalized: number, minFreq: number, maxFreq: number): number {
  const minLog = Math.log(minFreq);
  const maxLog = Math.log(maxFreq);
  return Math.exp(minLog + normalized * (maxLog - minLog));
}

/**
 * Sonifica un conjunto de datos
 */
export function sonify(
  data: number[],
  mapping: {
    pitch: 'linear' | 'logarithmic';
    rhythm: 'linear' | 'inverse';
    duration: number;
    minFrequency: number;
    maxFrequency: number;
  }
): SonificationOutput {
  if (data.length === 0) {
    throw new Error('El array de datos no puede estar vacío');
  }

  // Encontrar valores mínimo y máximo
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);

  // Calcular duración de cada evento
  const eventDuration = mapping.duration / data.length;

  // Generar eventos
  const events = data.map((value, index) => {
    const normalized = normalize(value, minValue, maxValue);
    
    // Mapeo de altura (frecuencia)
    let frequency: number;
    if (mapping.pitch === 'logarithmic') {
      frequency = mapLogarithmic(normalized, mapping.minFrequency, mapping.maxFrequency);
    } else {
      frequency = mapLinear(normalized, mapping.minFrequency, mapping.maxFrequency);
    }

    // Mapeo de ritmo (duración)
    let duration: number;
    if (mapping.rhythm === 'inverse') {
      // Valores más altos = notas más cortas
      duration = eventDuration * (1 - normalized * 0.5);
    } else {
      // Duración constante
      duration = eventDuration;
    }

    return {
      time: index * eventDuration,
      frequency: Math.round(frequency * 100) / 100,
      duration: Math.round(duration * 1000) / 1000,
      value,
    };
  });

  return {
    events,
    totalDuration: mapping.duration,
    minValue,
    maxValue,
    dataPoints: data.length,
    mapping: {
      pitch: mapping.pitch,
      rhythm: mapping.rhythm,
      duration: mapping.duration,
      minFrequency: mapping.minFrequency,
      maxFrequency: mapping.maxFrequency,
    },
  };
}

/**
 * Genera una representación MIDI de los datos sonificados
 */
export function sonifyToMidi(
  data: number[],
  mapping: {
    pitch: 'linear' | 'logarithmic';
    rhythm: 'linear' | 'inverse';
    duration: number;
    minFrequency: number;
    maxFrequency: number;
  }
): {
  notes: Array<{
    midi: number;
    time: number;
    duration: number;
    velocity: number;
  }>;
} {
  const sonification = sonify(data, mapping);
  
  // Convertir frecuencias a notas MIDI
  const notes = sonification.events.map((event: { time: number; frequency: number; duration: number; value: number }) => {
    const midi = Math.round(69 + 12 * Math.log2(event.frequency / 440));
    const clampedMidi = Math.max(0, Math.min(127, midi));
    
    return {
      midi: clampedMidi,
      time: event.time,
      duration: event.duration,
      velocity: 100, // Velocidad constante
    };
  });

  return { notes };
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testSonification() {
  const tests = [
    {
      name: 'Sonificación básica',
      data: [1, 2, 3, 4, 5],
      mapping: {
        pitch: 'linear' as const,
        rhythm: 'linear' as const,
        duration: 5,
        minFrequency: 200,
        maxFrequency: 2000,
      },
      expected: {
        dataPoints: 5,
        totalDuration: 5,
        minValue: 1,
        maxValue: 5,
      },
    },
    {
      name: 'Sonificación logarítmica',
      data: [100, 1000, 10000],
      mapping: {
        pitch: 'logarithmic' as const,
        rhythm: 'linear' as const,
        duration: 3,
        minFrequency: 100,
        maxFrequency: 10000,
      },
      expected: {
        dataPoints: 3,
        totalDuration: 3,
      },
    },
    {
      name: 'Conversión a MIDI',
      data: [440, 880],
      mapping: {
        pitch: 'linear' as const,
        rhythm: 'linear' as const,
        duration: 2,
        minFrequency: 440,
        maxFrequency: 880,
      },
      expected: {
        notes: 2,
      },
    },
  ];

  const results = tests.map((test) => {
    try {
      if ('notes' in test.expected) {
        const result = sonifyToMidi(test.data, test.mapping);
        const passed = result.notes.length === test.expected.notes;
        return { name: test.name, passed, expected: test.expected.notes, actual: result.notes.length };
      } else {
        const result = sonify(test.data, test.mapping);
        const passed = Object.entries(test.expected).every(([key, value]) => {
          return (result as any)[key] === value;
        });
        return { name: test.name, passed, expected: test.expected, actual: result };
      }
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
