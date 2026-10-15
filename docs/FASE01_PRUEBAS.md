# FASE 01 — PRUEBAS

## Framework

Vitest (compatible con el entorno Vite).

## Pruebas creadas

Archivo: `src/tests/catalog.test.ts`

### Tests implementados (30)

| # | Test | Descripción |
|---|------|-------------|
| 01 | Registro contiene herramientas | Verifica que el registro no está vacío |
| 02 | IDs únicos | Sin duplicados en identificadores |
| 03 | Slugs únicos | Sin duplicados en slugs |
| 04 | Nombre presente | Todas tienen nombre |
| 05 | Familia válida | Todas pertenecen a una familia existente |
| 06 | Estado válido | Estado dentro de los permitidos |
| 07 | Sin AVAILABLE | Ninguna herramienta disponible (sin motores) |
| 08 | Quality gate definido | Todas tienen qualityGate |
| 09 | Sin quality gate superado | Ninguna ha pasado el control |
| 10 | Nunca verificadas | lastVerifiedAt es null |
| 11 | getToolBySlug correcto | Devuelve la herramienta esperada |
| 12 | getToolBySlug inexistente | Devuelve undefined |
| 13 | getToolById correcto | Devuelve por ID |
| 14 | getToolsByFamily | Filtra por familia |
| 15 | getPublicTools | Solo públicas y no desactivadas |
| 16 | getAllSlugs | Devuelve todos los slugs |
| 17 | getAllIds | Devuelve todos los IDs |
| 18 | 10 familias | Exactamente 10 familias definidas |
| 19 | Familias completas | Nombre, icono, descripción |
| 20 | Familias con herramientas | Cada familia tiene al menos una |
| 21 | getStatusLabel | Etiquetas correctas |
| 22 | getStatusColor | Clases CSS válidas |
| 23 | canToolExecute false | PLANNED no es ejecutable |
| 24 | isToolPublic true | Públicas son visibles |
| 25 | Sin secretos | No hay API keys en el registro |
| 26 | Sin URLs de pago | No hay referencias a Stripe |
| 27 | estimatedCredits tipo | Número o null |
| 28 | Gratuitas = 0 créditos | FREE_NO_LIMIT tiene coste 0 |
| 29 | Related tools existen | Las referencias son válidas |
| 30 | Formatos válidos | Input/output formats conocidos |

## Estado de ejecución

- ✅ Tests creados
- ⏳ Tests no ejecutados (no hay script de test configurado en package.json)
- ✅ Build exitoso
- ✅ Typecheck implícito en build

## Nota

Para ejecutar los tests en un entorno con script configurado:
```bash
npx vitest run
```
