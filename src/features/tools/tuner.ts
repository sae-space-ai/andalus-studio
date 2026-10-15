/**
 * Afinador - Motor Real
 * FASE 05 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const TunerInputSchema = z.object({
  frequency: z.number().positive().describe('Frecuencia en Hz'),
  referenceA4: z.number().positive().default(440).describe('Frecuencia de referencia para A4'),
});

export const TunerOutputSchema = z.object({
  detectedNote: z.string().describe('Nota detectada (ej: A4)'),
  midi: z.number().describe('Número MIDI más cercano'),
  octave: z.number().describe('Octava'),
  cents: z.number().describe('Desviación en cents (-50 a +50)'),
  frequency: z.number().describe('Frecuencia detectada'),
  exactFrequency: z.number().describe('Frecuencia exacta de la nota'),
  isInTune: z.boolean().describe('Si está dentro de ±5 cents'),
  direction: z.enum(['flat', 'sharp', 'in-tune']).describe('Dirección de la desviación'),
});

// ═══════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ═══════════════════════════════════════════
// MOTOR DE ANÁLISIS
// ═══════════════════════════════════════════

/**
 * Convierte frecuencia a número MIDI
 */
export function frequencyToMidi(frequency: number, referenceA4 = 440): number {
  return 69 + 12 * Math.log2(frequency / referenceA4);
}

/**
 * Convierte número MIDI a frecuencia
 */
export function midiToFrequency(midi: number, referenceA4 = 440): number {
  return referenceA4 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Obtiene el nombre de la nota desde MIDI
 */
export function getNoteName(midi: number): string {
  const noteIndex = Math.round(midi) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Obtiene la octava desde MIDI
 */
export function getOctave(midi: number): number {
  return Math.floor(Math.round(midi) / 12) - 1;
}

/**
 * Calcula la desviación en cents
 */
export function calculateCents(
  detectedFrequency: number,
  exactFrequency: number
): number {
  return 1200 * Math.log2(detectedFrequency / exactFrequency);
}

/**
 * Analiza una frecuencia y determina la nota más cercana
 */
export function analyzeFrequency(
  frequency: number,
  referenceA4 = 440
): z.infer<typeof TunerOutputSchema> {
  if (frequency <= 0) {
    throw new Error('La frecuencia debe ser mayor que 0');
  }

  // Convertir a MIDI (puede ser decimal)
  const exactMidi = frequencyToMidi(frequency, referenceA4);
  
  // Redondear al MIDI más cercano
  const nearestMidi = Math.round(exactMidi);
  
  // Obtener información de la nota
  const detectedNote = getNoteName(nearestMidi);
  const octave = getOctave(nearestMidi);
  
  // Calcular frecuencia exacta de la nota más cercana
  const exactFrequency = midiToFrequency(nearestMidi, referenceA4);
  
  // Calcular desviación en cents
  const cents = calculateCents(frequency, exactFrequency);
  
  // Determinar si está afinado (±5 cents)
  const isInTune = Math.abs(cents) <= 5;
  
  // Determinar dirección
  let direction: 'flat' | 'sharp' | 'in-tune';
  if (Math.abs(cents) <= 5) {
    direction = 'in-tune';
  } else if (cents < 0) {
    direction = 'flat';
  } else {
    direction = 'sharp';
  }

  return {
    detectedNote,
    midi: nearestMidi,
    octave,
    cents: Math.round(cents * 100) / 100,
    frequency,
    exactFrequency,
    isInTune,
    direction,
  };
}

/**
 * Analiza datos de audio usando autocorrelación
 * Este es un algoritmo simplificado para detección de pitch
 */
export function detectPitchFromAudioData(
  audioData: Float32Array,
  sampleRate: number,
  referenceA4 = 440
): z.infer<typeof TunerOutputSchema> | null {
  // Autocorrelación para encontrar el periodo fundamental
  const SIZE = audioData.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  
  let bestOffset = -1;
  let bestCorrelation = 0;
  let foundGoodCorrelation = false;

  // Buscar el mejor offset de correlación
  for (let offset = 10; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs((audioData[i]) - (audioData[i + offset]));
    }
    
    correlation = 1 - (correlation / MAX_SAMPLES);
    
    if (correlation > 0.9 && correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
      foundGoodCorrelation = true;
    }
  }

  if (!foundGoodCorrelation || bestOffset === -1) {
    return null; // No se detectó pitch
  }

  // Calcular frecuencia desde el periodo
  const frequency = sampleRate / bestOffset;
  
  // Analizar la frecuencia detectada
  return analyzeFrequency(frequency, referenceA4);
}

// ═══════════════════════════════════════════
// CLASE AFINADOR EN TIEMPO REAL
// ═══════════════════════════════════════════

export class RealTimeTuner {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private onPitchDetected: ((result: z.infer<typeof TunerOutputSchema> | null) => void) | null = null;
  private referenceA4 = 440;

  /**
   * Inicia el afinador en tiempo real
   */
  async start(
    onPitchDetected: (result: z.infer<typeof TunerOutputSchema> | null) => void
  ): Promise<void> {
    if (this.isRunning) return;

    this.onPitchDetected = onPitchDetected;

    // Solicitar acceso al micrófono
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
    } catch (error) {
      throw new Error('No se pudo acceder al micrófono. Verifica los permisos.');
    }

    // Configurar contexto de audio
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    
    source.connect(this.analyser);

    this.isRunning = true;
    this.detect();
  }

  /**
   * Loop de detección
   */
  private detect(): void {
    if (!this.isRunning || !this.analyser || !this.audioContext) return;

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    // Detectar pitch
    const result = detectPitchFromAudioData(buffer, this.audioContext.sampleRate, this.referenceA4);
    
    if (this.onPitchDetected) {
      this.onPitchDetected(result);
    }

    // Continuar detección
    this.animationFrameId = requestAnimationFrame(() => this.detect());
  }

  /**
   * Detiene el afinador
   */
  stop(): void {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }

  /**
   * Actualiza la frecuencia de referencia
   */
  setReferenceA4(frequency: number): void {
    this.referenceA4 = frequency;
  }

  /**
   * Verifica si está ejecutándose
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testTuner() {
  const tests = [
    {
      name: 'A4 = 440 Hz',
      frequency: 440,
      expected: { detectedNote: 'A4', midi: 69, cents: 0, isInTune: true },
    },
    {
      name: 'C4 = 261.63 Hz',
      frequency: 261.63,
      expected: { detectedNote: 'C4', midi: 60 },
    },
    {
      name: 'A4 ligeramente desafinado (442 Hz)',
      frequency: 442,
      expected: { detectedNote: 'A4', direction: 'sharp' },
    },
    {
      name: 'A4 ligeramente bajo (438 Hz)',
      frequency: 438,
      expected: { detectedNote: 'A4', direction: 'flat' },
    },
    {
      name: 'E4 = 329.63 Hz',
      frequency: 329.63,
      expected: { detectedNote: 'E4', midi: 64 },
    },
  ];

  const results = tests.map((test) => {
    try {
      const result = analyzeFrequency(test.frequency);
      
      const noteMatch = result.detectedNote === test.expected.detectedNote;
      const midiMatch = test.expected.midi ? result.midi === test.expected.midi : true;
      const directionMatch = test.expected.direction ? result.direction === test.expected.direction : true;
      const inTuneMatch = test.expected.isInTune !== undefined ? result.isInTune === test.expected.isInTune : true;

      return {
        name: test.name,
        passed: noteMatch && midiMatch && directionMatch && inTuneMatch,
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
