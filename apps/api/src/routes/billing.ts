/**
 * Rutas de Billing - FASE 03
 * Maneja suscripciones, checkout, portal y facturación
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getStripe, isStripeAvailable, createCheckoutSession, createPortalSession, buildPriceMap } from '../modules/stripe/stripe';
import { requireAuth } from '../modules/sessions/session';

// Schema de validación para checkout
const CheckoutSchema = z.object({
  planSlug: z.string(),
  billingInterval: z.enum(['monthly', 'yearly']),
});

// Schema de validación para portal
const PortalSchema = z.object({
  returnUrl: z.string().url(),
});

export const billingRoutes: FastifyPluginAsync = async (app) => {
  const context = (app as any).context;

  // ═══════════════════════════════════════════
  // OBTENER PLANES DISPONIBLES
  // ═══════════════════════════════════════════

  app.get('/plans', async (request, reply) => {
    const plans = await context.prisma.plan.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { priceMonthly: 'asc' },
    });

    return {
      plans: plans.map((plan: any) => ({
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        currency: plan.currency,
        includedCredits: plan.includedCredits,
        maxUsers: plan.maxUsers,
        features: plan.features,
        limits: plan.limits,
      })),
    };
  });

  // ═══════════════════════════════════════════
  // OBTENER SUSCRIPCIÓN ACTUAL
  // ═══════════════════════════════════════════

  app.get('/subscription', async (request, reply) => {
    const session = await requireAuth(request, reply);

    const subscription = await context.prisma.subscription.findUnique({
      where: { organizationId: session.organizationId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return { subscription: null };
    }

    return {
      subscription: {
        id: subscription.id,
        plan: {
          id: subscription.plan.id,
          slug: subscription.plan.slug,
          name: subscription.plan.name,
        },
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
      },
    };
  });

  // ═══════════════════════════════════════════
  // CREAR CHECKOUT SESSION
  // ═══════════════════════════════════════════

  app.post('/checkout', async (request, reply) => {
    const session = await requireAuth(request, reply);

    if (!isStripeAvailable()) {
      return reply.status(503).send({
        error: {
          code: 'STRIPE_NOT_CONFIGURED',
          message: 'Stripe no está configurado',
        },
      });
    }

    const body = CheckoutSchema.parse(request.body);

    // Obtener plan
    const plan = await context.prisma.plan.findUnique({
      where: { slug: body.planSlug },
    });

    if (!plan) {
      return reply.status(404).send({
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Plan no encontrado',
        },
      });
    }

    // Obtener priceId de Stripe
    const priceMap = buildPriceMap(context.env);
    const priceKey = `${body.planSlug}-${body.billingInterval}`;
    const priceId = priceMap[priceKey];

    if (!priceId) {
      return reply.status(400).send({
        error: {
          code: 'PRICE_NOT_CONFIGURED',
          message: `Precio no configurado para ${priceKey}`,
        },
      });
    }

    // Obtener o crear cliente de Stripe
    let stripeCustomer = await context.prisma.stripeCustomer.findUnique({
      where: { organizationId: session.organizationId },
    });

    if (!stripeCustomer) {
      // Crear cliente en Stripe
      const organization = await context.prisma.organization.findUniqueOrThrow({
        where: { id: session.organizationId },
      });

      const customer = await (await import('../modules/stripe/stripe')).createStripeCustomer(
        organization.email || 'user@example.com',
        organization.name,
        { organizationId: organization.id }
      );

      stripeCustomer = await context.prisma.stripeCustomer.create({
         {
          organizationId: organization.id,
          stripeCustomerId: customer.id,
        },
      });
    }

    // Crear sesión de checkout
    const checkoutSession = await createCheckoutSession({
      customerId: stripeCustomer.stripeCustomerId,
      priceId,
      successUrl: `${context.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${context.env.FRONTEND_URL}/pricing`,
      metadata: {
        organizationId: session.organizationId,
        planId: plan.id,
        userId: session.userId,
      },
    });

    // Registrar evento de auditoría
    await context.prisma.billingAuditEvent.create({
       {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'checkout.created',
        resourceType: 'checkout_session',
        resourceId: checkoutSession.id,
        metadata: { planSlug: body.planSlug, billingInterval: body.billingInterval },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return {
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    };
  });

  // ═══════════════════════════════════════════
  // CREAR PORTAL SESSION
  // ═══════════════════════════════════════════

  app.post('/portal', async (request, reply) => {
    const session = await requireAuth(request, reply);

    if (!isStripeAvailable()) {
      return reply.status(503).send({
        error: {
          code: 'STRIPE_NOT_CONFIGURED',
          message: 'Stripe no está configurado',
        },
      });
    }

    const body = PortalSchema.parse(request.body);

    // Obtener cliente de Stripe
    const stripeCustomer = await context.prisma.stripeCustomer.findUnique({
      where: { organizationId: session.organizationId },
    });

    if (!stripeCustomer) {
      return reply.status(404).send({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'No hay cliente de Stripe asociado',
        },
      });
    }

    // Crear sesión de portal
    const portalSession = await createPortalSession({
      customerId: stripeCustomer.stripeCustomerId,
      returnUrl: body.returnUrl,
      configurationId: context.env.STRIPE_PORTAL_CONFIGURATION_ID,
    });

    // Registrar evento de auditoría
    await context.prisma.billingAuditEvent.create({
       {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'portal.created',
        resourceType: 'portal_session',
        resourceId: portalSession.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    return {
      portalUrl: portalSession.url,
    };
  });

  // ═══════════════════════════════════════════
  // OBTENER FACTURAS
  // ═══════════════════════════════════════════

  app.get('/invoices', async (request, reply) => {
    const session = await requireAuth(request, reply);

    const invoices = await context.prisma.invoice.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      invoices: invoices.map((invoice: any) => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        currency: invoice.currency,
        amountTotal: invoice.amountTotal,
        amountPaid: invoice.amountPaid,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        paidAt: invoice.paidAt,
        invoicePdf: invoice.invoicePdf,
        hostedInvoiceUrl: invoice.hostedInvoiceUrl,
        createdAt: invoice.createdAt,
      })),
    };
  });

  // ═══════════════════════════════════════════
  // VERIFICAR ESTADO DE CHECKOUT
  // ═══════════════════════════════════════════

  app.get('/checkout/:sessionId/status', async (request, reply) => {
    const session = await requireAuth(request, reply);
    const { sessionId } = request.params as { sessionId: string };

    // Buscar evento de checkout completado
    const webhookEvent = await context.prisma.stripeWebhookEvent.findFirst({
      where: {
        eventType: 'checkout.session.completed',
        'payload.id': sessionId,
        processingStatus: 'COMPLETED',
      },
    });

    if (webhookEvent) {
      return {
        status: 'completed',
        message: 'Pago completado exitosamente',
      };
    }

    // Verificar si hay un evento pendiente
    const pendingEvent = await context.prisma.stripeWebhookEvent.findFirst({
      where: {
        eventType: 'checkout.session.completed',
        'payload.id': sessionId,
        processingStatus: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    if (pendingEvent) {
      return {
        status: 'pending',
        message: 'Pago en proceso de confirmación',
      };
    }

    return {
      status: 'unknown',
      message: 'Estado de pago desconocido',
    };
  });
};
