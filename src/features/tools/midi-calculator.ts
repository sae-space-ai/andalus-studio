/**
 * Calculadora MIDI - Motor Real
 * FASE 05 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const MidiToFrequencyInputSchema = z.object({
  midi: z.number().int().min(0).max(127).describe('Número MIDI (0-127)'),
  tuningFrequency: z.number().positive().default(440).describe('Frecuencia de referencia para A4 en Hz'),
});

export const FrequencyToMidiInputSchema = z.object({
  frequency: z.number().positive().describe('Frecuencia en Hz'),
  tuningFrequency: z.number().positive().default(440).describe('Frecuencia de referencia para A4 en Hz'),
});

export const MidiNoteOutputSchema = z.object({
  midi: z.number(),
  note: z.string(),
  octave: z.number(),
  frequency: z.number(),
  cents: z.number(),
});

// ═══════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ═══════════════════════════════════════════
// MOTOR DE CÁLCULO
// ═══════════════════════════════════════════

/**
 * Obtiene el nombre de la nota desde un número MIDI
 */
export function getNoteName(midi: number): string {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Obtiene la octava desde un número MIDI
 */
export function getOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/**
 * Convierte un número MIDI a frecuencia en Hz
 * Fórmula: f = A4 * 2^((midi - 69) / 12)
 */
export function midiToFrequency(
  midi: number,
  tuningFrequency: number = 440
): number {
  if (!Number.isInteger(midi)) {
    throw new Error('El número MIDI debe ser un entero');
  }
  
  if (midi < 0 || midi > 127) {
    throw new Error('El número MIDI debe estar entre 0 y 127');
  }
  
  if (!Number.isFinite(tuningFrequency) || tuningFrequency <= 0) {
    throw new Error('La frecuencia de afinación debe ser un número positivo finito');
  }

  return tuningFrequency * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convierte una frecuencia en Hz a número MIDI (puede ser decimal)
 * Fórmula: n = 69 + 12 * log2(f / A4)
 */
export function frequencyToMidi(
  frequency: number,
  tuningFrequency: number = 440
): number {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    throw new Error('La frecuencia debe ser un número positivo finito');
  }

  if (!Number.isFinite(tuningFrequency) || tuningFrequency <= 0) {
    throw new Error('La frecuencia de afinación debe ser un número positivo finito');
  }

  return 69 + 12 * Math.log2(frequency / tuningFrequency);
}

/**
 * Convierte una frecuencia al número MIDI entero más cercano
 */
export function frequencyToNearestMidi(
  frequency: number,
  tuningFrequency: number = 440
): number {
  return Math.round(frequencyToMidi(frequency, tuningFrequency));
}

/**
 * Calcula la desviación en cents desde la frecuencia exacta de la nota MIDI
 */
export function calculateCents(
  frequency: number,
  midi: number,
  tuningFrequency: number = 440
): number {
  const exactFrequency = midiToFrequency(midi, tuningFrequency);
  return 1200 * Math.log2(frequency / exactFrequency);
}

/**
 * Obtiene información completa de una nota MIDI
 */
export function getMidiNoteInfo(
  midi: number,
  tuningFrequency: number = 440
): z.infer<typeof MidiNoteOutputSchema> {
  const frequency = midiToFrequency(midi, tuningFrequency);
  const note = getNoteName(midi);
  const octave = getOctave(midi);

  return {
    midi,
    note,
    octave,
    frequency,
    cents: 0, // En temperamento igual, no hay desviación
  };
}

/**
 * Obtiene información completa desde una frecuencia
 */
export function getFrequencyNoteInfo(
  frequency: number,
  tuningFrequency: number = 440
): {
  midi: number;
  nearestMidi: number;
  note: string;
  octave: number;
  exactFrequency: number;
  cents: number;
} {
  const exactMidi = frequencyToMidi(frequency, tuningFrequency);
  const nearestMidi = Math.round(exactMidi);
  const note = getNoteName(nearestMidi);
  const octave = getOctave(nearestMidi);
  const exactFrequency = midiToFrequency(nearestMidi, tuningFrequency);
  const cents = calculateCents(frequency, nearestMidi, tuningFrequency);

  return {
    midi: exactMidi,
    nearestMidi,
    note,
    octave,
    exactFrequency,
    cents,
  };
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testMidiCalculator() {
  const tests = [
    {
      name: 'MIDI 69 → 440 Hz',
      test: () => {
        const freq = midiToFrequency(69);
        return Math.abs(freq - 440) < 0.0001;
      },
    },
    {
      name: 'MIDI 60 → 261.6256 Hz (C4)',
      test: () => {
        const freq = midiToFrequency(60);
        return Math.abs(freq - 261.625565) < 0.0001;
      },
    },
    {
      name: '440 Hz → MIDI 69',
      test: () => {
        const midi = frequencyToNearestMidi(440);
        return midi === 69;
      },
    },
    {
      name: '880 Hz → MIDI 81 (A5)',
      test: () => {
        const midi = frequencyToNearestMidi(880);
        return midi === 81;
      },
    },
    {
      name: 'MIDI 0 → 8.1758 Hz',
      test: () => {
        const freq = midiToFrequency(0);
        return Math.abs(freq - 8.1758) < 0.001;
      },
    },
  ];

  const results = tests.map((t) => {
    try {
      const passed = t.test();
      return { name: t.name, passed };
    } catch (error) {
      return { name: t.name, passed: false, error };
    }
  });

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
