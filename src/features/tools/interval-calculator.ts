/**
 * Calculadora de Intervalos Musicales - Motor Real
 * FASE 05 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const IntervalInputSchema = z.object({
  midiFrom: z.number().int().min(0).max(127).describe('Nota MIDI de origen (0-127)'),
  midiTo: z.number().int().min(0).max(127).describe('Nota MIDI de destino (0-127)'),
});

export const IntervalOutputSchema = z.object({
  semitones: z.number().describe('Distancia en semitonos (con signo)'),
  absoluteSemitones: z.number().describe('Distancia absoluta en semitonos'),
  direction: z.enum(['ascending', 'descending', 'unison']).describe('Dirección del intervalo'),
  intervalName: z.string().describe('Nombre del intervalo (ej: "Quinta justa")'),
  intervalQuality: z.string().describe('Cualidad del intervalo'),
  intervalNumber: z.number().describe('Número del intervalo (1-15)'),
  octaves: z.number().describe('Número de octavas completas'),
  chromaticRemainder: z.number().describe('Resto cromático (0-11)'),
  frequencyRatio: z.number().describe('Relación de frecuencias (12-TET)'),
  cents: z.number().describe('Distancia en cents'),
});

// ═══════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const INTERVAL_NAMES: Record<number, { name: string; quality: string }> = {
  0: { name: 'Unísono', quality: 'perfecto' },
  1: { name: 'Segunda', quality: 'menor' },
  2: { name: 'Segunda', quality: 'mayor' },
  3: { name: 'Tercera', quality: 'menor' },
  4: { name: 'Tercera', quality: 'mayor' },
  5: { name: 'Cuarta', quality: 'perfecto' },
  6: { name: 'Tritono', quality: 'aumentado' },
  7: { name: 'Quinta', quality: 'perfecto' },
  8: { name: 'Sexta', quality: 'menor' },
  9: { name: 'Sexta', quality: 'mayor' },
  10: { name: 'Séptima', quality: 'menor' },
  11: { name: 'Séptima', quality: 'mayor' },
};

const INTERVAL_NUMBERS: Record<number, string> = {
  1: 'Unísono',
  2: 'Segunda',
  3: 'Tercera',
  4: 'Cuarta',
  5: 'Quinta',
  6: 'Sexta',
  7: 'Séptima',
  8: 'Octava',
  9: 'Novena',
  10: 'Décima',
  11: 'Undécima',
  12: 'Duodécima',
  13: 'Decimotercera',
  14: 'Decimocuarta',
  15: 'Decimoquinta',
};

// ═══════════════════════════════════════════
// MOTOR DE CÁLCULO
// ═══════════════════════════════════════════

/**
 * Obtiene el nombre de la nota desde MIDI
 */
export function getNoteName(midi: number): string {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Calcula el intervalo entre dos notas MIDI
 */
export function calculateInterval(
  midiFrom: number,
  midiTo: number
): z.infer<typeof IntervalOutputSchema> {
  if (midiFrom < 0 || midiFrom > 127 || midiTo < 0 || midiTo > 127) {
    throw new Error('Los números MIDI deben estar entre 0 y 127');
  }

  // Calcular distancia en semitonos
  const semitones = midiTo - midiFrom;
  const absoluteSemitones = Math.abs(semitones);

  // Determinar dirección
  let direction: 'ascending' | 'descending' | 'unison';
  if (semitones > 0) {
    direction = 'ascending';
  } else if (semitones < 0) {
    direction = 'descending';
  } else {
    direction = 'unison';
  }

  // Calcular octavas y resto cromático
  const octaves = Math.floor(absoluteSemitones / 12);
  const chromaticRemainder = absoluteSemitones % 12;

  // Calcular relación de frecuencias (12-TET)
  const frequencyRatio = Math.pow(2, absoluteSemitones / 12);

  // Calcular cents
  const cents = absoluteSemitones * 100;

  // Obtener nombre del intervalo
  const intervalInfo = INTERVAL_NAMES[chromaticRemainder];
  
  // Calcular número del intervalo
  let intervalNumber = chromaticRemainder + 1;
  if (octaves > 0) {
    intervalNumber += octaves * 7;
  }

  // Obtener nombre completo del intervalo
  const intervalName = INTERVAL_NUMBERS[intervalNumber] || intervalInfo.name;

  return {
    semitones,
    absoluteSemitones,
    direction,
    intervalName: octaves > 0 ? `${intervalName} (${octaves} octava${octaves > 1 ? 's' : ''})` : intervalName,
    intervalQuality: intervalInfo.quality,
    intervalNumber,
    octaves,
    chromaticRemainder,
    frequencyRatio,
    cents,
  };
}

/**
 * Calcula la nota destino dado una nota origen y un intervalo
 */
export function calculateNoteFromInterval(
  midiFrom: number,
  semitones: number
): {
  midiTo: number;
  noteName: string;
  octave: number;
} {
  if (midiFrom < 0 || midiFrom > 127) {
    throw new Error('El número MIDI debe estar entre 0 y 127');
  }

  const midiTo = midiFrom + semitones;

  if (midiTo < 0 || midiTo > 127) {
    throw new Error('La nota resultante está fuera del rango MIDI válido (0-127)');
  }

  return {
    midiTo,
    noteName: getNoteName(midiTo),
    octave: Math.floor(midiTo / 12) - 1,
  };
}

/**
 * Obtiene todos los intervalos comunes desde una nota
 */
export function getCommonIntervals(midiFrom: number): Array<{
  name: string;
  semitones: number;
  midiTo: number;
  noteName: string;
}> {
  const commonIntervals = [
    { name: 'Unísono', semitones: 0 },
    { name: 'Segunda menor', semitones: 1 },
    { name: 'Segunda mayor', semitones: 2 },
    { name: 'Tercera menor', semitones: 3 },
    { name: 'Tercera mayor', semitones: 4 },
    { name: 'Cuarta justa', semitones: 5 },
    { name: 'Tritono', semitones: 6 },
    { name: 'Quinta justa', semitones: 7 },
    { name: 'Sexta menor', semitones: 8 },
    { name: 'Sexta mayor', semitones: 9 },
    { name: 'Séptima menor', semitones: 10 },
    { name: 'Séptima mayor', semitones: 11 },
    { name: 'Octava', semitones: 12 },
  ];

  return commonIntervals
    .map((interval) => {
      const midiTo = midiFrom + interval.semitones;
      if (midiTo < 0 || midiTo > 127) {
        return null;
      }
      return {
        name: interval.name,
        semitones: interval.semitones,
        midiTo,
        noteName: getNoteName(midiTo),
      };
    })
    .filter((interval): interval is NonNullable<typeof interval> => interval !== null);
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testIntervalCalculator() {
  const tests = [
    {
      name: 'C4 a G4 = Quinta justa (+7 semitonos)',
      midiFrom: 60,
      midiTo: 67,
      expected: {
        semitones: 7,
        direction: 'ascending',
        chromaticRemainder: 7,
        intervalQuality: 'perfecto',
      },
    },
    {
      name: 'G4 a C4 = Quinta justa descendente (-7 semitonos)',
      midiFrom: 67,
      midiTo: 60,
      expected: {
        semitones: -7,
        direction: 'descending',
        absoluteSemitones: 7,
      },
    },
    {
      name: 'C4 a C5 = Octava (+12 semitonos)',
      midiFrom: 60,
      midiTo: 72,
      expected: {
        semitones: 12,
        octaves: 1,
        chromaticRemainder: 0,
      },
    },
    {
      name: 'A4 a A4 = Unísono (0 semitonos)',
      midiFrom: 69,
      midiTo: 69,
      expected: {
        semitones: 0,
        direction: 'unison',
      },
    },
    {
      name: 'C4 a F#4 = Tritono (+6 semitonos)',
      midiFrom: 60,
      midiTo: 66,
      expected: {
        semitones: 6,
        chromaticRemainder: 6,
        intervalQuality: 'aumentado',
      },
    },
    {
      name: 'C4 a E4 = Tercera mayor (+4 semitonos)',
      midiFrom: 60,
      midiTo: 64,
      expected: {
        semitones: 4,
        chromaticRemainder: 4,
        intervalQuality: 'mayor',
      },
    },
    {
      name: 'C4 a Eb4 = Tercera menor (+3 semitonos)',
      midiFrom: 60,
      midiTo: 63,
      expected: {
        semitones: 3,
        chromaticRemainder: 3,
        intervalQuality: 'menor',
      },
    },
  ];

  const results = tests.map((test) => {
    try {
      const result = calculateInterval(test.midiFrom, test.midiTo);
      
      const passed = Object.entries(test.expected).every(([key, value]) => {
        const actual = result[key as keyof typeof result];
        return actual === value;
      });

      return {
        name: test.name,
        passed,
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
