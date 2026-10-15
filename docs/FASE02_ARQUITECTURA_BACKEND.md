# FASE 02 — ARQUITECTURA DEL BACKEND

## Stack Tecnológico

- **Framework:** Fastify 5.x
- **Lenguaje:** TypeScript 5.x
- **Base de Datos:** PostgreSQL 14+
- **ORM:** Prisma 5.x
- **Validación:** Zod
- **Hashing:** Argon2id
- **Email:** Nodemailer
- **Tests:** Vitest

## Estructura

```
apps/api/
├── src/
│   ├── config/
│   │   └── env.ts              # Configuración validada con Zod
│   ├── modules/
│   │   ├── sessions/
│   │   │   └── session.ts      # Gestión de sesiones
│   │   ├── email/
│   │   │   └── email.ts        # Envío de emails
│   │   └── tools/
│   │       └── midi-calculator.ts  # Calculadora MIDI
│   ├── routes/
│   │   ├── auth.ts             # Rutas de autenticación
│   │   ├── account.ts          # Rutas de cuenta
│   │   ├── tools.ts            # Rutas de herramientas
│   │   └── health.ts           # Health checks
│   ├── security/
│   │   └── crypto.ts           # Utilidades criptográficas
│   ├── tests/
│   │   ├── midi-calculator.test.ts
│   │   └── security.test.ts
│   └── server.ts               # Servidor principal
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Plugins de Seguridad

### Helmet
Headers HTTP seguros:
- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security

### CORS
- Origen permitido: FRONTEND_URL
- Credenciales: true
- Métodos: GET, POST, PUT, PATCH, DELETE

### Cookies
- HttpOnly: true
- Secure: true en producción
- SameSite: lax (configurable)
- Path: /

### CSRF Protection
- Tokens CSRF en cookies
- Validación en mutaciones
- Protección contra ataques cross-site

### Rate Limiting
- 100 requests por minuto por IP
- Configurable vía variables de entorno

## Flujo de Autenticación

1. **Registro**
   - Validación con Zod
   - Hash de contraseña con Argon2id
   - Generación de token de verificación
   - Envío de email de verificación
   - Usuario en estado PENDING_VERIFICATION

2. **Verificación de Email**
   - Token almacenado con hash
   - Caducidad: 24 horas
   - Un solo uso
   - Activación de cuenta

3. **Login**
   - Validación de credenciales
   - Verificación de estado de cuenta
   - Creación de sesión
   - Cookie HttpOnly con session_id
   - Registro de auditoría

4. **Sesiones**
   - ID criptográficamente seguro (32 bytes hex)
   - Almacenamiento en PostgreSQL
   - Caducidad: 7 días (configurable)
   - Revocación individual o masiva

5. **Recuperación de Contraseña**
   - Token seguro con hash
   - Caducidad: 1 hora
   - Un solo uso
   - Revocación de sesiones anteriores

## Estado

- ✅ Código implementado
- ⏳ Pendiente de ejecución en entorno real
- ⏳ Requiere PostgreSQL configurado
- ⏳ Requiere proveedor de email (o modo console)
