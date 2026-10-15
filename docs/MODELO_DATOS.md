# MODELO DE DATOS — Andalus Studio

## Entidades principales

### Identidad y acceso
- **User** — Identidad base. Email único verificado. Password hash (bcrypt/argon2).
- **Session** — Sesiones activas. Token, expiración, userAgent, IP.
- **EmailVerification** — Token de verificación de email. Expiración.
- **PasswordReset** — Token de reset. Expiración, un solo uso.

### Organización y roles
- **Organization** — Tenant. Nombre, slug único, plan activo.
- **Membership** — Relación User ↔ Organization con rol.
- **Role** — OWNER, ADMIN, MEMBER, VIEWER. Permisos granulares.

### Contenido
- **Project** — Espacio de trabajo dentro de una organización.
- **Asset** — Archivos subidos. Metadata, tipo, tamaño, URL privada.
- **Tool** — Herramienta del catálogo. Status: DRAFT/DEVELOPMENT/TESTED/PUBLISHED/DISABLED.
- **ToolVersion** — Versiones semánticas de una herramienta.
- **Job** — Tarea asíncrona. Estado, progreso, resultado.
- **ToolRun** — Ejecución concreta de una herramienta. Inputs, outputs, créditos consumidos.
- **Artifact** — Resultado generado. Tipo, URL, metadata.

### Economía
- **Plan** — Definición de plan. Nombre, precio (céntimos), créditos incluidos, límites.
- **Entitlement** — Derechos activos de una organización. Plan, créditos disponibles, features.
- **Subscription** — Suscripción Stripe. Status, periodo, próximo cobro.
- **StripeCustomer** — ID de cliente Stripe por organización.
- **StripeEvent** — Log de webhooks recibidos. Idempotencia.
- **Wallet** — Saldo de créditos de la organización. Enteros.
- **CreditHold** — Reserva atómica de créditos antes de ejecución.
- **CreditLedgerEntry** — Movimiento de créditos. Tipo, cantidad, referencia. Inmutable.
- **UsageEvent** — Registro de consumo por herramienta/ejecución.

### Auditoría
- **AuditEvent** — Log de acciones significativas. Actor, acción, recurso, timestamp.

## Reglas

- Todos los IDs son UUID v7 (orden temporal).
- Moneda en céntimos de euro (integer).
- Créditos en enteros (sin decimales).
- Índices por organizationId en todas las tablas con datos de tenant.
- Soft delete donde aplique (deletedAt).
- Created/updated timestamps automáticos.
- No borrar datos en migraciones (solo añadir/renombrar con cuidado).
