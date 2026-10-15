# PLANES — Andalus Studio

## Definición

Los planes son parametrizables. Los valores aquí son ORIENTATIVOS.
El servidor resuelve precios, cuotas y límites en tiempo real.

## Planes

### Free
- **Precio:** 0€/mes
- **Créditos:** 50/mes (no acumulables)
- **Herramientas:** Básicas con limitaciones
- **Usuarios:** 1
- **Almacenamiento:** 100 MB
- **Soporte:** Comunidad

### Creator
- **Precio:** 19€/mes (anual: 190€/año)
- **Créditos:** 500/mes
- **Herramientas:** Estándar completas
- **Usuarios:** 1
- **Almacenamiento:** 5 GB
- **Soporte:** Email

### Pro
- **Precio:** 49€/mes (anual: 490€/año)
- **Créditos:** 2.000/mes
- **Herramientas:** Todas
- **Usuarios:** 5
- **Almacenamiento:** 25 GB
- **Soporte:** Prioritario

### Studio
- **Precio:** 149€/mes (anual: 1.490€/año)
- **Créditos:** 8.000/mes
- **Herramientas:** Todas + cola prioritaria
- **Usuarios:** 20
- **Almacenamiento:** 100 GB
- **Soporte:** Dedicado

### Enterprise
- **Precio:** Custom (contactar)
- **Créditos:** Custom
- **Herramientas:** Todas + SLA + personalización
- **Usuarios:** Ilimitado
- **Almacenamiento:** Custom
- **Soporte:** SLA garantizado

## Reglas de negocio

1. Sin cobros excedentes automáticos. Si se acaban los créditos, se notifica.
2. Sin plan "ilimitado". Todos tienen límites claros.
3. Upgrade: cobro prorrata del periodo restante.
4. Downgrade: se aplica al siguiente ciclo de facturación.
5. Cancelación: acceso hasta fin del periodo pagado.
6. Créditos no consumidos: NO acumulan (por defecto, configurable).
7. Compra de créditos adicionales: paquetes fijos, sin caducidad.

## Cambios de plan

- El servidor calcula prorrata.
- Stripe maneja el cobro.
- Webhook actualiza entitlements.
- El usuario ve el cambio reflejado inmediatamente.

## Estado: FASE 00

- [x] Planes definidos (orientativos)
- [x] Reglas de negocio establecidas
- [ ] Stripe TEST integrado (FASE 03)
- [ ] Precios finales validados (pre-producción)
