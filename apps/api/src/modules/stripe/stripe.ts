/**
 * Módulo de Stripe - FASE 03
 * Maneja la integración con Stripe en modo TEST
 */

import Stripe from 'stripe';
import { Env, isStripeConfigured, validateStripeKey } from '../config/env';

let stripeClient: Stripe | null = null;

/**
 * Inicializa el cliente de Stripe
 */
export function initStripe(env: Env): Stripe | null {
  if (!isStripeConfigured(env)) {
    console.warn('⚠️  Stripe no configurado. Las operaciones de pago estarán deshabilitadas.');
    return null;
  }

  try {
    validateStripeKey(env.STRIPE_SECRET_KEY, env);
    
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });

    const mode = env.STRIPE_MODE === 'LIVE' ? '🔴 LIVE' : '🟢 TEST';
    console.log(`✅ Stripe inicializado en modo ${mode}`);
    
    return stripeClient;
  } catch (error) {
    console.error('❌ Error inicializando Stripe:', error);
    return null;
  }
}

/**
 * Obtiene el cliente de Stripe
 */
export function getStripe(): Stripe | null {
  return stripeClient;
}

/**
 * Verifica si Stripe está disponible
 */
export function isStripeAvailable(): boolean {
  return stripeClient !== null;
}

/**
 * Crea un cliente de Stripe
 */
export async function createStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  return stripeClient.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Obtiene un cliente de Stripe
 */
export async function getStripeCustomer(customerId: string): Promise<Stripe.Customer> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  return stripeClient.customers.retrieve(customerId) as Promise<Stripe.Customer>;
}

/**
 * Crea una sesión de Checkout para suscripción
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  return stripeClient.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    subscription_data: {
      metadata: params.metadata,
    },
  });
}

/**
 * Crea una sesión de Checkout para compra única (créditos adicionales)
 */
export async function createOneTimeCheckoutSession(params: {
  customerId: string;
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  return stripeClient.checkout.sessions.create({
    customer: params.customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: params.quantity,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });
}

/**
 * Crea una sesión de Portal de Cliente
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
  configurationId?: string;
}): Promise<Stripe.BillingPortal.Session> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
    customer: params.customerId,
    return_url: params.returnUrl,
  };

  if (params.configurationId) {
    sessionParams.configuration = params.configurationId;
  }

  return stripeClient.billingPortal.sessions.create(sessionParams);
}

/**
 * Obtiene una suscripción de Stripe
 */
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  return stripeClient.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancela una suscripción
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  if (atPeriodEnd) {
    return stripeClient.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return stripeClient.subscriptions.cancel(subscriptionId);
  }
}

/**
 * Obtiene facturas de un cliente
 */
export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  const invoices = await stripeClient.invoices.list({
    customer: customerId,
    limit,
    orderBy: 'created',
  });

  return invoices.data;
}

/**
 * Verifica la firma de un webhook
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  return stripeClient.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Obtiene el precio de un producto
 */
export async function getStripePrice(priceId: string): Promise<Stripe.Price> {
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  return stripeClient.prices.retrieve(priceId);
}

/**
 * Construye el mapa de precios desde la configuración
 */
export function buildPriceMap(env: Env): Record<string, string> {
  return {
    'creator-monthly': env.STRIPE_PRICE_CREATOR_MONTHLY || '',
    'creator-yearly': env.STRIPE_PRICE_CREATOR_YEARLY || '',
    'pro-monthly': env.STRIPE_PRICE_PRO_MONTHLY || '',
    'pro-yearly': env.STRIPE_PRICE_PRO_YEARLY || '',
    'studio-monthly': env.STRIPE_PRICE_STUDIO_MONTHLY || '',
    'studio-yearly': env.STRIPE_PRICE_STUDIO_YEARLY || '',
  };
}
