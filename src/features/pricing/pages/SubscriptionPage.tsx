import { Link, Navigate } from 'react-router-dom';
import { useAuth, DEMO_PLANS } from '../../../context/AuthContext';

export default function SubscriptionPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tu suscripción</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Gestiona tu plan y créditos mensuales.</p>

      {/* Plan actual */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Plan actual</h2>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
            Activo
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Plan</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Creator</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Precio</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white">19€/mes</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Créditos</span>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">500/mes</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Próximo cobro</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white">1 jul 2025</p>
          </div>
        </div>
      </div>

      {/* Comparativa de planes */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cambiar de plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {DEMO_PLANS.map((plan, i) => (
          <div
            key={plan.id}
            className={`bg-white dark:bg-gray-900 rounded-xl p-6 border ${
              i === 1
                ? 'border-green-500 dark:border-green-600 shadow-lg ring-2 ring-green-100 dark:ring-green-900'
                : 'border-gray-200 dark:border-gray-800 shadow-sm'
            } flex flex-col`}
          >
            {i === 1 && (
              <span className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">ACTUAL</span>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
            <div className="mt-2 mb-4">
              {plan.priceMonthly === -1 ? (
                <span className="text-xl font-bold text-gray-900 dark:text-white">Custom</span>
              ) : plan.priceMonthly === 0 ? (
                <span className="text-xl font-bold text-gray-900 dark:text-white">Gratis</span>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(plan.priceMonthly / 100).toFixed(0)}€
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/mes</span>
                </>
              )}
            </div>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400 flex-1 mb-4">
              {plan.features.slice(0, 3).map((f, j) => (
                <li key={j} className="flex items-center gap-1">
                  <span className="text-green-600 dark:text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            {i === 1 ? (
              <span className="block text-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm rounded-lg">
                Plan actual
              </span>
            ) : (
              <button className="block text-center px-3 py-2 bg-green-700 dark:bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
                Cambiar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>⚠️ SERVICIO EN PREPARACIÓN:</strong> Los cambios de plan se procesarán vía Stripe en FASE 03. 
            No se realizan cobros en esta etapa.
        </p>
      </div>
    </div>
  );
}
