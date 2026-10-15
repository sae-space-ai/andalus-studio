# FASE 01 — PREPARACIÓN COMERCIAL

## Planes (5)

| Plan | Precio/mes | Créditos/mes | Usuarios |
|------|-----------|--------------|----------|
| Free | 0€ | 50 | 1 |
| Creator | 19€ | 500 | 1 |
| Pro | 49€ | 2000 | 5 |
| Studio | 149€ | 8000 | 20 |
| Enterprise | Custom | Custom | Ilimitado |

**Estado:** PREPARADO (visual). Sin integración de pagos.

## Pasarela de pago

- **Estado:** NO ACTIVA
- Stripe TEST se implementará en FASE 03
- No se reciben números de tarjeta en formularios propios
- No se activan cobros reales

## Créditos

- Unidad de consumo interna
- Cotización antes de ejecutar
- Reserva atómica → liquidación o devolución
- Ledger inmutable
- Servidor resuelve todo (nunca el navegador)

## Clases de coste (orientativas)

| Clase | Descripción |
|-------|-------------|
| FREE_NO_LIMIT | Gratuita sin límite |
| FREE_LIMITED | Gratuita con límite diario |
| LOW_COST | Cálculo local económico |
| STANDARD | Procesamiento ligero |
| INTENSIVE | Procesamiento pesado |
| SPECIALIZED | Bajo condiciones específicas |

## Estado de facturación

- ❌ Sin Stripe integrado
- ❌ Sin webhooks configurados
- ❌ Sin ledger real
- ❌ Sin facturas generadas
- ✅ Modelos visuales creados
- ✅ Contratos definidos
