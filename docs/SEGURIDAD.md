# SEGURIDAD — Andalus Studio

## Principios

1. **No criptografía casera.** Usar librerías mantenidas (bcrypt, argon2, jose).
2. **Acceso mínimo.** Cada componente accede solo a lo necesario.
3. **Datos por tenant.** Siempre filtrado por organizationId.
4. **Sin secrets en frontend.** Todo sensible en servidor.
5. **Auditoría completa.** Toda acción significativa registrada.

## Autenticación

- Passwords: hash con argon2id (o bcrypt ≥12 rounds).
- Sesiones: cookie HttpOnly, Secure, SameSite=Strict.
- CSRF: token en formularios según mecanismo.
- Rate limiting en endpoints de auth.
- Bloqueo temporal tras N intentos fallidos.

## Autorización

- RBAC: OWNER > ADMIN > MEMBER > VIEWER.
- Middleware de permisos en cada ruta.
- Verificación de tenant en cada query.
- Admin routes protegidas por rol específico.

## Pagos (Stripe)

- Webhooks verificados con firma (stripe-signature).
- Idempotencia en procesamiento de eventos.
- No almacenar datos de tarjetas.
- Stripe TEST hasta aprobación humana para LIVE.
- Sin endpoints públicos de compra sin autenticación.

## Datos y privacidad (GDPR)

- Consentimiento explícito para datos personales.
- Derecho al olvido: borrado de cuenta y datos.
- Exportación de datos del usuario.
- Política de privacidad accesible.
- DPO designado antes de producción.

## Archivos y uploads

- Validación de tipo y tamaño en servidor.
- Almacenamiento en bucket privado (no público).
- URLs firmadas con expiración.
- Scan de malware (previsto).
- Derechos de autor: consentimiento para contenido de terceros.

## Herramientas IA

- Transparencia: indicar contenido sintético.
- Licencias de modelos/bibliotecas documentadas.
- No entrenar con datos de usuarios sin consentimiento.
- Consentimiento para uso de voces/obras de terceros.

## Infraestructura

- HTTPS obligatorio.
- Headers de seguridad (CSP, HSTS, X-Frame-Options).
- Dependencias actualizadas (Dependabot/Renovate).
- Secrets en variables de entorno, nunca en código.
- Backups automáticos de DB.

## Amenazas consideradas

| Amenaza | Mitigación |
|---------|-----------|
| SQL Injection | Prisma (parameterized queries) |
| XSS | React escaping + CSP |
| CSRF | SameSite cookies + tokens |
| IDOR | Verificación de tenant en cada query |
| Rate abuse | Rate limiting por IP y usuario |
| Credential stuffing | Rate limit + bloqueo temporal |
| Data leak | Bucket privado + URLs firmadas |
| Unauthorized billing | Servidor resuelve todo |

## Estado: FASE 00

- [x] Amenazas identificadas
- [x] Estrategia de mitigación definida
- [ ] Implementación auth (FASE 01)
- [ ] Tests de seguridad (FASE 05)
- [ ] Revisión legal/fiscal antes de producción
