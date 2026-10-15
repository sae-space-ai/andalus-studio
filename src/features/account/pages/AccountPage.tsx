import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function AccountPage() {
  const { isAuthenticated, user, organization } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mi cuenta</h1>

      <div className="space-y-6">
        {/* Información personal */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Información personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
              <input
                type="text"
                defaultValue={user?.name || ''}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                disabled
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${user?.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {user?.emailVerified ? 'Email verificado' : 'Email no verificado'}
            </span>
          </div>
          <button className="mt-4 px-4 py-2 bg-green-700 dark:bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
            Guardar cambios
          </button>
        </div>

        {/* Organización */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Organización</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
              <input
                type="text"
                defaultValue={organization?.name || ''}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Slug</label>
              <input
                type="text"
                defaultValue={organization?.slug || ''}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Enlaces rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/billing" className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">💳 Facturación</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona tu suscripción.</p>
          </Link>
          <Link to="/credits" className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">💰 Créditos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ver consumo y saldo.</p>
          </Link>
          <Link to="/dashboard" className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">📊 Panel</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vista general.</p>
          </Link>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <strong>DEMO:</strong> Perfil simulado. En producción, los cambios se guardan vía API.
        </div>
      </div>
    </div>
  );
}
