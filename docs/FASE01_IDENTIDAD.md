# FASE 01 — IDENTIDAD CORPORATIVA E INTERFAZ PROFESIONAL

## Identidad de marca

- **Empresa matriz:** AL-ANDALUS AI
- **Producto:** ANDALUS STUDIO
- **Lema corporativo:** INTELLIGENCE · ENGINEERING · EUROPE
- **Lema del producto:** CREATE · COMPOSE · ORCHESTRATE
- **Paleta:** Verde andaluz (#007A3D), blanco, verde profundo (#073C27)
- **Tipografía:** Inter (sans-serif), JetBrains Mono (monospace)

## Anagrama

- **Estado:** PENDIENTE
- El archivo `AL_ANDALUS_AI_ANAGRAMA_APROBADO.png` no se ha encontrado en el repositorio.
- Se utiliza identificación tipográfica provisional ("AA" en gradiente verde).
- La identidad gráfica definitiva queda pendiente de incorporar el anagrama original.

## Sistema de diseño

### Variables CSS centralizadas (`src/styles/tokens.css`)

- Paleta completa con variables CSS
- Soporte para tema claro y oscuro (`data-theme`)
- Respeto a `prefers-reduced-motion`
- Contrastes WCAG AA
- Focus visible para accesibilidad por teclado

### Temas

| Tema | Activación |
|------|-----------|
| Light | Por defecto / `data-theme="light"` |
| Dark | `data-theme="dark"` / preferencia del sistema |

La preferencia se guarda en `localStorage` bajo `andalus-theme`.

## Navegación

| Ruta | Página | Estado |
|------|--------|--------|
| `/` | Inicio (portada profesional) | ✅ Implementada |
| `/tools` | Catálogo de herramientas | ✅ Implementada |
| `/tools/:slug` | Ficha individual | ✅ Implementada |
| `/pricing` | Planes y precios | ✅ Implementada |
| `/login` | Inicio de sesión | ✅ Implementada (simulada) |
| `/register` | Registro | ✅ Implementado (simulado) |
| `/dashboard` | Panel de control | ✅ Implementado |
| `/studio` | Estudio integrado | ⏳ Placeholder |
| `/how-it-works` | Cómo funciona | ✅ Implementada |
| `/legal/:type` | Legal (privacy, terms, cookies) | ✅ Placeholder |

## Responsive

- Header con menú móvil colapsable
- Grid adaptativo en catálogo (1/2/3 columnas)
- Tarjetas con buen tamaño táctil
- Sin desbordamientos horizontales
- Navegación por teclado funcional
