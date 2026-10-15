import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function BillingPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Facturación</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Gestiona tu suscripción y método de pago.</p>

      <div className="space-y-6">
        {/* Suscripción actual */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Suscripción actual</h2>
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Plan Creator — 19€/mes</p>
              <p className="text-xs text-green-600 dark:text-green-400">Próximo cobro: 1 julio 2025</p>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
              Activo
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <Link to="/pricing" className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
              Cambiar plan
            </Link>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
              Portal de facturación
            </button>
          </div>
        </div>

        {/* Historial de facturas */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Historial de facturas</h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No hay facturas disponibles.</p>
            <p className="text-xs mt-2">Las facturas se generarán cuando Stripe esté integrado.</p>
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>⚠️ SERVICIO EN PREPARACIÓN:</strong> La facturación real se implementará en FASE 03 con Stripe TEST. 
            No se realizan cobros en esta etapa.
          </p>
        </div>
      </div>
    </div>
  );
}
