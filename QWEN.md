# QWEN.md — Al-Andalus AI · Andalus Studio

> INTELLIGENCE · ENGINEERING · EUROPE

## Referencia rápida

| Documento | Ubicación |
|-----------|-----------|
| Arquitectura general | `docs/ARQUITECTURA.md` |
| Modelo de datos | `docs/MODELO_DATOS.md` |
| Contratos API | `docs/CONTRATOS.md` |
| Modelo de negocio | `docs/NEGOCIO.md` |
| Seguridad | `docs/SEGURIDAD.md` |
| Catálogo de herramientas | `docs/CATALOGO.md` |
| Planes y precios | `docs/PLANES.md` |
| Fases del proyecto | `docs/FASES.md` |
| Estado actual | `docs/ESTADO.md` |
| Registro de decisiones | `docs/DECISIONES.md` |

## Stack

- **Web:** Vite + React 18 + TypeScript + Tailwind CSS
- **API (previsto):** Fastify + TypeScript + Zod
- **DB (previsto):** PostgreSQL + Prisma
- **Jobs (previsto):** Redis + BullMQ
- **Storage (previsto):** S3-compatible
- **Pagos (previsto):** Stripe TEST → LIVE tras aprobación humana
- **Tests (previsto):** Vitest + Playwright

## Estado actual: FASE 04 IMPLEMENTADA (con limitaciones)

Cliente API centralizado implementado para conectar frontend con backend. Auditoría de integridad completada (repositorio íntegro). Tool SDK diseñado con tipos completos. 3 herramientas deterministas implementadas (calculadora MIDI, intervalos, duración). Herramientas calculadoras listas para certificación. Frontend preparado para conectarse con backend real. Tool SDK parcialmente integrado (conflictos de tipos con FASE 01 requieren refactorización). PostgreSQL y ejecución de tests pendientes.

## Reglas permanentes

1. No modificar el proyecto ANDALUS RE/REA.
2. No inventar credenciales, métricas ni integraciones.
3. No publicar herramientas sin pruebas E2E reales.
4. Servidor resuelve precios, saldos y autorizaciones.
5. Sin nueva fase automática tras informe.
