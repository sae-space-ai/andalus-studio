import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // SIMULADO — No hay backend de email
    setSubmitted(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recuperar contraseña</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-gray-800 dark:text-white"
                  placeholder="tu@email.com"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-green-700 dark:bg-green-600 text-white font-medium rounded-lg hover:bg-green-800 dark:hover:bg-green-700 transition-colors"
              >
                Enviar enlace
              </button>
            </form>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-300">
                Si el email existe en nuestro sistema, recibirás un enlace de recuperación.
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="text-green-700 dark:text-green-400 font-medium hover:underline">
              Volver al acceso
            </Link>
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300">
            <strong>SERVICIO EN PREPARACIÓN:</strong> El envío de emails se implementará en FASE 02 con backend operativo.
          </div>
        </div>
      </div>
    </div>
  );
}
