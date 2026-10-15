# ANDALUS STUDIO API

Backend de Andalus Studio - FASE 02

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o pnpm

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Generar cliente Prisma
npm run db:generate

# Crear base de datos y migraciones
npm run db:push

# Iniciar en desarrollo
npm run dev
```

## Scripts

- `npm run dev` - Iniciar servidor en modo desarrollo (con hot reload)
- `npm run build` - Compilar TypeScript
- `npm run start` - Iniciar servidor compilado
- `npm run test` - Ejecutar tests
- `npm run test:run` - Ejecutar tests una vez
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:push` - Aplicar schema a la base de datos
- `npm run db:migrate` - Crear y aplicar migraciones
- `npm run db:studio` - Abrir Prisma Studio

## Estructura

```
apps/api/
├── src/
│   ├── config/          # Configuración del entorno
│   ├── modules/         # Módulos de negocio
│   │   ├── sessions/    # Gestión de sesiones
│   │   ├── email/       # Envío de emails
│   │   └── tools/       # Herramientas musicales
│   ├── routes/          # Rutas de la API
│   ├── security/        # Utilidades de seguridad
│   ├── tests/           # Tests
│   └── server.ts        # Servidor Fastify
├── .env.example         # Variables de entorno de ejemplo
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## API Endpoints

### Health
- `GET /api/health` - Verificar que el servidor está funcionando
- `GET /api/ready` - Verificar que está listo (incluye DB)

### Autenticación
- `GET /api/auth/csrf` - Obtener token CSRF
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/verify-email` - Verificar email
- `POST /api/auth/resend-verification` - Reenviar verificación
- `POST /api/auth/forgot-password` - Solicitar recuperación
- `POST /api/auth/reset-password` - Restablecer contraseña

### Cuenta
- `GET /api/account/profile` - Obtener perfil
- `PATCH /api/account/profile` - Actualizar perfil
- `GET /api/account/sessions` - Listar sesiones activas
- `DELETE /api/account/sessions/:id` - Revocar sesión
- `POST /api/account/logout-all` - Cerrar todas las sesiones

### Herramientas
- `POST /api/tools/midi-to-frequency` - Convertir MIDI a frecuencia
- `POST /api/tools/frequency-to-midi` - Convertir frecuencia a MIDI
- `GET /api/tools/midi-calculator/verify` - Verificar conversiones

## Seguridad

- Contraseñas hasheadas con Argon2id
- Sesiones con cookies HttpOnly + Secure + SameSite
- Protección CSRF
- Rate limiting
- Validación de entradas con Zod
- Tokens de verificación con hash

## Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests una vez
npm run test:run

# Ejecutar tests con cobertura
npm run test -- --coverage
```

## Variables de Entorno

Ver `.env.example` para todas las variables necesarias.

## Estado

- ✅ Implementado
- ⏳ Pendiente de ejecución en entorno real con PostgreSQL
