# FASE 02 — AUTENTICACIÓN

## Registro

### Endpoint
`POST /api/auth/register`

### Flujo
1. Validación de entrada con Zod
2. Verificación de email duplicado (sin revelar existencia)
3. Hash de contraseña con Argon2id
4. Creación de usuario en estado PENDING_VERIFICATION
5. Generación de token de verificación UUID
6. Hash del token para almacenamiento
7. Envío de email de verificación
8. Registro de evento de auditoría

### Respuesta
```json
{
  "message": "Registro exitoso. Revisa tu email para verificar tu cuenta.",
  "userId": "uuid"
}
```

### Seguridad
- No revela si el email ya existe
- Contraseña nunca se almacena en texto plano
- Token de verificación con hash
- Caducidad de 24 horas

## Verificación de Email

### Endpoint
`POST /api/auth/verify-email`

### Flujo
1. Búsqueda de token no usado y no expirado
2. Verificación del token contra hash
3. Marcado del token como usado
4. Actualización del usuario:
   - emailVerifiedAt = now()
   - status = ACTIVE
5. Registro de auditoría

### Seguridad
- Token almacenado con hash
- Un solo uso
- Caducidad estricta

## Login

### Endpoint
`POST /api/auth/login`

### Flujo
1. Validación de entrada
2. Búsqueda de usuario por email
3. Verificación de contraseña con Argon2
4. Verificación de estado de cuenta
5. Verificación de email verificado
6. Creación de sesión
7. Establecimiento de cookie HttpOnly
8. Actualización de lastLoginAt
9. Registro de intento (éxito/fallo)
10. Registro de auditoría

### Respuesta
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "displayName": "User Name",
    "role": "USER",
    "status": "ACTIVE"
  },
  "session": {
    "id": "session-id",
    "userId": "uuid",
    "expiresAt": "2025-01-15T00:00:00Z"
  }
}
```

### Seguridad
- Mensajes genéricos para errores de credenciales
- Registro de intentos fallidos
- Verificación de estado de cuenta
- Cookie HttpOnly + Secure + SameSite

## Logout

### Endpoint
`POST /api/auth/logout`

### Flujo
1. Obtener session_id de cookie
2. Eliminar sesión de la base de datos
3. Limpiar cookie
4. Registro de auditoría

## Recuperación de Contraseña

### Endpoint
`POST /api/auth/forgot-password`

### Flujo
1. Búsqueda de usuario
2. Verificación de límite de solicitudes (3/hora)
3. Generación de token de recuperación
4. Hash del token
5. Envío de email
6. Registro de auditoría

### Endpoint
`POST /api/auth/reset-password`

### Flujo
1. Búsqueda de token no usado y no expirado
2. Verificación del token
3. Hash de nueva contraseña
4. Actualización de contraseña
5. Marcado del token como usado
6. Revocación de todas las sesiones excepto la actual
7. Registro de auditoría

### Seguridad
- No revela si el email existe
- Token con hash
- Un solo uso
- Caducidad de 1 hora
- Revocación de sesiones anteriores

## Estados de Cuenta

- `PENDING_VERIFICATION` - Registro completado, email no verificado
- `ACTIVE` - Cuenta activa y verificada
- `SUSPENDED` - Cuenta suspendida por administración
- `DISABLED` - Cuenta deshabilitada permanentemente

## Roles

- `USER` - Usuario estándar
- `STAFF` - Personal con permisos adicionales
- `ADMIN` - Administrador con acceso completo

## Auditoría

Todos los eventos importantes se registran en la tabla `AuditEvent`:
- user.register
- user.login
- user.logout
- user.verify_email
- user.forgot_password
- user.reset_password
- user.update_profile
- session.revoke

## Estado

- ✅ Implementado
- ⏳ Pendiente de ejecución en entorno real
- ⏳ Requiere PostgreSQL
- ⏳ Requiere proveedor de email (o modo console)
