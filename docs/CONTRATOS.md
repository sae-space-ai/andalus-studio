# CONTRATOS API — Andalus Studio

## Versionado

Todas las rutas bajo `/api/v1/`. Respuestas en JSON. Errores con código y mensaje.

## Autenticación

- Registro: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Logout: `POST /api/v1/auth/logout`
- Verificar email: `POST /api/v1/auth/verify-email`
- Reset password (solicitar): `POST /api/v1/auth/reset-password`
- Reset password (ejecutar): `POST /api/v1/auth/reset-password/confirm`
- Sesión actual: `GET /api/v1/auth/me`

## Cuentas y organización

- Perfil: `GET/PUT /api/v1/accounts/profile`
- Organización: `GET/PUT /api/v1/accounts/organization`
- Miembros: `GET/POST/DELETE /api/v1/accounts/members`
- Roles: `GET /api/v1/accounts/roles`

## Planes y suscripciones

- Planes disponibles: `GET /api/v1/plans`
- Plan actual: `GET /api/v1/plans/current`
- Checkout (crear sesión Stripe): `POST /api/v1/checkout/create-session`
- Portal (gestionar suscripción): `POST /api/v1/checkout/portal`

## Webhooks Stripe

- `POST /api/v1/webhooks/stripe` — Verificado con firma.

## Facturación y créditos

- Wallet (saldo): `GET /api/v1/billing/wallet`
- Ledger (movimientos): `GET /api/v1/billing/ledger`
- Facturas: `GET /api/v1/billing/invoices`
- Uso actual: `GET /api/v1/billing/usage`
- Cotización (estimar coste): `POST /api/v1/billing/quote`

## Catálogo de herramientas

- Listar: `GET /api/v1/catalog/tools`
- Detalle: `GET /api/v1/catalog/tools/:id`
- Versiones: `GET /api/v1/catalog/tools/:id/versions`

## Ejecución de herramientas

- Crear job: `POST /api/v1/tools/:id/run`
- Estado del job: `GET /api/v1/jobs/:id`
- Resultado/artefactos: `GET /api/v1/jobs/:id/artifacts`
- Cancelar: `POST /api/v1/jobs/:id/cancel`

## Proyectos

- CRUD: `/api/v1/projects`
- Assets: `/api/v1/projects/:id/assets`

## Administración (rol requerido)

- Usuarios: `GET /api/v1/admin/users`
- Organizaciones: `GET /api/v1/admin/organizations`
- Herramientas (gestión): `CRUD /api/v1/admin/tools`
- Auditoría: `GET /api/v1/admin/audits`
- Stripe events: `GET /api/v1/admin/stripe-events`

## Formato de respuesta

```json
{
  "ok": true,
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}
```

Error:
```json
{
  "ok": false,
  "error": { "code": "INSUFFICIENT_CREDITS", "message": "..." }
}
```
