# FASE 01 — INTERFAZ Y CATÁLOGO

## Arquitectura de la interfaz

### Estructura de archivos

```
src/
├── App.tsx                    # Router principal y páginas
├── main.tsx                   # Entry point
├── index.css                  # Estilos globales + tokens
├── styles/
│   └── tokens.css             # Sistema de diseño (variables CSS)
├── context/
│   ├── AuthContext.tsx        # Estado de autenticación (simulado)
│   └── ThemeContext.tsx       # Tema claro/oscuro
├── features/
│   ├── tools/
│   │   ├── types.ts           # Tipos del catálogo
│   │   ├── registry.ts        # Registro maestro (23 herramientas)
│   │   └── hooks.ts           # Búsqueda, filtrado, recomendación
│   ├── account/
│   │   └── pages/
│   │       ├── ForgotPasswordPage.tsx  # Recuperar contraseña
│   │       └── AccountPage.tsx         # Perfil y organización
│   └── pricing/
│       └── pages/
│           ├── BillingPage.tsx         # Facturación
│           ├── CreditsPage.tsx         # Créditos y ledger
│           └── SubscriptionPage.tsx    # Gestión de suscripción
├── types/
│   └── index.ts               # Tipos globales (User, Plan, etc.)
└── tests/
    └── catalog.test.ts        # 30 tests del catálogo
```

### Páginas implementadas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | HomePage | Portada profesional con hero, categorías, recomendador |
| `/tools` | ToolsPage | Catálogo con buscador y filtros |
| `/tools/:slug` | ToolDetailPage | Ficha individual reutilizable |
| `/pricing` | PricingPage | 5 planes con precios orientativos |
| `/login` | LoginPage | Formulario de acceso (simulado) |
| `/register` | RegisterPage | Formulario de registro (simulado) |
| `/forgot-password` | ForgotPasswordPage | Recuperación de contraseña (simulada) |
| `/dashboard` | DashboardPage | Panel de control |
| `/account` | AccountPage | Perfil y organización |
| `/billing` | BillingPage | Facturación (placeholder) |
| `/credits` | CreditsPage | Créditos y ledger (simulado) |
| `/subscription` | SubscriptionPage | Gestión de suscripción (placeholder) |
| `/studio` | StudioPage | Placeholder (en desarrollo) |
| `/how-it-works` | HowItWorksPage | Explicación del circuito |
| `/legal/:type` | LegalPage | Privacidad, términos, cookies |

### Componentes de layout

- **Header:** Navegación global, tema toggle, auth links, menú móvil
- **Footer:** Información corporativa, enlaces legales, estado del proyecto
- **Layout:** Wrapper con header + main + footer

### Sistema de diseño

- Variables CSS centralizadas en `tokens.css`
- Soporte para tema claro y oscuro
- Respeto a `prefers-reduced-motion`
- Focus visible para accesibilidad
- Contrastes WCAG AA

### Navegación

- React Router v6
- Rutas anidadas y dinámicas
- Navegación responsive (desktop + móvil)
- Menú móvil colapsable
- Links funcionales entre páginas

### Estado global

- **AuthContext:** Usuario, organización, entitlement, wallet (simulado)
- **ThemeContext:** Tema claro/oscuro con persistencia en localStorage

### Catálogo

- 23 herramientas registradas en 10 familias
- Buscador con normalización de texto (acentos, mayúsculas)
- Filtros por familia, estado, acceso, modo de ejecución
- Ordenación por nombre, créditos, estado, familia
- Recomendador determinista por intenciones
- Fichas individuales reutilizables

### Rendimiento

- Build optimizado con Vite
- Code splitting automático
- CSS mínimo con Tailwind
- Sin dependencias innecesarias
- Bundle final: ~240 KB JS + ~35 KB CSS
