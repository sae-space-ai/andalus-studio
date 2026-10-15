# ARQUITECTURA — Al-Andalus AI · Andalus Studio

## Visión general

Monorepo independiente con separación clara entre frontend, API, worker y paquetes compartidos.

```
andalus-studio/
├── apps/
│   ├── web/          # Vite + React + TypeScript (SPA)
│   ├── api/          # Fastify + TypeScript + Zod
│   └── worker/       # BullMQ consumers
├── packages/
│   ├── branding/     # Identidad visual, anagrama, tokens
│   ├── contracts/    # Tipos compartidos API ↔ Web
│   ├── ui/           # Componentes UI compartidos
│   ├── tool-sdk/     # SDK para registro de herramientas
│   ├── billing/      # Lógica de créditos, ledger, cotización
│   ├── music-core/   # Algoritmos musicales deterministas
│   └── orchestration/# Orquestación de especialistas IA
├── prisma/
│   └── schema.prisma # Modelo de datos
├── infra/            # Docker, CI/CD, deploy configs
├── assets/reference/ # Recursos de referencia
├── docs/             # Documentación
└── tests/            # Tests E2E e integración
```

## Principios

1. **Separación de responsabilidades:** Frontend nunca decide precios, saldos ni autorizaciones.
2. **Tenancy:** Todos los datos indexados por organización/tenant.
3. **Idempotencia:** Ledger de créditos con operaciones atómicas e idempotentes.
4. **Seguridad por diseño:** OWASP, GDPR, sesiones HttpOnly, CSRF, sin criptografía casera.
5. **Transparencia:** Todo consumo de créditos registrado y auditable.
6. **Legal:** Consentimiento para voces/obras de terceros, licencias claras.

## Flujo de datos

```
Usuario → Web (SPA) → API (Fastify) → PostgreSQL (Prisma)
                        ↓
                   Redis/BullMQ → Worker → Storage (S3)
                        ↓
                   Stripe (webhooks) → Ledger → Entitlements
```

## Despliegue previsto

- Frontend: CDN estático (Vercel/Netlify/Cloudflare Pages)
- API: Node.js en contenedor (Docker)
- Worker: Proceso separado con BullMQ
- DB: PostgreSQL gestionado (Supabase/Neon/AWS RDS)
- Cache: Redis gestionado (Upstash/AWS ElastiCache)
- Storage: S3-compatible (AWS S3/Cloudflare R2)

## Estado: FASE 00

- [x] Estructura de directorios definida
- [x] Modelo de datos diseñado
- [x] Contratos API especificados
- [x] Planes parametrizados
- [x] Frontend de demostración creado
- [ ] API Fastify implementada (FASE 01)
- [ ] Worker BullMQ implementado (FASE 02)
- [ ] Integración Stripe TEST (FASE 03)
