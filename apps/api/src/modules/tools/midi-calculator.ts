/**
 * Motor de Calculadora MIDI - Primera Herramienta Verificable
 * ANDALUS STUDIO API - FASE 02
 * 
 * Implementa conversión entre notas MIDI y frecuencias
 * usando el sistema de temperamento igual de 12 notas.
 */

import { MidiToFrequencyRequest, FrequencyToMidiRequest, MidiNoteInfo, MidiToFrequencyResponse, FrequencyToMidiResponse } from '../../../../packages/shared/src/contracts';

// ═══════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const DEFAULT_TUNING_FREQUENCY = 440; // A4 = 440 Hz
const MIDI_A4 = 69; // MIDI note number for A4

// ═══════════════════════════════════════════
// CONVERSIÓN MIDI → FRECUENCIA
// ═══════════════════════════════════════════

/**
 * Convierte un número MIDI a frecuencia en Hz
 * Fórmula: f = 440 * 2^((n - 69) / 12)
 */
export function midiToFrequency(
  midi: number,
  tuningFrequency: number = DEFAULT_TUNING_FREQUENCY
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

  return tuningFrequency * Math.pow(2, (midi - MIDI_A4) / 12);
}

/**
 * Obtiene el nombre de la nota desde un número MIDI
 */
export function getNoteName(midi: number): string {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    throw new Error('El número MIDI debe ser un entero entre 0 y 127');
  }

  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Obtiene la octava desde un número MIDI
 */
export function getOctave(midi: number): number {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    throw new Error('El número MIDI debe ser un entero entre 0 y 127');
  }

  return Math.floor(midi / 12) - 1;
}

/**
 * Convierte MIDI a información completa de nota
 */
export function midiToNoteInfo(
  midi: number,
  tuningFrequency: number = DEFAULT_TUNING_FREQUENCY
): MidiNoteInfo {
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
 * Endpoint: MIDI → Frecuencia
 */
export function convertMidiToFrequency(
  request: MidiToFrequencyRequest
): MidiToFrequencyResponse {
  const tuningFrequency = request.tuningFrequency || DEFAULT_TUNING_FREQUENCY;
  const note = midiToNoteInfo(request.midi, tuningFrequency);

  return {
    note,
    tuningSystem: 'Equal Temperament (12-TET)',
    tuningFrequency,
  };
}

// ═══════════════════════════════════════════
// CONVERSIÓN FRECUENCIA → MIDI
// ═══════════════════════════════════════════

/**
 * Convierte una frecuencia a número MIDI (puede ser decimal)
 * Fórmula: n = 69 + 12 * log2(f / 440)
 */
export function frequencyToMidi(
  frequency: number,
  tuningFrequency: number = DEFAULT_TUNING_FREQUENCY
): number {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    throw new Error('La frecuencia debe ser un número positivo finito');
  }

  if (!Number.isFinite(tuningFrequency) || tuningFrequency <= 0) {
    throw new Error('La frecuencia de afinación debe ser un número positivo finito');
  }

  return MIDI_A4 + 12 * Math.log2(frequency / tuningFrequency);
}

/**
 * Convierte una frecuencia al número MIDI entero más cercano
 */
export function frequencyToNearestMidi(
  frequency: number,
  tuningFrequency: number = DEFAULT_TUNING_FREQUENCY
): number {
  const exactMidi = frequencyToMidi(frequency, tuningFrequency);
  return Math.round(exactMidi);
}

/**
 * Calcula la desviación en cents desde la frecuencia exacta de la nota MIDI
 */
export function calculateCents(
  frequency: number,
  midi: number,
  tuningFrequency: number = DEFAULT_TUNING_FREQUENCY
): number {
  const exactFrequency = midiToFrequency(midi, tuningFrequency);
  return 1200 * Math.log2(frequency / exactFrequency);
}

/**
 * Convierte frecuencia a información completa
 */
export function frequencyToNoteInfo(
  frequency: number,
  tuningFrequency: number = DEFAULT_TUNING_FREQUENCY
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

/**
 * Endpoint: Frecuencia → MIDI
 */
export function convertFrequencyToMidi(
  request: FrequencyToMidiRequest
): FrequencyToMidiResponse {
  const tuningFrequency = request.tuningFrequency || DEFAULT_TUNING_FREQUENCY;
  const info = frequencyToNoteInfo(request.frequency, tuningFrequency);

  return {
    ...info,
    tuningSystem: 'Equal Temperament (12-TET)',
    tuningFrequency,
  };
}

// ═══════════════════════════════════════════
// VERIFICACIONES
// ═══════════════════════════════════════════

/**
 * Verifica que las conversiones son correctas
 */
export function verifyConversions(): {
  passed: boolean;
  tests: Array<{ name: string; passed: boolean; expected: number; actual: number }>;
} {
  const tests: Array<{ name: string; passed: boolean; expected: number; actual: number }> = [];

  // Test 1: MIDI 69 → 440 Hz
  const test1 = midiToFrequency(69);
  tests.push({
    name: 'MIDI 69 → 440 Hz',
    passed: Math.abs(test1 - 440) < 0.0001,
    expected: 440,
    actual: test1,
  });

  // Test 2: MIDI 60 → ~261.63 Hz (C4)
  const test2 = midiToFrequency(60);
  tests.push({
    name: 'MIDI 60 → 261.6256 Hz (C4)',
    passed: Math.abs(test2 - 261.625565) < 0.0001,
    expected: 261.625565,
    actual: test2,
  });

  // Test 3: 440 Hz → MIDI 69
  const test3 = frequencyToNearestMidi(440);
  tests.push({
    name: '440 Hz → MIDI 69',
    passed: test3 === 69,
    expected: 69,
    actual: test3,
  });

  // Test 4: 880 Hz → MIDI 81 (A5)
  const test4 = frequencyToNearestMidi(880);
  tests.push({
    name: '880 Hz → MIDI 81 (A5)',
    passed: test4 === 81,
    expected: 81,
    actual: test4,
  });

  // Test 5: MIDI 0 → ~8.18 Hz
  const test5 = midiToFrequency(0);
  tests.push({
    name: 'MIDI 0 → 8.18 Hz',
    passed: Math.abs(test5 - 8.1758) < 0.001,
    expected: 8.1758,
    actual: test5,
  });

  // Test 6: MIDI 127 → ~12543.88 Hz
  const test6 = midiToFrequency(127);
  tests.push({
    name: 'MIDI 127 → 12543.88 Hz',
    passed: Math.abs(test6 - 12543.88) < 0.01,
    expected: 12543.88,
    actual: test6,
  });

  return {
    passed: tests.every((t) => t.passed),
    tests,
  };
}
