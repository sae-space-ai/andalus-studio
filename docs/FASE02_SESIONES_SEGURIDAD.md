# FASE 02 — SESIONES Y SEGURIDAD

## Sesiones

### Generación
- ID: 32 bytes aleatorios en hexadecimal (64 caracteres)
- Almacenamiento: PostgreSQL (tabla `sessions`)
- Cookie: `session_id` con atributos de seguridad

### Atributos de Cookie
- `HttpOnly`: true - No accesible desde JavaScript
- `Secure`: true en producción (HTTPS)
- `SameSite`: lax (configurable)
- `Path`: /
- `MaxAge`: 7 días (configurable)

### Ciclo de Vida
1. **Creación**: Login exitoso
2. **Validación**: Cada request autenticado
3. **Extensión**: No hay sliding window (caducidad fija)
4. **Revocación**: Logout manual o automático por caducidad
5. **Eliminación**: Logout o revocación explícita

### Validación
1. Extraer `session_id` de cookie
2. Buscar sesión en base de datos
3. Verificar expiración
4. Si expirada: eliminar y rechazar
5. Si válida: continuar request

### Revocación
- **Individual**: `DELETE /api/account/sessions/:id`
- **Masiva**: `POST /api/account/logout-all`
- **Automática**: Al cambiar contraseña

## CSRF Protection

### Implementación
- Plugin: `@fastify/csrf-protection`
- Token en cookie: `_csrf`
- Validación en mutaciones (POST, PUT, PATCH, DELETE)
- Excepción: endpoints de autenticación

### Flujo
1. Cliente obtiene token CSRF: `GET /api/auth/csrf`
2. Cliente incluye token en header: `x-csrf-token`
3. Servidor valida token contra cookie
4. Si inválido: rechaza con 403

## Rate Limiting

### Configuración
- Límite: 100 requests por minuto
- Ventana: 60 segundos
- Clave: IP del cliente
- Respuesta: 429 Too Many Requests

### Endpoints Protegidos
- Todos los endpoints de la API
- Límites adicionales específicos:
  - Reenvío de verificación: 3/24h
  - Recuperación de contraseña: 3/1h

## Headers de Seguridad (Helmet)

- `Content-Security-Policy`: Solo en producción
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 0 (desactivado, CSP es mejor)
- `Strict-Transport-Security`: max-age=31536000
- `Referrer-Policy`: strict-origin-when-cross-origin

## Hashing de Contraseñas

### Algoritmo
- **Argon2id** (recomendado por OWASP)
- Memory cost: 64 MB
- Time cost: 3 iteraciones
- Parallelism: 4 hilos
- Salt length: 16 bytes
- Hash length: 32 bytes

### Ventajas
- Resistente a ataques de GPU
- Resistente a ataques de side-channel
- Configurable para ajustar seguridad/rendimiento

## Tokens

### Generación
- UUID v4 criptográficamente seguro
- 128 bits de entropía

### Almacenamiento
- Hash con Argon2id (menor coste que contraseñas)
- Memory cost: 32 MB
- Time cost: 2 iteraciones

### Caducidad
- Verificación de email: 24 horas
- Recuperación de contraseña: 1 hora

## Validación de Entradas

### Zod Schemas
- Email: formato válido, max 255 caracteres, normalizado
- Contraseña: min 8, max 128, mayúsculas + minúsculas + números
- DisplayName: min 1, max 100 caracteres

### Sanitización
- Email: lowercase + trim
- Strings: trim automático

## Protección contra Fuerza Bruta

### Login
- Registro de intentos fallidos
- Mensajes genéricos (no revela si usuario existe)
- Rate limiting global

### Recuperación de Contraseña
- Límite de 3 solicitudes por hora
- Mensajes genéricos
- No revela si el email existe

## Auditoría

### Eventos Registrados
- Registro de usuario
- Login (éxito/fallo)
- Logout
- Verificación de email
- Recuperación de contraseña
- Actualización de perfil
- Revocación de sesiones

### Datos Almacenados
- ID de usuario (si aplica)
- ID de sesión (si aplica)
- IP del cliente
- User-Agent
- Metadata adicional (JSON)
- Timestamp

### Retención
- Configurable por tipo de evento
- Recomendado: 90 días para seguridad
- Recomendado: 1 año para auditoría

## Estado

- ✅ Implementado
- ⏳ Pendiente de ejecución en entorno real
- ⏳ Requiere configuración de producción (HTTPS, cookies seguras)
