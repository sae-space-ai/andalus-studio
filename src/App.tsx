import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, DEMO_PLANS } from './context/AuthContext';
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from './types';
import type { Tool, ToolCategory, CreditLedgerEntry } from './types';
import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════

const MOCK_TOOLS: Tool[] = [
  { id: '1', slug: 'melodic-generator', name: 'Generador Melódico', description: 'Genera melodías originales basadas en parámetros de estilo, tonalidad y complejidad.', category: 'musica-composicion', status: 'PUBLISHED', creditCost: 10, createdAt: '2025-01-15' },
  { id: '2', slug: 'harmony-engine', name: 'Motor de Armonía', description: 'Armoniza melodías automáticamente con progresiones inteligentes.', category: 'musica-composicion', status: 'PUBLISHED', creditCost: 15, createdAt: '2025-01-20' },
  { id: '3', slug: 'audio-to-midi', name: 'Audio → MIDI', description: 'Convierte audio monofónico a MIDI con detección de pitch.', category: 'midi', status: 'TESTED', creditCost: 20, createdAt: '2025-02-01' },
  { id: '4', slug: 'midi-pattern-gen', name: 'Generador de Patrones MIDI', description: 'Crea patrones rítmicos y melódicos en formato MIDI.', category: 'midi', status: 'PUBLISHED', creditCost: 8, createdAt: '2025-02-10' },
  { id: '5', slug: 'lyric-writer', name: 'Escritor de Letras', description: 'Genera letras originales por tema, estilo e idioma.', category: 'letras-idiomas', status: 'DEVELOPMENT', creditCost: 12, createdAt: '2025-02-15' },
  { id: '6', slug: 'rhyme-analyzer', name: 'Analizador de Rima', description: 'Analiza patrones de rima y métrica en textos.', category: 'letras-idiomas', status: 'PUBLISHED', creditCost: 5, createdAt: '2025-02-20' },
  { id: '7', slug: 'voice-synth', name: 'Síntesis de Voz', description: 'Genera voz cantada a partir de MIDI y letra.', category: 'voz-audio', status: 'DEVELOPMENT', creditCost: 50, createdAt: '2025-03-01' },
  { id: '8', slug: 'source-separator', name: 'Separador de Fuentes', description: 'Separa instrumentos de una mezcla de audio.', category: 'voz-audio', status: 'TESTED', creditCost: 25, createdAt: '2025-03-10' },
  { id: '9', slug: 'cover-generator', name: 'Generador de Portadas', description: 'Crea portadas de álbumes con IA generativa.', category: 'imagen-video', status: 'PUBLISHED', creditCost: 15, createdAt: '2025-03-15' },
  { id: '10', slug: 'data-sonification', name: 'Sonificación de Datos', description: 'Convierte datasets en paisajes sonoros.', category: 'sonificacion', status: 'DRAFT', creditCost: 30, createdAt: '2025-04-01' },
  { id: '11', slug: 'ear-training', name: 'Ear Training', description: 'Ejercicios interactivos de entrenamiento auditivo.', category: 'educacion', status: 'PUBLISHED', creditCost: 3, createdAt: '2025-04-10' },
  { id: '12', slug: 'mastering-auto', name: 'Masterización Automática', description: 'Masteriza tracks con perfiles de género.', category: 'voz-audio', status: 'DEVELOPMENT', creditCost: 35, createdAt: '2025-04-15' },
];

const MOCK_LEDGER: CreditLedgerEntry[] = [
  { id: '1', walletId: 'w1', type: 'CREDIT', amount: 500, balanceAfter: 500, reference: 'sub-001', description: 'Créditos mensuales plan Creator', createdAt: '2025-06-01T10:00:00Z' },
  { id: '2', walletId: 'w1', type: 'DEBIT', amount: -10, balanceAfter: 490, reference: 'run-001', description: 'Generador Melódico', createdAt: '2025-06-02T14:30:00Z' },
  { id: '3', walletId: 'w1', type: 'DEBIT', amount: -15, balanceAfter: 475, reference: 'run-002', description: 'Motor de Armonía', createdAt: '2025-06-03T09:15:00Z' },
  { id: '4', walletId: 'w1', type: 'DEBIT', amount: -8, balanceAfter: 467, reference: 'run-003', description: 'Gen. Patrones MIDI', createdAt: '2025-06-04T16:45:00Z' },
  { id: '5', walletId: 'w1', type: 'DEBIT', amount: -5, balanceAfter: 462, reference: 'run-004', description: 'Analizador de Rima', createdAt: '2025-06-05T11:20:00Z' },
  { id: '6', walletId: 'w1', type: 'DEBIT', amount: -15, balanceAfter: 447, reference: 'run-005', description: 'Gen. Portadas', createdAt: '2025-06-06T08:00:00Z' },
  { id: '7', walletId: 'w1', type: 'DEBIT', amount: -3, balanceAfter: 444, reference: 'run-006', description: 'Ear Training', createdAt: '2025-06-07T19:30:00Z' },
  { id: '8', walletId: 'w1', type: 'HOLD', amount: -10, balanceAfter: 434, reference: 'run-007', description: 'Reserva: Generador Melódico', createdAt: '2025-06-08T12:00:00Z' },
  { id: '9', walletId: 'w1', type: 'RELEASE', amount: 10, balanceAfter: 444, reference: 'run-007', description: 'Liberación: error en ejecución', createdAt: '2025-06-08T12:05:00Z' },
  { id: '10', walletId: 'w1', type: 'DEBIT', amount: -10, balanceAfter: 434, reference: 'run-008', description: 'Generador Melódico', createdAt: '2025-06-09T10:00:00Z' },
];

// ═══════════════════════════════════════════
// LAYOUT COMPONENTS
// ═══════════════════════════════════════════

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/precios', label: 'Precios' },
  ];

  return (
    <header className="glass sticky top-0 z-50 border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-hero-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">AA</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-green-900 text-lg">AL-ANDALUS AI</span>
              <span className="text-xs text-green-600 block -mt-1">INTELLIGENCE · ENGINEERING · EUROPE</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-green-700'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-green-700 hover:text-green-900">
                  Estudio
                </Link>
                <Link to="/creditos" className="text-sm font-medium text-green-700 hover:text-green-900">
                  Créditos
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-green-200">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button onClick={logout} className="text-xs text-red-600 hover:text-red-800">
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-green-700">
                  Acceder
                </Link>
                <Link to="/registro" className="px-4 py-2 bg-green-800 text-white text-sm font-medium rounded-lg hover:bg-green-900 transition-colors">
                  Registro
                </Link>
              </>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-green-100 pt-4 animate-fade-in">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="block py-2 text-sm text-gray-700 hover:text-green-700" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-sm text-green-700" onClick={() => setMobileOpen(false)}>Estudio</Link>
                <Link to="/creditos" className="block py-2 text-sm text-green-700" onClick={() => setMobileOpen(false)}>Créditos</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>Acceder</Link>
                <Link to="/registro" className="block py-2 text-sm text-green-700 font-medium" onClick={() => setMobileOpen(false)}>Registro</Link>
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
    <footer className="bg-green-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                <span className="font-bold text-sm">AA</span>
              </div>
              <span className="font-bold">AL-ANDALUS AI</span>
            </div>
            <p className="text-green-200 text-sm">INTELLIGENCE · ENGINEERING · EUROPE</p>
            <p className="text-green-300 text-xs mt-2">Andalus Studio — Plataforma de creación musical inteligente.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">Plataforma</h4>
            <ul className="space-y-2 text-sm text-green-300">
              <li><Link to="/catalogo" className="hover:text-white">Catálogo</Link></li>
              <li><Link to="/precios" className="hover:text-white">Precios</Link></li>
              <li><span className="text-green-500">API (próximamente)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">Legal</h4>
            <ul className="space-y-2 text-sm text-green-300">
              <li><Link to="/legal/privacidad" className="hover:text-white">Privacidad</Link></li>
              <li><Link to="/legal/terminos" className="hover:text-white">Términos</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-white">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">Estado</h4>
            <ul className="space-y-2 text-sm text-green-300">
              <li><span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>FASE 00 — Base</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>API — Pendiente</li>
              <li><span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>Pagos — Pendiente</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-800 mt-8 pt-6 text-center text-xs text-green-400">
          © 2025 Al-Andalus AI. Todos los derechos reservados. Producto en desarrollo — sin cobros activos.
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════

function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-hero-gradient pattern-overlay text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Creación musical<br />
              <span className="text-green-200">inteligente</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl">
              Andalus Studio combina algoritmos deterministas e inteligencia artificial 
              para potenciar tu proceso creativo. Composición, MIDI, voz, imagen y más.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/registro" className="px-6 py-3 bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition-colors">
                Comenzar gratis
              </Link>
              <Link to="/catalogo" className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-green-900">Herramientas para cada fase creativa</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Desde la idea inicial hasta la producción final. Cada herramienta con transparencia total de costes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{label}</h3>
                <p className="text-sm text-gray-600">
                  {MOCK_TOOLS.filter(t => t.category === key).length} herramienta(s) en esta categoría.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-green-900">Transparencia total</h2>
              <ul className="space-y-4">
                {[
                  'Cotización antes de ejecutar: sabes lo que cuesta.',
                  'Reserva atómica de créditos: sin cobros sorpresa.',
                  'Ledger inmutable: todo movimiento registrado.',
                  'Sin cobros excedentes automáticos.',
                  'Servidor resuelve precios, nunca el navegador.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-8 border border-green-100">
              <h3 className="font-semibold text-green-800 mb-4">Circuito empresarial</h3>
              <div className="space-y-3 text-sm">
                {['Registro → Verificación email', 'Login → Selección de plan', 'Checkout Stripe TEST → Webhook', 'Entitlement → Cotización créditos', 'Reserva atómica → Ejecución', 'Verificación → Liquidación/Devolución', 'Histórico → Factura'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm text-yellow-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            FASE 00 — Base completada. Sin integraciones activas.
          </div>
          <h2 className="text-2xl font-bold mb-4">Producto en desarrollo</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Esta es la estructura base del repositorio. No hay cobros activos, 
            no hay datos reales, no hay integraciones de pago. Todo es demostración y documentación.
          </p>
        </div>
      </section>
    </div>
  );
}

function CatalogPage() {
  const [filter, setFilter] = useState<ToolCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = MOCK_TOOLS.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-green-900 mb-2">Catálogo de herramientas</h1>
      <p className="text-gray-600 mb-8">Explora las herramientas disponibles. Las no publicadas se muestran como PRÓXIMAMENTE.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as ToolCategory | 'all')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(tool => (
          <Link
            key={tool.id}
            to={`/catalogo/${tool.slug}`}
            className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 ${
              tool.status !== 'PUBLISHED' ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-gray-500">{CATEGORY_LABELS[tool.category]}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[tool.status]}`}>
                {tool.status === 'PUBLISHED' ? 'Disponible' : 'PRÓXIMAMENTE'}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">{tool.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tool.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">{tool.creditCost} créditos</span>
              {tool.status !== 'PUBLISHED' && (
                <span className="text-xs text-gray-400 italic">No disponible aún</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay herramientas con estos filtros.
        </div>
      )}
    </div>
  );
}

function ToolDetailPage() {
  const location = useLocation();
  const slug = location.pathname.split('/').pop() || '';
  const tool = MOCK_TOOLS.find(t => t.slug === slug);
  const { isAuthenticated } = useAuth();

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Herramienta no encontrada</h1>
        <Link to="/catalogo" className="text-green-700 hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link to="/catalogo" className="text-sm text-green-700 hover:underline mb-4 inline-block">← Volver al catálogo</Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-hero-gradient p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-green-200">{CATEGORY_LABELS[tool.category]}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              tool.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {STATUS_LABELS[tool.status]}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
        </div>

        <div className="p-8">
          <p className="text-gray-700 mb-6">{tool.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <span className="text-xs text-green-600 font-medium">Coste por ejecución</span>
              <p className="text-2xl font-bold text-green-800">{tool.creditCost} créditos</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <span className="text-xs text-blue-600 font-medium">Estado</span>
              <p className="text-lg font-semibold text-blue-800">{STATUS_LABELS[tool.status]}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-600 font-medium">Categoría</span>
              <p className="text-lg font-semibold text-gray-800">{CATEGORY_LABELS[tool.category].split(' ')[0]}</p>
            </div>
          </div>

          {tool.status === 'PUBLISHED' ? (
            isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-2">Ejecutar herramienta</h3>
                <p className="text-sm text-green-700 mb-4">
                  Se te cotizará el coste antes de ejecutar. Los créditos se reservan atómicamente 
                  y se liberan si hay error.
                </p>
                <button className="px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors">
                  Ejecutar ({tool.creditCost} créditos)
                </button>
                <p className="text-xs text-green-600 mt-3">
                  ⚠️ SIMULADO — No se ejecuta nada en esta demo.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Inicia sesión para ejecutar esta herramienta.</p>
                <Link to="/login" className="px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors inline-block">
                  Acceder
                </Link>
              </div>
            )
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 font-medium">PRÓXIMAMENTE</p>
              <p className="text-sm text-yellow-700 mt-1">
                Esta herramienta está en estado "{STATUS_LABELS[tool.status]}" y aún no está disponible.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [yearly, setYearly] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-green-900 mb-4">Planes y precios</h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Precios orientativos. El servidor resuelve precios reales. Sin cobros excedentes automáticos.
        </p>
        <div className="inline-flex items-center gap-3 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${!yearly ? 'bg-green-700 text-white' : 'text-gray-600'}`}
          >
            Mensual
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${yearly ? 'bg-green-700 text-white' : 'text-gray-600'}`}
          >
            Anual <span className="text-xs opacity-75">(-17%)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {DEMO_PLANS.map((plan, i) => (
          <div
            key={plan.id}
            className={`bg-white rounded-xl p-6 border ${
              i === 2 ? 'border-green-500 shadow-lg ring-2 ring-green-100' : 'border-gray-100 shadow-sm'
            } flex flex-col`}
          >
            {i === 2 && <span className="text-xs font-bold text-green-700 mb-2">RECOMENDADO</span>}
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-4 mb-6">
              {plan.priceMonthly === -1 ? (
                <span className="text-2xl font-bold text-gray-900">Custom</span>
              ) : plan.priceMonthly === 0 ? (
                <span className="text-2xl font-bold text-gray-900">Gratis</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    {yearly ? (plan.priceYearly / 1200).toFixed(0) : (plan.priceMonthly / 100).toFixed(0)}€
                  </span>
                  <span className="text-sm text-gray-500">/mes</span>
                </>
              )}
            </div>
            <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> {f}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> {plan.creditsMonthly > 0 ? `${plan.creditsMonthly} créditos/mes` : 'Créditos limitados'}
              </li>
            </ul>
            {isAuthenticated ? (
              <Link to="/dashboard" className="block text-center px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors">
                {i === 0 ? 'Plan actual' : 'Seleccionar'}
              </Link>
            ) : (
              <Link to="/registro" className="block text-center px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors">
                Comenzar
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ AVISO:</strong> Los precios mostrados son orientativos. No se realizan cobros reales. 
          Stripe TEST se activará en FASE 03 tras pruebas completas.
        </p>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-green-900 mb-2">Acceder</h1>
          <p className="text-sm text-gray-600 mb-6">Inicia sesión en tu cuenta de Andalus Studio.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Accediendo...' : 'Acceder'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-green-700 font-medium hover:underline">Regístrate</Link>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            <strong>DEMO:</strong> Usa cualquier email/contraseña. No hay autenticación real.
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
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register(email, password, name);
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-green-900 mb-2">Crear cuenta</h1>
          <p className="text-sm text-gray-600 mb-6">Regístrate para empezar a usar Andalus Studio.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" required className="mt-1" id="terms" />
              <label htmlFor="terms" className="text-xs text-gray-600">
                Acepto los <Link to="/legal/terminos" className="text-green-700 underline">términos</Link> y la{' '}
                <Link to="/legal/privacidad" className="text-green-700 underline">política de privacidad</Link>.
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-green-700 font-medium hover:underline">Acceder</Link>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700">
            <strong>AVISO:</strong> Registro simulado. No se crea ninguna cuenta real. 
            En producción: verificación de email obligatoria.
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { isAuthenticated, user, organization, entitlement, wallet } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  const creditsPercent = entitlement ? (entitlement.creditsUsed / entitlement.creditsTotal) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900">Estudio</h1>
        <p className="text-gray-600">Bienvenido/a, {user?.name}. Organización: {organization?.name}.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Plan</span>
          <p className="text-2xl font-bold text-green-800">Creator</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Créditos disponibles</span>
          <p className="text-2xl font-bold text-green-800">{wallet?.balance ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Consumido este mes</span>
          <p className="text-2xl font-bold text-gray-800">{entitlement?.creditsUsed ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Miembros</span>
          <p className="text-2xl font-bold text-gray-800">1</p>
        </div>
      </div>

      {/* Credits bar */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Uso de créditos mensuales</span>
          <span className="text-sm text-gray-500">{entitlement?.creditsUsed} / {entitlement?.creditsTotal}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(creditsPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {entitlement && (entitlement.creditsTotal - entitlement.creditsUsed)} créditos restantes este periodo.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/catalogo" className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">🎵 Catálogo</h3>
          <p className="text-sm text-gray-600">Explora y ejecuta herramientas.</p>
        </Link>
        <Link to="/creditos" className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">💰 Créditos</h3>
          <p className="text-sm text-gray-600">Ver movimientos y consumo.</p>
        </Link>
        <Link to="/perfil" className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">⚙️ Perfil</h3>
          <p className="text-sm text-gray-600">Gestiona tu cuenta y organización.</p>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_LEDGER.slice(0, 5).map(entry => (
            <div key={entry.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
              <span className={`text-sm font-medium ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {entry.amount > 0 ? '+' : ''}{entry.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
        <strong>DEMO:</strong> Datos simulados. En producción, todo viene del servidor vía API.
      </div>
    </div>
  );
}

function CreditsPage() {
  const { isAuthenticated, wallet, entitlement } = useAuth();
  const [tab, setTab] = useState<'ledger' | 'usage'>('ledger');

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-green-900 mb-2">Créditos y uso</h1>
      <p className="text-gray-600 mb-8">Transparencia total: cada movimiento registrado en el ledger.</p>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500">Saldo actual</span>
          <p className="text-3xl font-bold text-green-800">{wallet?.balance ?? 0}</p>
          <p className="text-xs text-gray-500">créditos</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500">Total del plan</span>
          <p className="text-3xl font-bold text-gray-800">{entitlement?.creditsTotal ?? 0}</p>
          <p className="text-xs text-gray-500">créditos/mes</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500">Consumido</span>
          <p className="text-3xl font-bold text-gray-800">{entitlement?.creditsUsed ?? 0}</p>
          <p className="text-xs text-gray-500">este periodo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('ledger')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'ledger' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Libro de movimientos
        </button>
        <button
          onClick={() => setTab('usage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'usage' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Uso por herramienta
        </button>
      </div>

      {/* Ledger */}
      {tab === 'ledger' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_LEDGER.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(entry.createdAt).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      entry.type === 'CREDIT' ? 'bg-green-100 text-green-700' :
                      entry.type === 'DEBIT' ? 'bg-red-100 text-red-700' :
                      entry.type === 'HOLD' ? 'bg-yellow-100 text-yellow-700' :
                      entry.type === 'RELEASE' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{entry.description}</td>
                  <td className={`px-6 py-4 text-sm text-right font-medium ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{entry.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'usage' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-4">
            {[
              { name: 'Generador Melódico', count: 3, credits: 30 },
              { name: 'Motor de Armonía', count: 1, credits: 15 },
              { name: 'Gen. Patrones MIDI', count: 1, credits: 8 },
              { name: 'Analizador de Rima', count: 1, credits: 5 },
              { name: 'Gen. Portadas', count: 1, credits: 15 },
              { name: 'Ear Training', count: 1, credits: 3 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.count} ejecuciones</p>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.credits} créditos</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700">
        <strong>AVISO:</strong> Datos simulados. En producción, el ledger es inmutable y viene del servidor.
        No se pueden modificar movimientos pasados.
      </div>
    </div>
  );
}

function ProfilePage() {
  const { isAuthenticated, user, organization } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-green-900 mb-8">Perfil y organización</h1>

      <div className="space-y-6">
        {/* User info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Información personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input type="text" defaultValue={user?.name || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" defaultValue={user?.email || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" disabled />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${user?.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="text-xs text-gray-600">
              {user?.emailVerified ? 'Email verificado' : 'Email no verificado'}
            </span>
          </div>
          <button className="mt-4 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors">
            Guardar cambios
          </button>
        </div>

        {/* Organization */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Organización</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input type="text" defaultValue={organization?.name || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input type="text" defaultValue={organization?.slug || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" disabled />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Miembros</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">OWNER</p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Facturación</h2>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg mb-4">
            <div>
              <p className="text-sm font-medium text-green-800">Plan Creator — 19€/mes</p>
              <p className="text-xs text-green-600">Próximo cobro: 1 julio 2025</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Activo</span>
          </div>
          <div className="flex gap-3">
            <Link to="/precios" className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Cambiar plan
            </Link>
            <button className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Portal de facturación
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            En producción: Stripe Customer Portal para gestionar suscripción.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
        <strong>DEMO:</strong> Perfil simulado. En producción, los cambios se guardan vía API.
      </div>
    </div>
  );
}

function AdminPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-green-900 mb-2">Administración</h1>
      <p className="text-gray-600 mb-8">Panel de administración (requiere rol OWNER/ADMIN).</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { title: 'Usuarios', count: '1', desc: 'Usuarios registrados' },
          { title: 'Organizaciones', count: '1', desc: 'Tenants activos' },
          { title: 'Herramientas', count: `${MOCK_TOOLS.length}`, desc: 'En catálogo' },
          { title: 'Publicadas', count: `${MOCK_TOOLS.filter(t => t.status === 'PUBLISHED').length}`, desc: 'Disponibles' },
          { title: 'Stripe Events', count: '0', desc: 'Webhooks procesados' },
          { title: 'Audit Events', count: '0', desc: 'Eventos de auditoría' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500">{stat.desc}</span>
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Tool management */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Gestión de herramientas</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Coste</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_TOOLS.map(tool => (
              <tr key={tool.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{tool.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{CATEGORY_LABELS[tool.category]}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[tool.status]}`}>
                    {STATUS_LABELS[tool.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">{tool.creditCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700">
        <strong>AVISO:</strong> Panel de administración simulado. En producción: acceso restringido por rol, 
        gestión real de herramientas, usuarios y eventos Stripe.
      </div>
    </div>
  );
}

function LegalPage() {
  const location = useLocation();
  const type = location.pathname.split('/').pop() || 'terminos';

  const content: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
    privacidad: {
      title: 'Política de Privacidad',
      sections: [
        { heading: 'Responsable', text: 'Al-Andalus AI es el responsable del tratamiento de tus datos personales.' },
        { heading: 'Datos recopilados', text: 'Email, nombre, datos de uso de la plataforma, datos de facturación (a través de Stripe, sin almacenar datos de tarjetas).' },
        { heading: 'Finalidad', text: 'Prestación del servicio, facturación, mejora del producto, cumplimiento legal.' },
        { heading: 'Derechos', text: 'Acceso, rectificación, supresión, portabilidad, limitación y oposición. Contacta con privacy@andalus.ai.' },
        { heading: 'Conservación', text: 'Los datos se conservan mientras la cuenta esté activa y durante los plazos legales posteriores.' },
        { heading: 'Seguridad', text: 'Medidas técnicas y organizativas según OWASP. Cifrado en tránsito y en reposo.' },
      ],
    },
    terminos: {
      title: 'Términos y Condiciones',
      sections: [
        { heading: 'Servicio', text: 'Andalus Studio es una plataforma de herramientas de creación musical asistida por IA y algoritmos.' },
        { heading: 'Cuentas', text: 'Cada usuario es responsable de su cuenta. Prohibido compartir credenciales.' },
        { heading: 'Créditos', text: 'Los créditos son una unidad de consumo interna. No tienen valor monetario fuera de la plataforma. No son transferibles.' },
        { heading: 'Contenido generado', text: 'El usuario mantiene los derechos del contenido generado, sujeto a las licencias de las herramientas utilizadas.' },
        { heading: 'Contenido de terceros', text: 'No subir contenido de terceros sin autorización. La plataforma puede eliminar contenido infractor.' },
        { heading: 'Limitación de responsabilidad', text: 'El servicio se proporciona "tal cual". No garantizamos resultados específicos.' },
        { heading: 'Modificaciones', text: 'Podemos modificar estos términos. Se notificará con antelación.' },
      ],
    },
    cookies: {
      title: 'Política de Cookies',
      sections: [
        { heading: 'Cookies esenciales', text: 'Necesarias para el funcionamiento de la plataforma (sesión, CSRF). No se pueden desactivar.' },
        { heading: 'Cookies analíticas', text: 'Para medir el uso de la plataforma. Requieren consentimiento.' },
        { heading: 'Gestión', text: 'Puedes configurar tu navegador para rechazar cookies. Algunas funciones pueden no estar disponibles.' },
      ],
    },
  };

  const page = content[type] || content.terminos;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-green-900 mb-8">{page.title}</h1>
      <div className="space-y-6">
        {page.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.heading}</h2>
            <p className="text-gray-700">{section.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
        <strong>AVISO:</strong> Estos textos son placeholder. Requieren revisión legal antes de producción.
        No constituyen asesoramiento legal.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP
// ═══════════════════════════════════════════

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/catalogo/:slug" element={<ToolDetailPage />} />
        <Route path="/precios" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/creditos" element={<CreditsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/legal/:type" element={<LegalPage />} />
        <Route path="*" element={
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Página no encontrada.</p>
            <Link to="/" className="text-green-700 hover:underline">Volver al inicio</Link>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
