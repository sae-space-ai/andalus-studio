import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Datos simulados del ledger
const MOCK_LEDGER = [
  { id: '1', type: 'CREDIT', amount: 500, balanceAfter: 500, description: 'Créditos mensuales plan Creator', createdAt: '2025-06-01T10:00:00Z' },
  { id: '2', type: 'DEBIT', amount: -10, balanceAfter: 490, description: 'Generador Melódico', createdAt: '2025-06-02T14:30:00Z' },
  { id: '3', type: 'DEBIT', amount: -15, balanceAfter: 475, description: 'Motor de Armonía', createdAt: '2025-06-03T09:15:00Z' },
  { id: '4', type: 'DEBIT', amount: -8, balanceAfter: 467, description: 'Gen. Patrones MIDI', createdAt: '2025-06-04T16:45:00Z' },
  { id: '5', type: 'DEBIT', amount: -5, balanceAfter: 462, description: 'Analizador de Rima', createdAt: '2025-06-05T11:20:00Z' },
];

export default function CreditsPage() {
  const { isAuthenticated, wallet, entitlement } = useAuth();
  const [tab, setTab] = useState<'ledger' | 'usage'>('ledger');

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Créditos y uso</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Transparencia total: cada movimiento registrado en el ledger.</p>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-xs text-gray-500 dark:text-gray-400">Saldo actual</span>
          <p className="text-3xl font-bold text-green-800 dark:text-green-400">{wallet?.balance ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">créditos</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-xs text-gray-500 dark:text-gray-400">Total del plan</span>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entitlement?.creditsTotal ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">créditos/mes</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-xs text-gray-500 dark:text-gray-400">Consumido</span>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entitlement?.creditsUsed ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">este periodo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('ledger')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'ledger'
              ? 'bg-green-700 dark:bg-green-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
          }`}
        >
          Libro de movimientos
        </button>
        <button
          onClick={() => setTab('usage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'usage'
              ? 'bg-green-700 dark:bg-green-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
          }`}
        >
          Uso por herramienta
        </button>
      </div>

      {/* Ledger */}
      {tab === 'ledger' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cantidad</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {MOCK_LEDGER.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      entry.type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{entry.description}</td>
                  <td className={`px-6 py-4 text-sm text-right font-medium ${
                    entry.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">{entry.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'usage' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="space-y-4">
            {[
              { name: 'Generador Melódico', count: 3, credits: 30 },
              { name: 'Motor de Armonía', count: 1, credits: 15 },
              { name: 'Gen. Patrones MIDI', count: 1, credits: 8 },
              { name: 'Analizador de Rima', count: 1, credits: 5 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.count} ejecuciones</p>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.credits} créditos</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
        <strong>DEMO:</strong> Datos simulados. En producción, el ledger es inmutable y viene del servidor.
      </div>
    </div>
  );
}
