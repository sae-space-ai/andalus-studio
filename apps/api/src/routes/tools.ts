/**
 * Rutas de Herramientas Musicales
 * ANDALUS STUDIO API - FASE 02
 */

import { FastifyPluginAsync } from 'fastify';
import { MidiNoteSchema, FrequencySchema, MidiToFrequencyRequest, FrequencyToMidiRequest } from '../../../packages/shared/src/contracts';
import { convertMidiToFrequency, convertFrequencyToMidi, verifyConversions } from '../modules/tools/midi-calculator';

export const toolsRoutes: FastifyPluginAsync = async (app) => {
  // ═══════════════════════════════════════════
  // CALCULADORA MIDI - FRECUENCIA
  // ═══════════════════════════════════════════

  /**
   * POST /api/tools/midi-to-frequency
   * Convierte un número MIDI a frecuencia
   */
  app.post('/midi-to-frequency', async (request, reply) => {
    const body = request.body as MidiToFrequencyRequest;

    // Validar entrada
    const midiResult = MidiNoteSchema.safeParse(body.midi);
    if (!midiResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Número MIDI inválido',
          details: midiResult.error.format(),
        },
      });
    }

    try {
      const result = convertMidiToFrequency({
        midi: midiResult.data,
        tuningFrequency: body.tuningFrequency,
      });

      return result;
    } catch (error) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Error en la conversión',
        },
      });
    }
  });

  /**
   * POST /api/tools/frequency-to-midi
   * Convierte una frecuencia a número MIDI
   */
  app.post('/frequency-to-midi', async (request, reply) => {
    const body = request.body as FrequencyToMidiRequest;

    // Validar entrada
    const freqResult = FrequencySchema.safeParse(body.frequency);
    if (!freqResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Frecuencia inválida',
          details: freqResult.error.format(),
        },
      });
    }

    try {
      const result = convertFrequencyToMidi({
        frequency: freqResult.data,
        tuningFrequency: body.tuningFrequency,
      });

      return result;
    } catch (error) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Error en la conversión',
        },
      });
    }
  });

  /**
   * GET /api/tools/midi-calculator/verify
   * Verifica que las conversiones son correctas
   */
  app.get('/midi-calculator/verify', async (request, reply) => {
    const verification = verifyConversions();

    return {
      status: verification.passed ? 'ok' : 'failed',
      tests: verification.tests,
      timestamp: new Date().toISOString(),
    };
  });
};
