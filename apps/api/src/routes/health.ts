/**
 * Rutas de Health Check
 * ANDALUS STUDIO API - FASE 02
 */

import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  /**
   * GET /api/health
   * Verifica que el servidor está funcionando
   */
  app.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  });

  /**
   * GET /api/ready
   * Verifica que el servidor está listo para recibir tráfico
   * (incluye verificación de base de datos)
   */
  app.get('/ready', async (request, reply) => {
    try {
      // Verificar conexión a base de datos
      const context = (app as any).context;
      await context.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(503).send({
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });
};
