# DECISIONES — Andalus Studio

## Registro de decisiones técnicas y de producto

### DEC-001: Stack frontend
- **Decisión:** Vite + React 18 + TypeScript + Tailwind CSS
- **Razón:** Entorno disponible, madurez, rendimiento, DX.
- **Fecha:** FASE 00

### DEC-002: Stack backend (previsto)
- **Decisión:** Fastify + TypeScript + Zod
- **Razón:** Rendimiento superior a Express, validación integrada con Zod, TypeScript nativo.
- **Fecha:** FASE 00

### DEC-003: Base de datos
- **Decisión:** PostgreSQL + Prisma ORM
- **Razón:** Fiabilidad, tipado seguro con Prisma, migraciones, ecosistema.
- **Fecha:** FASE 00

### DEC-004: Monorepo
- **Decisión:** pnpm workspaces
- **Razón:** Eficiencia en disco, speed, aislamiento de dependencias.
- **Nota:** En este entorno se usa npm. El monorepo real se configurará en despliegue.
- **Fecha:** FASE 00

### DEC-005: Créditos en enteros
- **Decisión:** Créditos como integers, no decimales.
- **Razón:** Sin errores de punto flotante, más simple, suficiente granularidad.
- **Fecha:** FASE 00

### DEC-006: Moneda en céntimos
- **Decisión:** Precios en céntimos de euro (integer).
- **Razón:** Evitar problemas de floating point con dinero. Estándar Stripe.
- **Fecha:** FASE 00

### DEC-007: Sin cobros excedentes
- **Decisión:** Nunca cobrar automáticamente más allá del plan.
- **Razón:** Transparencia, confianza del usuario, cumplimiento normativo.
- **Fecha:** FASE 00

### DEC-008: Servidor decide todo
- **Decisión:** Precios, saldos y autorizaciones solo en servidor.
- **Razón:** Seguridad. El navegador no es fuente de verdad.
- **Fecha:** FASE 00

### DEC-009: Identidad visual
- **Decisión:** Usar únicamente el anagrama corporativo aprobado.
- **Razón:** Consistencia de marca. No inventar logos.
- **Nota:** En este entorno se usa texto estilizado como placeholder del anagrama.
- **Fecha:** FASE 00

### DEC-010: Entorno de desarrollo
- **Decisión:** Adaptar al entorno disponible (Vite + npm).
- **Razón:** No se puede ejecutar servidor backend en este sandbox.
- **Impacto:** Frontend funcional con datos simulados. Backend como referencia.
- **Fecha:** FASE 00

### DEC-011: Sistema de diseño centralizado
- **Decisión:** Variables CSS en `src/styles/tokens.css` con soporte light/dark.
- **Razón:** Consistencia visual, mantenimiento sencillo, temas intercambiables.
- **Fecha:** FASE 01

### DEC-012: Catálogo basado en datos estructurados
- **Decisión:** Registro maestro tipado en `src/features/tools/registry.ts`.
- **Razón:** Separación de datos y presentación, reutilización, testabilidad.
- **Fecha:** FASE 01

### DEC-013: Estados conservadores de herramientas
- **Decisión:** Todas las herramientas en estado PLANNED. Ninguna AVAILABLE.
- **Razón:** Sin motores implementados. No falsear capacidades.
- **Fecha:** FASE 01

### DEC-014: Sin anagrama inventado
- **Decisión:** Usar identificación tipográfica provisional. No inventar logo.
- **Razón:** El anagrama original no se encontró. No crear imitaciones.
- **Fecha:** FASE 01

### DEC-015: Búsqueda tolerante a acentos
- **Decisión:** Normalización NFD para búsqueda.
- **Razón:** Mejora UX para usuarios hispanohablantes.
- **Fecha:** FASE 01

### DEC-016: Recomendador determinista
- **Decisión:** Mapeo de intenciones a herramientas sin IA externa.
- **Razón:** Sin servicios de IA configurados. Más económico y predecible.
- **Fecha:** FASE 01

### DEC-017: Argon2id para hashing
- **Decisión:** Usar Argon2id para contraseñas y tokens.
- **Razón:** Recomendado por OWASP, resistente a ataques GPU, configurable.
- **Fecha:** FASE 02

### DEC-018: Sesiones en PostgreSQL
- **Decisión:** Almacenar sesiones en base de datos, no en memoria.
- **Razón:** Permite escalar horizontalmente, revocación persistente.
- **Fecha:** FASE 02

### DEC-019: Cookies HttpOnly para sesiones
- **Decisión:** Usar cookies HttpOnly en lugar de localStorage.
- **Razón:** Más seguro contra XSS, no accesible desde JavaScript.
- **Fecha:** FASE 02

### DEC-020: Calculadora MIDI como primera herramienta
- **Decisión:** Implementar calculadora MIDI/frecuencias como herramienta piloto.
- **Razón:** Determinista, verificable matemáticamente, sin dependencias externas.
- **Fecha:** FASE 02

### DEC-021: Email en modo console para desarrollo
- **Decisión:** Imprimir emails en consola en desarrollo.
- **Razón:** No requiere proveedor SMTP para pruebas locales.
- **Fecha:** FASE 02
