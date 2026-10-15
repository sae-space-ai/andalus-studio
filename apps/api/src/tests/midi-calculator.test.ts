/**
 * Tests de la Calculadora MIDI
 * ANDALUS STUDIO API - FASE 02
 */

import { describe, it, expect } from 'vitest';
import {
  midiToFrequency,
  frequencyToMidi,
  frequencyToNearestMidi,
  getNoteName,
  getOctave,
  calculateCents,
  verifyConversions,
} from '../modules/tools/midi-calculator';

describe('Calculadora MIDI', () => {
  describe('midiToFrequency', () => {
    it('convierte MIDI 69 a 440 Hz', () => {
      const freq = midiToFrequency(69);
      expect(freq).toBeCloseTo(440, 4);
    });

    it('convierte MIDI 60 a ~261.63 Hz (C4)', () => {
      const freq = midiToFrequency(60);
      expect(freq).toBeCloseTo(261.625565, 4);
    });

    it('convierte MIDI 0 a ~8.18 Hz', () => {
      const freq = midiToFrequency(0);
      expect(freq).toBeCloseTo(8.1758, 3);
    });

    it('convierte MIDI 127 a ~12543.88 Hz', () => {
      const freq = midiToFrequency(127);
      expect(freq).toBeCloseTo(12543.88, 1);
    });

    it('rechaza MIDI fuera de rango', () => {
      expect(() => midiToFrequency(-1)).toThrow();
      expect(() => midiToFrequency(128)).toThrow();
    });

    it('rechaza MIDI no entero', () => {
      expect(() => midiToFrequency(69.5)).toThrow();
    });

    it('usa frecuencia de afinación personalizada', () => {
      const freq = midiToFrequency(69, 442);
      expect(freq).toBeCloseTo(442, 4);
    });
  });

  describe('frequencyToMidi', () => {
    it('convierte 440 Hz a MIDI 69', () => {
      const midi = frequencyToNearestMidi(440);
      expect(midi).toBe(69);
    });

    it('convierte 880 Hz a MIDI 81 (A5)', () => {
      const midi = frequencyToNearestMidi(880);
      expect(midi).toBe(81);
    });

    it('convierte 261.63 Hz a MIDI 60 (C4)', () => {
      const midi = frequencyToNearestMidi(261.625565);
      expect(midi).toBe(60);
    });

    it('rechaza frecuencias no positivas', () => {
      expect(() => frequencyToMidi(0)).toThrow();
      expect(() => frequencyToMidi(-100)).toThrow();
    });

    it('rechaza frecuencias no finitas', () => {
      expect(() => frequencyToMidi(Infinity)).toThrow();
      expect(() => frequencyToMidi(NaN)).toThrow();
    });
  });

  describe('getNoteName', () => {
    it('devuelve el nombre correcto para MIDI 69', () => {
      expect(getNoteName(69)).toBe('A4');
    });

    it('devuelve el nombre correcto para MIDI 60', () => {
      expect(getNoteName(60)).toBe('C4');
    });

    it('devuelve el nombre correcto para MIDI 0', () => {
      expect(getNoteName(0)).toBe('C-1');
    });

    it('devuelve el nombre correcto para MIDI 127', () => {
      expect(getNoteName(127)).toBe('G9');
    });
  });

  describe('getOctave', () => {
    it('devuelve la octava correcta para MIDI 69', () => {
      expect(getOctave(69)).toBe(4);
    });

    it('devuelve la octava correcta para MIDI 60', () => {
      expect(getOctave(60)).toBe(4);
    });

    it('devuelve la octava correcta para MIDI 0', () => {
      expect(getOctave(0)).toBe(-1);
    });
  });

  describe('calculateCents', () => {
    it('calcula 0 cents para frecuencia exacta', () => {
      const cents = calculateCents(440, 69);
      expect(cents).toBeCloseTo(0, 4);
    });

    it('calcula cents positivos para frecuencia mayor', () => {
      const cents = calculateCents(445, 69);
      expect(cents).toBeGreaterThan(0);
    });

    it('calcula cents negativos para frecuencia menor', () => {
      const cents = calculateCents(435, 69);
      expect(cents).toBeLessThan(0);
    });
  });

  describe('verifyConversions', () => {
    it('todas las verificaciones pasan', () => {
      const result = verifyConversions();
      expect(result.passed).toBe(true);
      expect(result.tests.length).toBeGreaterThan(0);
      result.tests.forEach((test) => {
        expect(test.passed).toBe(true);
      });
    });
  });
});
