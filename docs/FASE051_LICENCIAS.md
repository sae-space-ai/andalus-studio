# FASE 05.1 — LICENCIAS

## Resumen de Licencias

Todas las herramientas implementadas en FASE 05.1 utilizan código propio o bibliotecas con licencias permisivas compatibles con uso comercial.

---

## Herramientas Implementadas

### 1. Calculadora MIDI
**Archivo:** `src/features/tools/midi-calculator.ts`

**Dependencias:**
- Ninguna (código propio)

**Licencia:** 
- Código propio de AL-ANDALUS AI
- Sin dependencias externas
- ✅ Compatible con uso comercial

**Algoritmo:**
- Fórmula matemática de temperamento igual (12-TET)
- `f = A4 * 2^((midi - 69) / 12)`
- Conocimiento público de teoría musical

---

### 2. Calculadora de BPM
**Archivo:** `src/features/tools/bpm-calculator.ts`

**Dependencias:**
- Ninguna (código propio)

**Licencia:**
- Código propio de AL-ANDALUS AI
- Sin dependencias externas
- ✅ Compatible con uso comercial

**Algoritmo:**
- Cálculo estadístico de intervalos
- Análisis de varianza para confianza
- Conocimiento público de procesamiento de señales

---

### 3. Metrónomo
**Archivo:** `src/features/tools/metronome.ts`

**Dependencias:**
- Web Audio API (estándar del navegador)

**Licencia:**
- Código propio de AL-ANDALUS AI
- Web Audio API: Estándar W3C, implementación del navegador
- ✅ Compatible con uso comercial

**Algoritmo:**
- Scheduling de audio con Web Audio API
- Cálculo de tiempos basado en BPM y compás
- Conocimiento público de procesamiento de audio

---

### 4. Afinador
**Archivo:** `src/features/tools/tuner.ts`

**Dependencias:**
- Web Audio API (estándar del navegador)

**Licencia:**
- Código propio de AL-ANDALUS AI
- Web Audio API: Estándar W3C, implementación del navegador
- ✅ Compatible con uso comercial

**Algoritmo:**
- Autocorrelación para detección de pitch
- Conocimiento público de procesamiento de señales de audio
- No utiliza modelos de IA ni bibliotecas externas

---

### 5. Calculadora de Intervalos
**Archivo:** `src/features/tools/interval-calculator.ts`

**Dependencias:**
- Ninguna (código propio)

**Licencia:**
- Código propio de AL-ANDALUS AI
- Sin dependencias externas
- ✅ Compatible con uso comercial

**Algoritmo:**
- Teoría musical occidental (intervalos, semitonos)
- Conocimiento público de teoría musical
- No utiliza bibliotecas externas

---

### 6. Analizador de Métrica
**Archivo:** `src/features/tools/metric-analyzer.ts`

**Dependencias:**
- Ninguna (código propio)

**Licencia:**
- Código propio de AL-ANDALUS AI
- Sin dependencias externas
- ✅ Compatible con uso comercial

**Algoritmo:**
- Reglas de silabeo del español
- Reglas de acentuación (agudas, graves, esdrújulas)
- Conocimiento público de lingüística española
- No utiliza modelos de IA ni bibliotecas externas

---

### 7. Analizador de Rimas
**Archivo:** `src/features/tools/rhyme-analyzer.ts`

**Dependencias:**
- Ninguna (código propio)

**Licencia:**
- Código propio de AL-ANDALUS AI
- Sin dependencias externas
- ✅ Compatible con uso comercial

**Algoritmo:**
- Reglas de rima consonante y asonante
- Detección de vocales acentuadas
- Conocimiento público de lingüística española
- No utiliza modelos de IA ni bibliotecas externas

---

### 8. Sonificación de Datos
**Archivo:** `src/features/tools/sonification.ts`

**Dependencias:**
- Ninguna (código propio)

**Licencia:**
- Código propio de AL-ANDALUS AI
- Sin dependencias externas
- ✅ Compatible con uso comercial

**Algoritmo:**
- Mapeo lineal y logarítmico de datos a frecuencias
- Conversión de frecuencias a notas MIDI
- Conocimiento público de sonificación y teoría musical
- No utiliza modelos de IA ni bibliotecas externas

---

## Bibliotecas Externas Utilizadas

### Zod
**Uso:** Validación de esquemas de entrada/salida
**Licencia:** MIT
**Compatibilidad:** ✅ Compatible con uso comercial
**Repositorio:** https://github.com/colinhacks/zod

### Web Audio API
**Uso:** Metrónomo y Afinador
**Licencia:** Estándar W3C (implementación del navegador)
**Compatibilidad:** ✅ Compatible con uso comercial
**Documentación:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## Herramientas Pendientes (No Implementadas)

### Requieren Bibliotecas Externas

#### Analizador MIDI
**Biblioteca requerida:** `midi-parser-js` o `midi-file`
**Licencia:** MIT
**Compatibilidad:** ✅ Compatible con uso comercial
**Estado:** ❌ No implementada

#### Editor de Partituras
**Biblioteca requerida:** VexFlow o OpenSheetMusicDisplay
**Licencia:** MIT
**Compatibilidad:** ✅ Compatible con uso comercial
**Estado:** ❌ No implementada

#### Analizador Tonal
**Biblioteca requerida:** music21 (Python)
**Licencia:** BSD License
**Compatibilidad:** ✅ Compatible con uso comercial
**Estado:** ❌ No implementada (requiere backend Python)

### Requieren APIs de IA

#### Herramientas de Letras y Lenguaje (6 herramientas)
**APIs requeridas:** OpenAI, Anthropic, etc.
**Licencia:** Depende del proveedor
**Compatibilidad:** ⚠️ Requiere revisión de términos de servicio
**Estado:** ❌ No implementadas

#### Herramientas de Voz y Canto (4 herramientas)
**APIs requeridas:** ElevenLabs, OpenAI TTS, etc.
**Licencia:** Depende del proveedor
**Compatibilidad:** ⚠️ Requiere revisión de términos de servicio
**Estado:** ❌ No implementadas

#### Herramientas de Imagen y Vídeo (5 herramientas)
**APIs requeridas:** DALL-E, Stability AI, etc.
**Licencia:** Depende del proveedor
**Compatibilidad:** ⚠️ Requiere revisión de términos de servicio
**Estado:** ❌ No implementadas

### Requieren Modelos de IA

#### Separador de Fuentes
**Modelo requerido:** Spleeter, Demucs, etc.
**Licencia:** MIT (Spleeter), MIT (Demucs)
**Compatibilidad:** ✅ Compatible con uso comercial
**Estado:** ❌ No implementada (requiere GPU)

#### Generador de Portadas
**Modelo requerido:** Stable Diffusion, DALL-E, etc.
**Licencia:** Depende del modelo/proveedor
**Compatibilidad:** ⚠️ Requiere revisión de licencia
**Estado:** ❌ No implementada

---

## Resumen de Compatibilidad

### Herramientas Implementadas (8)
- ✅ 8 herramientas con código propio
- ✅ 0 dependencias con licencias restrictivas
- ✅ 100% compatibles con uso comercial
- ✅ Sin obligaciones de atribución

### Herramientas Pendientes (15)
- ⚠️ 3 herramientas requieren bibliotecas MIT/BSD (compatibles)
- ⚠️ 12 herramientas requieren APIs de IA (revisión necesaria)
- ❌ 0 herramientas con licencias incompatibles

---

## Obligaciones de Atribución

### Código Propio (8 herramientas)
- No requiere atribución
- No requiere aviso de licencia
- Uso comercial permitido sin restricciones

### Bibliotecas Externas (si se integran)
- **Zod (MIT):** Requiere mantener aviso de copyright
- **Web Audio API (W3C):** Estándar abierto, sin restricciones
- **midi-parser-js (MIT):** Requiere mantener aviso de copyright
- **VexFlow (MIT):** Requiere mantener aviso de copyright
- **music21 (BSD):** Requiere mantener aviso de copyright

### APIs de IA (si se integran)
- Depende de los términos de servicio de cada proveedor
- Requiere revisión individual de cada API
- Puede haber restricciones de uso comercial
- Puede haber límites de uso y costos asociados

---

## Recomendaciones

### Para Herramientas Implementadas
✅ **Acción:** Ninguna requerida
- Todas las herramientas son de código propio
- No hay obligaciones de atribución
- Uso comercial permitido sin restricciones

### Para Herramientas Pendientes con Bibliotecas MIT/BSD
⚠️ **Acción:** Mantener avisos de copyright
- Incluir archivo LICENSE o NOTICE
- Mencionar bibliotecas en documentación
- Respetar términos de licencia

### Para Herramientas Pendientes con APIs de IA
⚠️ **Acción:** Revisar términos de servicio
- Verificar compatibilidad con uso comercial
- Evaluar costos de uso
- Revisar restricciones de contenido generado
- Considerar implicaciones de privacidad

---

## Conclusión

**Estado:** ✅ TODAS LAS HERRAMIENTAS IMPLEMENTADAS SON COMPATIBLES CON USO COMERCIAL

- 8 herramientas con código propio
- 0 dependencias con licencias restrictivas
- 100% compatibles con uso comercial
- Sin obligaciones de atribución para herramientas implementadas

**Recomendación:** Las herramientas implementadas pueden utilizarse comercialmente sin restricciones. Para las herramientas pendientes que requieren bibliotecas o APIs externas, se debe realizar una revisión individual de licencias y términos de servicio antes de su integración.

---

**AL-ANDALUS AI · ANDALUS STUDIO**
**FASE 05.1 — LICENCIAS**
**Estado: REVISIÓN COMPLETADA**
