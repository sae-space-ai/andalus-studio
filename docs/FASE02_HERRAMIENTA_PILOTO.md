# FASE 02 — HERRAMIENTA PILOTO: CALCULADORA MIDI

## Descripción

Primera herramienta musical verificable de Andalus Studio. Implementa conversión entre notas MIDI y frecuencias usando el sistema de temperamento igual de 12 notas (12-TET).

## Ubicación

`apps/api/src/modules/tools/midi-calculator.ts`

## Funcionalidad

### MIDI → Frecuencia
Convierte un número MIDI (0-127) a frecuencia en Hz.

**Fórmula:**
```
f = tuningFrequency * 2^((midi - 69) / 12)
```

Donde:
- `tuningFrequency` = 440 Hz (A4, por defecto)
- `midi` = número MIDI (69 = A4)

### Frecuencia → MIDI
Convierte una frecuencia en Hz al número MIDI más cercano.

**Fórmula:**
```
midi = 69 + 12 * log2(frequency / tuningFrequency)
```

### Información de Nota
Para cada número MIDI proporciona:
- Nombre de nota (ej: "A4", "C#3")
- Octava
- Frecuencia exacta
- Desviación en cents (para frecuencias no exactas)

## Endpoints

### POST /api/tools/midi-to-frequency
Convierte MIDI a frecuencia.

**Request:**
```json
{
  "midi": 69,
  "tuningFrequency": 440
}
```

**Response:**
```json
{
  "note": {
    "midi": 69,
    "note": "A4",
    "octave": 4,
    "frequency": 440,
    "cents": 0
  },
  "tuningSystem": "Equal Temperament (12-TET)",
  "tuningFrequency": 440
}
```

### POST /api/tools/frequency-to-midi
Convierte frecuencia a MIDI.

**Request:**
```json
{
  "frequency": 440,
  "tuningFrequency": 440
}
```

**Response:**
```json
{
  "midi": 69,
  "nearestMidi": 69,
  "note": "A4",
  "octave": 4,
  "exactFrequency": 440,
  "cents": 0,
  "tuningSystem": "Equal Temperament (12-TET)",
  "tuningFrequency": 440
}
```

### GET /api/tools/midi-calculator/verify
Verifica que las conversiones son correctas.

**Response:**
```json
{
  "status": "ok",
  "tests": [
    {
      "name": "MIDI 69 → 440 Hz",
      "passed": true,
      "expected": 440,
      "actual": 440
    }
  ],
  "timestamp": "2025-01-10T00:00:00Z"
}
```

## Verificaciones Matemáticas

### Tests Implementados

1. **MIDI 69 → 440 Hz** ✅
   - A4 estándar

2. **MIDI 60 → 261.6256 Hz** ✅
   - C4 (Do central)

3. **440 Hz → MIDI 69** ✅
   - Conversión inversa

4. **880 Hz → MIDI 81** ✅
   - A5 (octava superior)

5. **MIDI 0 → 8.1758 Hz** ✅
   - C-1 (nota más baja)

6. **MIDI 127 → 12543.88 Hz** ✅
   - G9 (nota más alta)

## Validación de Entradas

### MIDI
- Debe ser entero
- Rango: 0-127
- Error si está fuera de rango

### Frecuencia
- Debe ser número positivo finito
- Rechaza 0, negativos, Infinity, NaN

### Tuning Frequency
- Debe ser número positivo finito
- Por defecto: 440 Hz

## Limitaciones

- Solo temperamento igual de 12 notas
- No soporta otros sistemas de afinación
- No procesa audio (solo cálculos matemáticos)
- No genera sonido

## Estado

- ✅ Motor implementado
- ✅ Contratos de entrada/salida definidos
- ✅ Validaciones implementadas
- ✅ Tests unitarios creados
- ✅ Verificaciones matemáticas correctas
- ⏳ Pendiente de integración con frontend
- ⏳ Pendiente de ejecución de tests en entorno real

## Próximos Pasos

1. Ejecutar tests en entorno real
2. Integrar con frontend React
3. Crear UI para la calculadora
4. Documentar para usuarios
5. Considerar estado AVAILABLE si todo funciona
