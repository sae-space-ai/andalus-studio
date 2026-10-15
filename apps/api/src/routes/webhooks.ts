/**
 * Rutas de Webhooks de Stripe - FASE 03
 * Maneja eventos de Stripe con verificación de firma e idempotencia
 */

import { FastifyPluginAsync } from 'fastify';
import { verifyWebhookSignature } from '../modules/stripe/stripe';
import { grantCredits } from '../modules/credits/credits';

export const webhookRoutes: FastifyPluginAsync = async (app) => {
  const context = (app as any).context;

  // ═══════════════════════════════════════════
  // WEBHOOK DE STRIPE
  // ═══════════════════════════════════════════

  app.post('/stripe', async (request, reply) => {
    // Verificar que Stripe está configurado
    if (!context.env.STRIPE_WEBHOOK_SECRET) {
      return reply.status(500).send({
        error: {
          code: 'WEBHOOK_NOT_CONFIGURED',
          message: 'Webhook secret not configured',
        },
      });
    }

    // Obtener firma y payload
    const signature = request.headers['stripe-signature'] as string;
    const payload = request.body;

    if (!signature) {
      return reply.status(400).send({
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Missing Stripe signature',
        },
      });
    }

    // Verificar firma
    let event;
    try {
      event = verifyWebhookSignature(
        JSON.stringify(payload),
        signature,
        context.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      request.log.error(error, 'Webhook signature verification failed');
      return reply.status(400).send({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      });
    }

    // Verificar idempotencia
    const existingEvent = await context.prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existingEvent) {
      // Evento ya procesado, responder con 200 para que Stripe no reintente
      request.log.info({ eventId: event.id }, 'Duplicate webhook event received');
      return reply.status(200).send({ received: true });
    }

    // Guardar evento en base de datos
    const webhookEvent = await context.prisma.stripeWebhookEvent.create({
       {
        stripeEventId: event.id,
        eventType: event.type,
        apiVersion: event.api_version,
        objectId: getObject(event),
        objectType: getObjectType(event),
        payload: event,
        processingStatus: 'PENDING',
        idempotencyKey: `stripe-${event.id}`,
      },
    });

    // Procesar evento
    try {
      await processWebhookEvent(context, webhookEvent, event);
      
      await context.prisma.stripeWebhookEvent.update({
        where: { id: webhookEvent.id },
         {
          processingStatus: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      return reply.status(200).send({ received: true });
    } catch (error) {
      request.log.error(error, 'Error processing webhook event');
      
      await context.prisma.stripeWebhookEvent.update({
        where: { id: webhookEvent.id },
         {
          processingStatus: 'FAILED',
          lastError: error instanceof Error ? error.message : 'Unknown error',
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });

      // Responder con 500 para que Stripe reintente
      return reply.status(500).send({
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Error processing webhook event',
        },
      });
    }
  });
};

/**
 * Procesa un evento de Stripe
 */
async function processWebhookEvent(
  context: any,
  webhookEvent: any,
  event: any
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(context, event);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(context, event);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(context, event);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(context, event);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(context, event);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(context, event);
      break;
    default:
      context.app.log.info({ eventType: event.type }, 'Unhandled webhook event type');
  }
}

/**
 * Maneja checkout.session.completed
 */
async function handleCheckoutCompleted(context: any, event: any): Promise<void> {
  const session = event.data.object;
  const metadata = session.metadata || {};

  const organizationId = metadata.organizationId;
  const planId = metadata.planId;
  const userId = metadata.userId;

  if (!organizationId || !planId) {
    throw new Error('Missing metadata in checkout session');
  }

  // Obtener suscripción de Stripe
  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    throw new Error('Missing subscription ID in checkout session');
  }

  // Crear o actualizar suscripción en base de datos
  const subscription = await context.prisma.subscription.upsert({
    where: { organizationId },
    update: {
      stripeSubscriptionId: subscriptionId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(session.current_period_start * 1000),
      currentPeriodEnd: new Date(session.current_period_end * 1000),
    },
    create: {
      organizationId,
      stripeSubscriptionId: subscriptionId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(session.current_period_start * 1000),
      currentPeriodEnd: new Date(session.current_period_end * 1000),
    },
  });

  // Obtener plan para saber cuántos créditos conceder
  const plan = await context.prisma.plan.findUniqueOrThrow({
    where: { id: planId },
  });

  // Obtener o crear wallet
  let wallet = await context.prisma.wallet.findUnique({
    where: { organizationId },
  });

  if (!wallet) {
    wallet = await context.prisma.wallet.create({
       {
        organizationId,
        balance: 0,
        totalCredits: 0,
        totalConsumed: 0,
        totalReserved: 0,
      },
    });
  }

  // Conceder créditos
  await grantCredits(
    context.prisma,
    wallet.id,
    plan.includedCredits,
    'SUBSCRIPTION',
    `Plan ${plan.name}`,
    `subscription-${subscription.id}-${session.current_period_start}`,
    session.invoice,
    subscription.id
  );

  // Registrar evento de auditoría
  await context.prisma.billingAuditEvent.create({
     {
      organizationId,
      userId,
      action: 'subscription.activated',
      resourceType: 'subscription',
      resourceId: subscription.id,
      amount: plan.includedCredits,
      currency: 'CREDITS',
      metadata: { planSlug: plan.slug, stripeSessionId: session.id },
    },
  });

  context.app.log.info(
    { organizationId, subscriptionId, credits: plan.includedCredits },
    'Checkout completed and credits granted'
  );
}

/**
 * Maneja customer.subscription.created
 */
async function handleSubscriptionCreated(context: any, event: any): Promise<void> {
  // Este evento se maneja principalmente en checkout.session.completed
  // Aquí solo registramos para auditoría
  context.app.log.info({ subscriptionId: event.data.object.id }, 'Subscription created');
}

/**
 * Maneja customer.subscription.updated
 */
async function handleSubscriptionUpdated(context: any, event: any): Promise<void> {
  const subscription = event.data.object;
  
  // Actualizar suscripción en base de datos
  await context.prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
     {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      lastSyncedAt: new Date(),
    },
  });

  context.app.log.info({ subscriptionId: subscription.id }, 'Subscription updated');
}

/**
 * Maneja customer.subscription.deleted
 */
async function handleSubscriptionDeleted(context: any, event: any): Promise<void> {
  const subscription = event.data.object;
  
  await context.prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
     {
      status: 'canceled',
      endedAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });

  context.app.log.info({ subscriptionId: subscription.id }, 'Subscription deleted');
}

/**
 * Maneja invoice.paid
 */
async function handleInvoicePaid(context: any, event: any): Promise<void> {
  const invoice = event.data.object;
  
  // Guardar factura en base de datos
  await context.prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      status: 'paid',
      amountPaid: invoice.amount_paid,
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    },
    create: {
      organizationId: '', // Se actualizará después
      stripeInvoiceId: invoice.id,
      status: 'paid',
      currency: invoice.currency,
      amountSubtotal: invoice.subtotal,
      amountTax: invoice.tax || 0,
      amountTotal: invoice.total,
      amountPaid: invoice.amount_paid,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    },
  });

  context.app.log.info({ invoiceId: invoice.id }, 'Invoice paid');
}

/**
 * Maneja invoice.payment_failed
 */
async function handleInvoicePaymentFailed(context: any, event: any): Promise<void> {
  const invoice = event.data.object;
  
  await context.prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      status: 'uncollectible',
    },
    create: {
      organizationId: '', // Se actualizará después
      stripeInvoiceId: invoice.id,
      status: 'uncollectible',
      currency: invoice.currency,
      amountSubtotal: invoice.subtotal,
      amountTax: invoice.tax || 0,
      amountTotal: invoice.total,
    },
  });

  context.app.log.warn({ invoiceId: invoice.id }, 'Invoice payment failed');
}

/**
 * Obtiene el ID del objeto principal del evento
 */
function getObject(event: any): string | null {
  const obj = event.data.object;
  return obj?.id || null;
}

/**
 * Obtiene el tipo del objeto principal del evento
 */
function getObjectType(event: any): string | null {
  return event.data.object?.object || null;
}
