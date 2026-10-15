/**
 * Rutas de Créditos - FASE 03
 * Maneja saldo, ledger y operaciones de créditos
 */

import { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../modules/sessions/session';
import { getWalletBalance, getLedgerHistory, reconcileWallet } from '../modules/credits/credits';

export const creditsRoutes: FastifyPluginAsync = async (app) => {
  const context = (app as any).context;

  // ═══════════════════════════════════════════
  // OBTENER BALANCE
  // ═══════════════════════════════════════════

  app.get('/balance', async (request, reply) => {
    const session = await requireAuth(request, reply);

    const wallet = await context.prisma.wallet.findUnique({
      where: { organizationId: session.organizationId },
    });

    if (!wallet) {
      return {
        balance: 0,
        totalReserved: 0,
        availableBalance: 0,
        totalCredits: 0,
        totalConsumed: 0,
      };
    }

    return {
      balance: wallet.balance,
      totalReserved: wallet.totalReserved,
      availableBalance: wallet.balance - wallet.totalReserved,
      totalCredits: wallet.totalCredits,
      totalConsumed: wallet.totalConsumed,
    };
  });

  // ═══════════════════════════════════════════
  // OBTENER HISTORIAL DEL LEDGER
  // ═══════════════════════════════════════════

  app.get('/ledger', async (request, reply) => {
    const session = await requireAuth(request, reply);

    const wallet = await context.prisma.wallet.findUnique({
      where: { organizationId: session.organizationId },
    });

    if (!wallet) {
      return {
        entries: [],
        total: 0,
      };
    }

    const query = request.query as { limit?: string; offset?: string };
    const limit = parseInt(query.limit || '50');
    const offset = parseInt(query.offset || '0');

    const history = await getLedgerHistory(context.prisma, wallet.id, limit, offset);

    return {
      entries: history.entries.map((entry: any) => ({
        id: entry.id,
        entryType: entry.entryType,
        amount: entry.amount,
        balanceAfter: entry.balanceAfter,
        description: entry.description,
        relatedJobId: entry.relatedJobId,
        relatedInvoiceId: entry.relatedInvoiceId,
        createdAt: entry.createdAt,
      })),
      total: history.total,
    };
  });

  // ═══════════════════════════════════════════
  // OBTENER TRABAJOS RECIENTES
  // ═══════════════════════════════════════════

  app.get('/jobs', async (request, reply) => {
    const session = await requireAuth(request, reply);

    const jobs = await context.prisma.toolUsageJob.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      jobs: jobs.map((job: any) => ({
        id: job.id,
        toolId: job.toolId,
        status: job.status,
        quotedCredits: job.quotedCredits,
        reservedCredits: job.reservedCredits,
        consumedCredits: job.consumedCredits,
        refundedCredits: job.refundedCredits,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
      })),
    };
  });

  // ═══════════════════════════════════════════
  // RECONCILIAR WALLET (ADMIN)
  // ═══════════════════════════════════════════

  app.post('/reconcile', async (request, reply) => {
    const session = await requireAuth(request, reply);

    // Verificar que el usuario es ADMIN
    const user = await context.prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
    });

    if (user.role !== 'ADMIN') {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'Solo administradores pueden reconciliar wallets',
        },
      });
    }

    const wallet = await context.prisma.wallet.findUnique({
      where: { organizationId: session.organizationId },
    });

    if (!wallet) {
      return reply.status(404).send({
        error: {
          code: 'WALLET_NOT_FOUND',
          message: 'Wallet no encontrada',
        },
      });
    }

    const reconciliation = await reconcileWallet(context.prisma, wallet.id);

    // Actualizar timestamp de última reconciliación
    await context.prisma.wallet.update({
      where: { id: wallet.id },
       { lastReconciledAt: new Date() },
    });

    // Registrar evento de auditoría
    await context.prisma.billingAuditEvent.create({
       {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'wallet.reconciled',
        resourceType: 'wallet',
        resourceId: wallet.id,
        metadata: reconciliation,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return reconciliation;
  });

  // ═══════════════════════════════════════════
  // OBTENER ENTITLEMENT ACTUAL
  // ═══════════════════════════════════════════

  app.get('/entitlement', async (request, reply) => {
    const session = await requireAuth(request, reply);

    const entitlement = await context.prisma.entitlement.findUnique({
      where: { organizationId: session.organizationId },
      include: {
        plan: true,
      },
    });

    if (!entitlement) {
      return { entitlement: null };
    }

    return {
      entitlement: {
        id: entitlement.id,
        plan: {
          id: entitlement.plan.id,
          slug: entitlement.plan.slug,
          name: entitlement.plan.name,
        },
        status: entitlement.status,
        creditsTotal: entitlement.creditsTotal,
        creditsUsed: entitlement.creditsUsed,
        creditsReserved: entitlement.creditsReserved,
        periodStart: entitlement.periodStart,
        periodEnd: entitlement.periodEnd,
        features: entitlement.features,
        toolAccess: entitlement.toolAccess,
      },
    };
  });
};
