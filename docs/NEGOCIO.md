# MODELO DE NEGOCIO — Andalus Studio

## Circuito empresarial

```
Registro → Verificación email → Login → Selección de plan
    → Checkout Stripe TEST → Webhook autenticado
    → Entitlement activado → Cotización en créditos
    → Reserva atómica (CreditHold) → Ejecución herramienta
    → Verificación resultado → Liquidación o devolución
    → Histórico/Ledger → Factura
```

## Planes (parametrizables, precios orientativos)

| Plan | Precio/mes | Créditos/mes | Herramientas | Usuarios |
|------|-----------|--------------|-------------|----------|
| Free | 0€ | 50 | Básicas (limitadas) | 1 |
| Creator | 19€ | 500 | Estándar | 1 |
| Pro | 49€ | 2000 | Todas | 5 |
| Studio | 149€ | 8000 | Todas + prioridad | 20 |
| Enterprise | Custom | Custom | Todas + SLA | Ilimitado |

**Reglas:**
- Precios resueltos por el servidor, nunca por el navegador.
- Sin cobros excedentes automáticos.
- Sin plan "ilimitado".
- Upgrade/downgrade con prorrata.
- Créditos no consumidos NO acumulan (configurable por plan).

## Monetización

1. **Suscripción mensual/anual** — Acceso a plan con créditos incluidos.
2. **Créditos adicionales** — Compra de paquetes de créditos (una vez).
3. **Enterprise** — Contrato personalizado.

## Créditos

- Unidad de consumo interna.
- Cada herramienta define su coste en créditos.
- El servidor cotiza antes de ejecutar.
- Reserva atómica → ejecución → liquidación o devolución.
- Ledger inmutable con todos los movimientos.

## Transparencia

- El usuario ve antes de ejecutar: coste estimado, créditos disponibles.
- Después de ejecutar: coste real, artefactos generados.
- Histórico completo de movimientos descargable.

## Estado: FASE 00

- [x] Circuito definido
- [x] Planes parametrizados
- [x] Modelo de créditos diseñado
- [ ] Stripe TEST integrado (FASE 03)
- [ ] Facturación automática (FASE 04)
