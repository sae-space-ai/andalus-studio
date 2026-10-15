import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, DEMO_PLANS } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useToolCatalog, useToolRecommender } from './features/tools/hooks';
import { getToolBySlug } from './features/tools/registry';
import { getStatusLabel, getStatusColor, getCostPolicyLabel, canToolExecute, TOOL_FAMILIES as FAMILIES } from './features/tools/types';
import type { ToolFamily } from './features/tools/types';
import { useState } from 'react';

// Páginas de cuenta
import ForgotPasswordPage from './features/account/pages/ForgotPasswordPage';
import AccountPage from './features/account/pages/AccountPage';

// Páginas de facturación
import BillingPage from './features/pricing/pages/BillingPage';
import CreditsPage from './features/pricing/pages/CreditsPage';
import SubscriptionPage from './features/pricing/pages/SubscriptionPage';

// ═══════════════════════════════════════════
// COMPONENTES DE LAYOUT
// ═══════════════════════════════════════════

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/tools', label: 'Herramientas' },
    { to: '/studio', label: 'Estudio' },
    { to: '/pricing', label: 'Planes' },
    { to: '/how-it-works', label: 'Cómo funciona' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">AA</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-green-900 dark:text-green-400 text-lg">ANDALUS STUDIO</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 block -mt-1">CREATE · COMPOSE · ORCHESTRATE</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hidden sm:inline text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                  Panel
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
                  <button onClick={logout} className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">
                  Acceder
                </Link>
                <Link to="/register" className="px-4 py-2 bg-green-700 dark:bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors shadow-sm">
                  Registro
                </Link>
              </>
            )}
            
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 dark:border-gray-800 pt-4 animate-fade-in">
            {navLinks.map(link => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-sm text-green-700 dark:text-green-400" onClick={() => setMobileOpen(false)}>Panel</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-sm text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>Acceder</Link>
                <Link to="/register" className="block py-2 text-sm text-green-700 dark:text-green-400 font-medium" onClick={() => setMobileOpen(false)}>Registro</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-green-900 dark:bg-gray-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                <span className="font-bold text-sm">AA</span>
              </div>
              <div>
                <span className="font-bold">ANDALUS STUDIO</span>
                <span className="text-xs text-green-200 block">by Al-Andalus AI</span>
              </div>
            </div>
            <p className="text-green-200 text-sm">CREATE · COMPOSE · ORCHESTRATE</p>
            <p className="text-green-300 text-xs mt-2">Plataforma de creación musical y audiovisual inteligente.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">Plataforma</h4>
            <ul className="space-y-2 text-sm text-green-300">
              <li><Link to="/tools" className="hover:text-white">Herramientas</Link></li>
              <li><Link to="/pricing" className="hover:text-white">Planes</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white">Cómo funciona</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">Legal</h4>
            <ul className="space-y-2 text-sm text-green-300">
              <li><Link to="/legal/privacy" className="hover:text-white">Privacidad</Link></li>
              <li><Link to="/legal/terms" className="hover:text-white">Términos</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-white">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">Estado</h4>
            <ul className="space-y-2 text-sm text-green-300">
              <li><span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>FASE 01 — Interfaz</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>API — Pendiente</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>Motores — Pendiente</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-800 dark:border-gray-800 mt-8 pt-6 text-center text-xs text-green-400">
          © 2025 Al-Andalus AI. Todos los derechos reservados. Producto en desarrollo — sin cobros activos.
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════
// PÁGINA DE INICIO
// ═══════════════════════════════════════════

function HomePage() {
  const { recommend } = useToolRecommender();
  const [recommendQuery, setRecommendQuery] = useState('');
  const recommendations = recommendQuery ? recommend(recommendQuery) : [];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 dark:from-green-900 dark:via-green-950 dark:to-gray-950 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 2%), radial-gradient(circle at 75px 75px, white 2%, transparent 2%)',
            backgroundSize: '100px 100px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              TU CREATIVIDAD.<br />
              <span className="text-green-200">TODA UNA ORQUESTA.</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl">
              Compón, transforma, analiza y produce música y contenido creativo con herramientas especializadas en un mismo estudio.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tools" className="px-6 py-3 bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition-colors shadow-lg">
                Explorar herramientas
              </Link>
              <Link to="/studio" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Descubrir el estudio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Familias de herramientas</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            10 familias especializadas para cada aspecto de la creación musical y audiovisual.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {FAMILIES.map(family => (
              <Link
                key={family.id}
                to={`/tools?family=${family.id}`}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-3xl mb-3">{family.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{family.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{family.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recomendador */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">¿Qué quieres crear?</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <input
              type="text"
              value={recommendQuery}
              onChange={e => setRecommendQuery(e.target.value)}
              placeholder="Ej: Quiero analizar un archivo MIDI, escribir una canción, separar la voz..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white"
            />
            {recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Herramientas recomendadas:</p>
                {recommendations.map(tool => (
                  <Link
                    key={tool.slug}
                    to={`/tools/${tool.slug}`}
                    className="block p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <span className="font-medium text-green-900 dark:text-green-300">{tool.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">— {tool.shortDescription}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Economía y calidad */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Transparencia total</h2>
              <ul className="space-y-4">
                {[
                  'Cotización antes de ejecutar: sabes lo que cuesta.',
                  'Reserva atómica de créditos: sin cobros sorpresa.',
                  'Ledger inmutable: todo movimiento registrado.',
                  'Sin cobros excedentes automáticos.',
                  'Servidor resuelve precios, nunca el navegador.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-4">Circuito empresarial</h3>
              <div className="space-y-3 text-sm">
                {['Registro → Verificación email', 'Login → Selección de plan', 'Checkout Stripe TEST → Webhook', 'Entitlement → Cotización créditos', 'Reserva atómica → Ejecución', 'Verificación → Liquidación/Devolución', 'Histórico → Factura'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estado */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full text-sm text-yellow-800 dark:text-yellow-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            FASE 01 — Interfaz y catálogo completados. Motores pendientes.
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Producto en desarrollo</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Esta es la interfaz profesional completa. Los motores de ejecución se implementarán en fases posteriores. 
            No hay cobros activos, no hay datos reales, no hay integraciones de pago.
          </p>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════
// PÁGINA DE HERRAMIENTAS (CATÁLOGO)
// ═══════════════════════════════════════════

function ToolsPage() {
  const { tools, filters, updateFilter, resetFilters, stats } = useToolCatalog();
  const location = useLocation();

  // Leer filtro de familia de la URL
  const urlFamily = new URLSearchParams(location.search).get('family');
  if (urlFamily && filters.family !== urlFamily) {
    updateFilter('family', urlFamily as ToolFamily);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Catálogo de herramientas</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {stats.total} herramientas registradas · {stats.filtered} mostradas
        </p>
      </div>

      {/* Buscador y filtros */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
            <input
              type="text"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder="Nombre, descripción, etiquetas..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Familia</label>
            <select
              value={filters.family}
              onChange={e => updateFilter('family', e.target.value as ToolFamily | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Todas</option>
              {FAMILIES.map(f => (
                <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={e => updateFilter('status', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="PLANNED">Planificada</option>
              <option value="IN_DEVELOPMENT">En desarrollo</option>
              <option value="TESTING">En pruebas</option>
              <option value="BETA">Beta</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="DISABLED">Desactivada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ordenar</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                updateFilter('sortBy', sortBy as any);
                updateFilter('sortOrder', sortOrder as any);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
            >
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="credits-asc">Créditos ↑</option>
              <option value="credits-desc">Créditos ↓</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={resetFilters}
            className="text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
          >
            Limpiar filtros
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Búsqueda tolerante a mayúsculas y acentos
          </span>
        </div>
      </div>

      {/* Grid de herramientas */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <Link
              key={tool.id}
              to={`/tools/${tool.slug}`}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {FAMILIES.find(f => f.id === tool.family)?.icon} {FAMILIES.find(f => f.id === tool.family)?.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(tool.status)}`}>
                  {getStatusLabel(tool.status)}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{tool.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{tool.shortDescription}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {tool.estimatedCredits !== null ? `${tool.estimatedCredits} créditos` : 'Coste por definir'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tool.accessLevel}
                </span>
              </div>
              {!canToolExecute(tool) && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Motor no disponible aún
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No hay herramientas con estos filtros.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-green-700 dark:bg-green-600 text-white rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// PÁGINA DE DETALLE DE HERRAMIENTA
// ═══════════════════════════════════════════

function ToolDetailPage() {
  const location = useLocation();
  const slug = location.pathname.split('/').pop() || '';
  const tool = getToolBySlug(slug);
  const { isAuthenticated } = useAuth();

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Herramienta no encontrada</h1>
        <Link to="/tools" className="text-green-700 dark:text-green-400 hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  const family = FAMILIES.find(f => f.id === tool.family);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link to="/tools" className="text-sm text-green-700 dark:text-green-400 hover:underline mb-4 inline-block">← Volver al catálogo</Link>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-green-900 dark:from-green-900 dark:to-green-950 p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-green-200">{family?.icon} {family?.name}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(tool.status)}`}>
              {getStatusLabel(tool.status)}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <p className="text-green-100 mt-2">{tool.shortDescription}</p>
        </div>

        <div className="p-8">
          <p className="text-gray-700 dark:text-gray-300 mb-6">{tool.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Coste estimado</span>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                {tool.estimatedCredits !== null ? `${tool.estimatedCredits} créditos` : 'Por definir'}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">{getCostPolicyLabel(tool.costPolicy)}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Modo de ejecución</span>
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">{tool.executionMode}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Nivel de acceso</span>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{tool.accessLevel}</p>
            </div>
          </div>

          {/* Capacidades */}
          {tool.capabilities.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Capacidades</h3>
              <div className="space-y-2">
                {tool.capabilities.map(cap => (
                  <div key={cap.id} className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{cap.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{cap.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitaciones */}
          {tool.limitations.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Limitaciones</h3>
              <ul className="space-y-1">
                {tool.limitations.map((lim, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">⚠</span> {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estado de ejecución */}
          {canToolExecute(tool) ? (
            isAuthenticated ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Ejecutar herramienta</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                  Se te cotizará el coste antes de ejecutar. Los créditos se reservan atómicamente y se liberan si hay error.
                </p>
                <button className="px-6 py-3 bg-green-700 dark:bg-green-600 text-white font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
                  Ejecutar ({tool.estimatedCredits || '?'} créditos)
                </button>
                <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                  ⚠️ SIMULADO — El motor de ejecución se implementará en fases posteriores.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Inicia sesión para ejecutar esta herramienta.</p>
                <Link to="/login" className="px-6 py-3 bg-green-700 dark:bg-green-600 text-white font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors inline-block">
                  Acceder
                </Link>
              </div>
            )
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
              <p className="text-amber-800 dark:text-amber-300 font-medium">ESTA HERRAMIENTA ESTÁ EN DESARROLLO</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Estado: "{getStatusLabel(tool.status)}". El motor de ejecución aún no está disponible.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// OTRAS PÁGINAS (resumidas para ahorrar espacio)
// ═══════════════════════════════════════════

function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Planes y precios</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Precios orientativos. El servidor resuelve precios reales. Sin cobros excedentes automáticos.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {DEMO_PLANS.map((plan, i) => (
          <div key={plan.id} className={`bg-white dark:bg-gray-900 rounded-xl p-6 border ${i === 2 ? 'border-green-500 shadow-lg ring-2 ring-green-100 dark:ring-green-900' : 'border-gray-200 dark:border-gray-800 shadow-sm'} flex flex-col`}>
            {i === 2 && <span className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">RECOMENDADO</span>}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
            <div className="mt-4 mb-6">
              {plan.priceMonthly === -1 ? (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Custom</span>
              ) : plan.priceMonthly === 0 ? (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Gratis</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{(plan.priceMonthly / 100).toFixed(0)}€</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/mes</span>
                </>
              )}
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 flex-1 mb-6">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center px-4 py-2.5 bg-green-700 dark:bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
              Comenzar
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>⚠️ AVISO:</strong> Los precios mostrados son orientativos. No se realizan cobros reales. Stripe TEST se activará en FASE 03.
        </p>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceder</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Inicia sesión en tu cuenta de Andalus Studio.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full px-4 py-3 bg-green-700 dark:bg-green-600 text-white font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
              Acceder
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta? <Link to="/register" className="text-green-700 dark:text-green-400 font-medium hover:underline">Regístrate</Link>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
            <strong>DEMO:</strong> Autenticación simulada. No hay backend real.
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(email, password, name);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Crear cuenta</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Regístrate para empezar a usar Andalus Studio.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white" placeholder="Tu nombre" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white" placeholder="Mínimo 8 caracteres" />
            </div>
            <button type="submit" className="w-full px-4 py-3 bg-green-700 dark:bg-green-600 text-white font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
              Crear cuenta
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta? <Link to="/login" className="text-green-700 dark:text-green-400 font-medium hover:underline">Acceder</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Panel de control</h1>
      <p className="text-gray-600 dark:text-gray-400">Bienvenido/a, {user?.name}.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/tools" className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🎵 Catálogo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Explora herramientas.</p>
        </Link>
        <Link to="/pricing" className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">💰 Planes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ver opciones premium.</p>
        </Link>
        <Link to="/tools" className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🚀 Empezar</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Prueba las herramientas.</p>
        </Link>
      </div>
    </div>
  );
}

function StudioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Estudio integrado</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Gestión de proyectos, grabaciones y exportaciones. Próximamente.</p>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
        <p className="text-amber-800 dark:text-amber-300 font-medium">EN DESARROLLO</p>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">El estudio integrado se implementará en fases posteriores.</p>
      </div>
    </div>
  );
}

function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Cómo funciona</h1>
      <div className="space-y-6">
        {[
          { step: 1, title: 'Registro y verificación', desc: 'Crea tu cuenta y verifica tu email.' },
          { step: 2, title: 'Selecciona un plan', desc: 'Elige el plan que mejor se adapte a tus necesidades.' },
          { step: 3, title: 'Explora el catálogo', desc: 'Descubre las herramientas disponibles por familia.' },
          { step: 4, title: 'Ejecuta herramientas', desc: 'Cada ejecución se cotiza antes de procesar.' },
          { step: 5, title: 'Recibe resultados', desc: 'Descarga artefactos y revisa el consumo de créditos.' },
          { step: 6, title: 'Gestiona tu cuenta', desc: 'Consulta tu historial, créditos y facturación.' },
        ].map(item => (
          <div key={item.step} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center font-bold flex-shrink-0">{item.step}</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegalPage() {
  const location = useLocation();
  const type = location.pathname.split('/').pop() || 'terms';
  const content: Record<string, { title: string; text: string }> = {
    privacy: { title: 'Política de Privacidad', text: 'Documento en preparación. Requiere revisión legal antes de producción.' },
    terms: { title: 'Términos y Condiciones', text: 'Documento en preparación. Requiere revisión legal antes de producción.' },
    cookies: { title: 'Política de Cookies', text: 'Documento en preparación. Requiere revisión legal antes de producción.' },
  };
  const page = content[type] || content.terms;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{page.title}</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
        <p className="text-gray-700 dark:text-gray-300">{page.text}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:slug" element={<ToolDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/legal/:type" element={<LegalPage />} />
        <Route path="*" element={
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Página no encontrada.</p>
            <Link to="/" className="text-green-700 dark:text-green-400 hover:underline">Volver al inicio</Link>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
