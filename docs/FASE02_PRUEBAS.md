# FASE 02 — PRUEBAS

## Tests Creados

### Bloque A: Calculadora MIDI (midi-calculator.test.ts)

| # | Test | Estado |
|---|------|--------|
| 1 | MIDI 69 → 440 Hz | ✅ Creado |
| 2 | MIDI 60 → 261.63 Hz (C4) | ✅ Creado |
| 3 | MIDI 0 → 8.18 Hz | ✅ Creado |
| 4 | MIDI 127 → 12543.88 Hz | ✅ Creado |
| 5 | Rechaza MIDI fuera de rango | ✅ Creado |
| 6 | Rechaza MIDI no entero | ✅ Creado |
| 7 | Usa frecuencia de afinación personalizada | ✅ Creado |
| 8 | 440 Hz → MIDI 69 | ✅ Creado |
| 9 | 880 Hz → MIDI 81 (A5) | ✅ Creado |
| 10 | 261.63 Hz → MIDI 60 (C4) | ✅ Creado |
| 11 | Rechaza frecuencias no positivas | ✅ Creado |
| 12 | Rechaza frecuencias no finitas | ✅ Creado |
| 13 | getNoteName para MIDI 69 | ✅ Creado |
| 14 | getNoteName para MIDI 60 | ✅ Creado |
| 15 | getNoteName para MIDI 0 | ✅ Creado |
| 16 | getNoteName para MIDI 127 | ✅ Creado |
| 17 | getOctave para MIDI 69 | ✅ Creado |
| 18 | getOctave para MIDI 60 | ✅ Creado |
| 19 | getOctave para MIDI 0 | ✅ Creado |
| 20 | calculateCents para frecuencia exacta | ✅ Creado |
| 21 | calculateCents para frecuencia mayor | ✅ Creado |
| 22 | calculateCents para frecuencia menor | ✅ Creado |
| 23 | verifyConversions todas pasan | ✅ Creado |

**Total: 23 tests**

### Bloque B: Seguridad (security.test.ts)

| # | Test | Estado |
|---|------|--------|
| 1 | hashPassword hashea correctamente | ✅ Creado |
| 2 | hashPassword genera hashes diferentes | ✅ Creado |
| 3 | verifyPassword verifica contraseña correcta | ✅ Creado |
| 4 | verifyPassword rechaza contraseña incorrecta | ✅ Creado |
| 5 | verifyPassword maneja hashes inválidos | ✅ Creado |
| 6 | generateSecureToken genera tokens únicos | ✅ Creado |
| 7 | generateSecureToken genera UUID válidos | ✅ Creado |
| 8 | hashToken hashea token correctamente | ✅ Creado |
| 9 | verifyToken verifica token correcto | ✅ Creado |
| 10 | verifyToken rechaza token incorrecto | ✅ Creado |
| 11 | generateSessionId genera IDs únicos | ✅ Creado |
| 12 | generateSessionId genera IDs de 64 caracteres | ✅ Creado |
| 13 | normalizeEmail convierte a minúsculas | ✅ Creado |
| 14 | normalizeEmail elimina espacios | ✅ Creado |
| 15 | isPasswordStrong acepta contraseñas fuertes | ✅ Creado |
| 16 | isPasswordStrong rechaza sin mayúsculas | ✅ Creado |
| 17 | isPasswordStrong rechaza sin minúsculas | ✅ Creado |
| 18 | isPasswordStrong rechaza sin números | ✅ Creado |
| 19 | isPasswordStrong rechaza muy cortas | ✅ Creado |

**Total: 19 tests**

## Total de Tests

- **Tests de FASE 01:** 30 (catálogo)
- **Tests de FASE 02:** 42 (calculadora MIDI + seguridad)
- **Total acumulado:** 72 tests

## Ejecución

### Comando
```bash
cd apps/api
npm run test:run
```

### Estado de Ejecución

- ✅ Tests creados
- ⏳ Tests NO ejecutados (requiere entorno con Node.js y dependencias instaladas)
- ⏳ No se puede declarar "probado" sin ejecución real

## Cobertura Esperada

- Calculadora MIDI: 100% de funciones públicas
- Seguridad: 100% de funciones criptográficas
- Validaciones: Casos de éxito y error

## Próximos Pasos

1. Instalar dependencias: `npm install`
2. Ejecutar tests: `npm run test:run`
3. Verificar cobertura: `npm run test -- --coverage`
4. Documentar resultados reales

## Nota Importante

**Los tests están creados pero NO ejecutados en este entorno.**

Para ejecutarlos se requiere:
- Node.js 18+ instalado
- Dependencias instaladas (`npm install`)
- Entorno de ejecución disponible

No se declara "probado" hasta que los tests se ejecuten realmente con resultados documentados.
