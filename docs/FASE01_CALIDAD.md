# FASE 01 — CRITERIOS DE CALIDAD

## Puerta de calidad (Quality Gate)

Cada herramienta debe superar estos 10 criterios para pasar a AVAILABLE:

| # | Criterio | Descripción |
|---|----------|-------------|
| 1 | Implementación | Motor funcional programado |
| 2 | Contrato de entrada | Tipos y validaciones definidos |
| 3 | Contrato de salida | Tipos de resultado definidos |
| 4 | Validaciones | Inputs verificados antes de procesar |
| 5 | Gestión de errores | Errores capturados y comunicados |
| 6 | Pruebas funcionales | Tests que verifican comportamiento |
| 7 | Resultados verificados | Outputs comprobados contra referencia |
| 8 | Documentación | Uso, parámetros y ejemplos documentados |
| 9 | Limitaciones conocidas | Restricciones declaradas |
| 10 | Control de coste | Cotización y consumo registrados |

## Estado actual

**Ninguna herramienta ha superado la puerta de calidad.**

Todas las herramientas registradas tienen `passedQualityGate: false`.

## Reglas

- No mostrar como "Disponible" sin superar quality gate.
- No permitir ejecución sin motor funcional.
- No cobrar por herramientas no verificadas.
- El estado AVAILABLE deriva del registro de certificación, no de una etiqueta editable.
