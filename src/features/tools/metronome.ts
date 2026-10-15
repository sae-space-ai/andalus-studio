/**
 * Metrónomo - Motor Real
 * FASE 05 - Herramienta Determinista
 */

import { z } from 'zod';

// ═══════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════

export const MetronomeConfigSchema = z.object({
  bpm: z.number().min(20).max(300).describe('Tempo en BPM (20-300)'),
  timeSignature: z.object({
    numerator: z.number().int().min(1).max(16).describe('Numerador del compás'),
    denominator: z.number().int().min(1).max(16).describe('Denominador del compás'),
  }),
  accentFirstBeat: z.boolean().default(true).describe('Acentuar el primer beat del compás'),
  soundType: z.enum(['click', 'beep', 'wood']).default('click').describe('Tipo de sonido'),
});

export const MetronomeStateSchema = z.object({
  isPlaying: z.boolean(),
  currentBeat: z.number(),
  currentBar: z.number(),
  startTime: z.number().nullable(),
  elapsedTime: z.number(),
});

// ═══════════════════════════════════════════
// MOTOR DEL METRÓNOMO
// ═══════════════════════════════════════════

export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private currentBeat = 0;
  private currentBar = 0;
  private startTime = 0;
  private nextNoteTime = 0;
  private timerID: number | null = null;
  private config: z.infer<typeof MetronomeConfigSchema>;
  private scheduleAheadTime = 0.1; // Segundos
  private lookahead = 25; // Milisegundos

  constructor(config: z.infer<typeof MetronomeConfigSchema>) {
    this.config = config;
  }

  /**
   * Inicializa el contexto de audio
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Calcula la duración de un beat en segundos
   */
  private getBeatDuration(): number {
    return 60.0 / this.config.bpm;
  }

  /**
   * Genera un sonido de click
   */
  private playClick(time: number, isAccent: boolean): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    // Frecuencia diferente para acento
    osc.frequency.value = isAccent ? 1000 : 800;
    
    // Volumen diferente para acento
    gain.gain.value = isAccent ? 0.3 : 0.1;

    // Duración del click
    const duration = 0.05; // 50ms
    gain.gain.setValueAtTime(gain.gain.value, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Programa el siguiente note
   */
  private scheduleNote(): void {
    if (!this.audioContext) return;

    const beatDuration = this.getBeatDuration();
    const isAccent = this.config.accentFirstBeat && this.currentBeat === 0;

    this.playClick(this.nextNoteTime, isAccent);

    // Avanzar al siguiente beat
    this.nextNoteTime += beatDuration;
    this.currentBeat++;

    // Si completamos un compás, avanzar al siguiente
    if (this.currentBeat >= this.config.timeSignature.numerator) {
      this.currentBeat = 0;
      this.currentBar++;
    }
  }

  /**
   * Scheduler principal
   */
  private scheduler(): void {
    if (!this.audioContext || !this.isPlaying) return;

    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote();
    }

    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  /**
   * Inicia el metrónomo
   */
  start(): void {
    if (this.isPlaying) return;

    this.initAudioContext();
    
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.currentBeat = 0;
    this.currentBar = 0;
    this.startTime = this.audioContext?.currentTime || 0;
    this.nextNoteTime = this.startTime;

    this.scheduler();
  }

  /**
   * Detiene el metrónomo
   */
  stop(): void {
    this.isPlaying = false;
    
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }

    this.currentBeat = 0;
    this.currentBar = 0;
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<z.infer<typeof MetronomeConfigSchema>>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene el estado actual
   */
  getState(): z.infer<typeof MetronomeStateSchema> {
    return {
      isPlaying: this.isPlaying,
      currentBeat: this.currentBeat,
      currentBar: this.currentBar,
      startTime: this.startTime || null,
      elapsedTime: this.audioContext ? this.audioContext.currentTime - this.startTime : 0,
    };
  }

  /**
   * Limpia recursos
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// ═══════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════

/**
 * Calcula la duración total de un número de compases
 */
export function calculateTotalDuration(
  bpm: number,
  timeSignature: { numerator: number; denominator: number },
  bars: number
): number {
  const beatDuration = 60 / bpm; // Segundos por beat
  const beatsPerBar = timeSignature.numerator * (4 / timeSignature.denominator);
  const totalBeats = beatsPerBar * bars;
  return totalBeats * beatDuration;
}

/**
 * Formatea tiempo en minutos:segundos
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

export function testMetronome() {
  const tests = [
    {
      name: 'Duración de 4 compases en 4/4 a 120 BPM',
      bpm: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      bars: 4,
      expected: 8, // 4 compases * 4 beats * 0.5s = 8s
    },
    {
      name: 'Duración de 1 compás en 3/4 a 60 BPM',
      bpm: 60,
      timeSignature: { numerator: 3, denominator: 4 },
      bars: 1,
      expected: 3, // 1 compás * 3 beats * 1s = 3s
    },
    {
      name: 'Duración de 2 compases en 6/8 a 120 BPM',
      bpm: 120,
      timeSignature: { numerator: 6, denominator: 8 },
      bars: 2,
      expected: 2, // 2 compases * 3 beats (6/8 = 3 negras) * 0.5s = 3s
    },
  ];

  const results = tests.map((test) => {
    const duration = calculateTotalDuration(test.bpm, test.timeSignature, test.bars);
    const passed = Math.abs(duration - test.expected) < 0.01;

    return {
      name: test.name,
      passed,
      expected: test.expected,
      actual: duration,
    };
  });

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
