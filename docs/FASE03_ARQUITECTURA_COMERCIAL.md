# FASE 03 — ARQUITECTURA COMERCIAL

## Visión General

La FASE 03 implementa el sistema comercial completo de ANDALUS STUDIO, incluyendo:
- Integración con Stripe (modo TEST)
- Sistema de suscripciones
- Gestión de créditos con ledger inmutable
- Webhooks para sincronización
- Portal de cliente
- Facturación

## Componentes Principales

### 1. Stripe Integration (`modules/stripe/stripe.ts`)
- Cliente de Stripe inicializado en modo TEST
- Creación de Checkout Sessions para suscripciones
- Creación de Portal Sessions para gestión de cliente
- Verificación de firmas de webhooks
- Validación de claves (TEST vs LIVE)

### 2. Sistema de Créditos (`modules/credits/credits.ts`)
- Ledger inmutable de movimientos
- Reserva atómica de créditos (previene doble gasto)
- Captura de créditos consumidos
- Liberación de créditos no utilizados
- Concesión de créditos (suscripción, compra, promoción)
- Reembolsos por trabajos fallidos
- Reconciliación de saldo

### 3. Rutas de Billing (`routes/billing.ts`)
- `GET /api/billing/plans` - Listar planes disponibles
- `GET /api/billing/subscription` - Obtener suscripción actual
- `POST /api/billing/checkout` - Crear sesión de checkout
- `POST /api/billing/portal` - Crear sesión de portal
- `GET /api/billing/invoices` - Listar facturas
- `GET /api/billing/checkout/:sessionId/status` - Verificar estado de pago

### 4. Rutas de Créditos (`routes/credits.ts`)
- `GET /api/credits/balance` - Obtener saldo actual
- `GET /api/credits/ledger` - Historial de movimientos
- `GET /api/credits/jobs` - Trabajos recientes
- `POST /api/credits/reconcile` - Reconciliar wallet (admin)
- `GET /api/credits/entitlement` - Derechos de acceso actuales

### 5. Webhooks de Stripe (`routes/webhooks.ts`)
- `POST /api/webhooks/stripe` - Endpoint para eventos de Stripe
- Verificación criptográfica de firma
- Idempotencia (previene procesamiento duplicado)
- Manejo de eventos:
  - `checkout.session.completed` - Activar suscripción y conceder créditos
  - `customer.subscription.created` - Registro de auditoría
  - `customer.subscription.updated` - Sincronizar estado
  - `customer.subscription.deleted` - Marcar como cancelada
  - `invoice.paid` - Registrar factura pagada
  - `invoice.payment_failed` - Registrar fallo de pago

## Flujo de Suscripción

```
1. Usuario selecciona plan en frontend
2. Frontend llama a POST /api/billing/checkout
3. Backend crea Checkout Session en Stripe
4. Usuario es redirigido a Stripe para pagar
5. Stripe procesa el pago
6. Stripe envía webhook checkout.session.completed
7. Backend verifica firma del webhook
8. Backend crea/actualiza suscripción en DB
9. Backend concede créditos al wallet
10. Usuario es redirigido a página de éxito
11. Frontend verifica estado del pago
```

## Flujo de Consumo de Créditos

```
1. Usuario solicita ejecutar herramienta
2. Backend calcula coste estimado
3. Backend reserva créditos atómicamente (RESERVE)
4. Herramienta se ejecuta
5. Si éxito: captura créditos (CAPTURE)
6. Si fallo: libera créditos (RELEASE)
7. Ledger registra todos los movimientos
8. Balance se actualiza atómicamente
```

## Modelo de Datos

### Plan
- Define planes de suscripción (FREE, CREATOR, PRO, STUDIO, ENTERPRISE)
- Precios en céntimos de euro
- Créditos incluidos por periodo
- Features y límites

### Subscription
- Vincula organización con plan
- Estado sincronizado con Stripe
- Periodos de facturación
- Metadatos de Stripe

### Wallet
- Balance actual de créditos
- Total concedido, consumido, reservado
- Última reconciliación

### CreditLedgerEntry
- Movimientos inmutables
- Tipos: GRANT, PURCHASE, RESERVE, CAPTURE, RELEASE, REFUND, EXPIRE, ADJUSTMENT
- Clave de idempotencia
- Referencias a trabajos, facturas, suscripciones

### CreditGrant
- Concesiones de créditos
- Origen (suscripción, compra, promoción)
- Fecha de expiración
- Estado (ACTIVE, CONSUMED, EXPIRED)

### Invoice
- Facturas de Stripe
- Estado (draft, open, paid, void, uncollectible)
- Importes y periodos
- URLs a PDF y portal

### ToolUsageJob
- Trabajos de herramientas
- Estados económicos (QUOTED, RESERVED, RUNNING, SUCCEEDED, FAILED, SETTLED, REFUNDED)
- Créditos cotizados, reservados, consumidos, reembolsados
- Clave de idempotencia

### StripeWebhookEvent
- Eventos recibidos de Stripe
- Estado de procesamiento (PENDING, PROCESSING, COMPLETED, FAILED)
- Intentos y errores
- Payload completo

## Seguridad

### Prevención de Doble Gasto
- Transacciones atómicas en PostgreSQL
- Bloqueo de wallet durante operaciones
- Actualizaciones condicionales
- Claves de idempotencia

### Verificación de Webhooks
- Firma criptográfica de Stripe
- Rechazo de eventos no firmados
- Registro de todos los eventos
- Idempotencia por event ID

### Protección de APIs
- Autenticación requerida para operaciones de usuario
- Autorización basada en roles
- CSRF protection
- Rate limiting

## Configuración

### Variables de Entorno
```env
STRIPE_MODE=TEST
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_STUDIO_MONTHLY=price_...
STRIPE_PRICE_STUDIO_YEARLY=price_...
STRIPE_PORTAL_CONFIGURATION_ID=bpc_...
```

### Validación de Claves
- Modo TEST rechaza claves LIVE
- Modo LIVE rechaza claves TEST
- Error si claves no configuradas

## Estado

- ✅ Schema de base de datos actualizado
- ✅ Módulo de Stripe implementado
- ✅ Módulo de créditos implementado
- ✅ Rutas de billing implementadas
- ✅ Rutas de créditos implementadas
- ✅ Webhooks de Stripe implementados
- ✅ Servidor actualizado con nuevas rutas
- ⏳ Pendiente: Migraciones de base de datos
- ⏳ Pendiente: Ejecución de tests
- ⏳ Pendiente: Conexión con frontend
- ⏳ Pendiente: Configuración de Stripe TEST
