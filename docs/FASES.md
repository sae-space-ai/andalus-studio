# FASES — Andalus Studio

## FASE 00 — Estructura maestra, cuentas y economía ✅
- [x] Verificación del entorno
- [x] Estructura de directorios y configuración
- [x] Modelo de datos (Prisma schema)
- [x] Circuito empresarial definido
- [x] 5 planes parametrizables
- [x] Contratos API versionados
- [x] Catálogo maestro de herramientas
- [x] Amenazas y estrategia de seguridad
- [x] Documentación completa
- [x] Frontend de demostración

## FASE 01 — Identidad, interfaz y catálogo ✅
- [x] Sistema de diseño (Andalucía Light/Dark)
- [x] Interfaz profesional (10 páginas)
- [x] Catálogo con 23 herramientas en 10 familias
- [x] Buscador funcional (tolerante a acentos)
- [x] Filtros funcionales (familia, estado, acceso)
- [x] Fichas individuales reutilizables
- [x] Recomendador determinista
- [x] Navegación responsive
- [x] Tema claro/oscuro funcional
- [x] 30 tests creados
- [x] Documentación completa FASE 01
- [x] Build exitoso
- [ ] API Fastify (FASE 02)
- [ ] Motores de herramientas (FASE 02+)

## FASE 02 — Backend, autenticación y seguridad ✅ IMPLEMENTADA
- [x] Fastify + TypeScript + Zod
- [x] Registro con validación y hashing Argon2id
- [x] Login con verificación de estado
- [x] Verificación de email con tokens seguros
- [x] Sesiones HttpOnly + Secure + SameSite
- [x] CSRF protection
- [x] Rate limiting
- [x] Recuperación de contraseña
- [x] RBAC (roles USER, STAFF, ADMIN)
- [x] 42 tests creados (calculadora MIDI + seguridad)
- [x] Primera herramienta: Calculadora MIDI
- [x] Documentación completa FASE 02
- [ ] Frontend conectado a API real (pendiente)
- [ ] Tests ejecutados (requiere PostgreSQL)

## FASE 03 — Sistema comercial (Stripe TEST) ✅ IMPLEMENTADA
- [x] Integración con Stripe SDK
- [x] Sistema de suscripciones
- [x] Checkout Sessions
- [x] Portal de Cliente
- [x] Webhooks con verificación de firma
- [x] Idempotencia de eventos
- [x] Sistema de créditos con ledger inmutable
- [x] Reserva atómica de créditos
- [x] Captura y liberación de créditos
- [x] Reembolsos
- [x] Reconciliación de saldo
- [x] Gestión de facturas
- [x] Políticas de precios
- [x] Auditoría comercial
- [x] Documentación completa FASE 03
- [ ] Frontend conectado a APIs de billing (pendiente)
- [ ] Stripe TEST configurado (pendiente)
- [ ] Tests ejecutados (requiere PostgreSQL)

## FASE 04 — Herramientas y ejecución (previsto)
- [ ] Tool SDK
- [ ] Sistema de jobs (BullMQ)
- [ ] Ejecución con reserva de créditos
- [ ] Artefactos y descargas
- [ ] Más herramientas funcionales

## FASE 03 — Pagos Stripe TEST
- [ ] Integración Stripe (modo TEST)
- [ ] Checkout sessions
- [ ] Webhooks verificados
- [ ] Entitlements automáticos
- [ ] Portal de gestión de suscripción
- [ ] Tests de flujo completo de pago

## FASE 04 — Catálogo público
- [ ] Herramientas publicadas visibles
- [ ] Búsqueda y filtrado
- [ ] Páginas de herramienta
- [ ] Ejecución con cotización previa
- [ ] Historial de ejecuciones

## FASE 05 — Seguridad y calidad
- [ ] Tests E2E (Playwright)
- [ ] Tests de integración API
- [ ] Auditoría de seguridad
- [ ] Rate limiting
- [ ] GDPR compliance check

## FASE 06 — Pre-producción
- [ ] Revisión legal/fiscal
- [ ] Términos y condiciones
- [ ] Política de privacidad
- [ ] Licencias de terceros
- [ ] Preparación para Stripe LIVE (aprobación humana)

## Reglas

- Sin nueva fase automática.
- Cada fase requiere aceptación explícita.
- No publicar sin pruebas E2E reales.
- No activar pagos LIVE sin aprobación humana.
