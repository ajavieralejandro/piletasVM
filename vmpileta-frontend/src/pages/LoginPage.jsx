import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Waves } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import useThemeStore from '../stores/useThemeStore';
import ThemeSwitcher from '../components/ThemeSwitcher';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const theme = useThemeStore((state) => state.theme);
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [credenciales, setCredenciales] = useState({
    dni: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credenciales.dni, credenciales.password);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('DNI o contraseña incorrectos');
    }
    setLoading(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Botón de cambio de tema - Flotante */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Lado izquierdo */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-villamitre-green to-emerald-700'
        }`}
      >
        {/* Patrón decorativo */}
        {isDark && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-villamitre-green rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
          </div>
        )}

        {isDark && <div className="absolute inset-0 bg-black/30"></div>}

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          {/* Logo */}
          <div className={`relative mb-8 ${isDark ? '' : ''}`}>
            {isDark && (
              <div className="absolute inset-0 bg-villamitre-green/20 rounded-full filter blur-2xl"></div>
            )}
            <img
              src="/logo-villamitre.png"
              alt="Club Villa Mitre"
              className="relative w-48 h-48 drop-shadow-2xl"
            />
          </div>

          <h1
            className={`text-6xl font-bold mb-4 ${
              isDark
                ? 'bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent'
                : 'text-white'
            }`}
          >
            Club Villa Mitre
          </h1>
          <p className={`text-2xl mb-8 ${isDark ? 'text-emerald-200' : 'text-white'}`}>
            Sistema de Gestión de Pileta
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div className="group">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition border ${
                  isDark
                    ? 'bg-villamitre-green/10 group-hover:bg-villamitre-green/20 border-villamitre-green/30'
                    : 'bg-white/20 border-white/30'
                }`}
              >
                <Waves className={isDark ? 'text-villamitre-green' : 'text-white'} size={32} />
              </div>
              <div className="text-4xl font-bold text-white mb-1">25m</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-white/80'}`}>
                Pileta Semi-olímpica
              </div>
            </div>
            <div className="group">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition border ${
                  isDark
                    ? 'bg-villamitre-green/10 group-hover:bg-villamitre-green/20 border-villamitre-green/30'
                    : 'bg-white/20 border-white/30'
                }`}
              >
                <span className={`text-4xl ${isDark ? 'text-villamitre-green' : 'text-white'}`}>
                  6
                </span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">Carriles</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-white/80'}`}>
                Disponibles
              </div>
            </div>
            <div className="group">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition border ${
                  isDark
                    ? 'bg-villamitre-green/10 group-hover:bg-villamitre-green/20 border-villamitre-green/30'
                    : 'bg-white/20 border-white/30'
                }`}
              >
                <span className={`text-4xl ${isDark ? 'text-villamitre-green' : 'text-white'}`}>
                  +
                </span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">50</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-white/80'}`}>
                Alumnos Activos
              </div>
            </div>
          </div>

          {/* Decoración inferior */}
          <div
            className={`mt-16 flex items-center space-x-2 ${
              isDark ? 'text-emerald-200/60' : 'text-white/80'
            }`}
          >
            <div
              className={`h-px w-12 ${
                isDark
                  ? 'bg-gradient-to-r from-transparent to-emerald-500/50'
                  : 'bg-gradient-to-r from-transparent to-white/50'
              }`}
            ></div>
            <span className="text-sm">Natación · Escuelita · Pase Libre</span>
            <div
              className={`h-px w-12 ${
                isDark
                  ? 'bg-gradient-to-l from-transparent to-emerald-500/50'
                  : 'bg-gradient-to-l from-transparent to-white/50'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/logo-villamitre.png"
              alt="Club Villa Mitre"
              className="w-24 h-24 mx-auto mb-4"
            />
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-villamitre-black'}`}>
              Club Villa Mitre
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Gestión de Pileta</p>
          </div>

          {/* Card de login */}
          <div
            className={`rounded-2xl shadow-xl p-8 ${
              isDark
                ? 'bg-slate-900 border border-slate-800'
                : 'bg-white border-t-4 border-villamitre-green'
            }`}
          >
            {/* Header */}
            <div className={`pb-6 mb-8 ${isDark ? 'border-b border-slate-800' : ''}`}>
              {isDark && (
                <div className="w-12 h-1 bg-gradient-to-r from-villamitre-green to-emerald-400 rounded-full mb-4"></div>
              )}
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-villamitre-black'}`}>
                Iniciar Sesión
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Ingresá tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DNI */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-300' : 'text-villamitre-black'
                  }`}
                >
                  DNI
                </label>
                <input
                  type="text"
                  value={credenciales.dni}
                  onChange={(e) => setCredenciales({ ...credenciales, dni: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl transition ${
                    isDark
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                      : 'border-2 border-gray-200 text-gray-900 focus:border-villamitre-green focus:ring-4 focus:ring-green-100 placeholder-gray-400'
                  }`}
                  placeholder="12345678"
                  required
                />
              </div>

              {/* Contraseña */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-gray-300' : 'text-villamitre-black'
                  }`}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={credenciales.password}
                    onChange={(e) =>
                      setCredenciales({ ...credenciales, password: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl transition ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                        : 'border-2 border-gray-200 text-gray-900 focus:border-villamitre-green focus:ring-4 focus:ring-green-100 placeholder-gray-400'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                      isDark
                        ? 'text-gray-400 hover:text-villamitre-green'
                        : 'text-gray-400 hover:text-villamitre-green'
                    }`}
                  >
                    {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg ${
                  isDark
                    ? 'bg-gradient-to-r from-villamitre-green to-emerald-500 hover:from-emerald-600 hover:to-emerald-500 text-white shadow-villamitre-green/20 hover:shadow-villamitre-green/40'
                    : 'bg-villamitre-green hover:bg-emerald-600 text-white hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Ingresar</span>
                  </>
                )}
              </button>
              {/* Links adicionales */}
<div className="space-y-2 text-center text-sm">
  <Link 
    to="/recuperar-password" 
    className="block text-primary-600 hover:text-primary-700 font-medium"
  >
    ¿Olvidaste tu contraseña?
  </Link>
  <div className="text-gray-600">
    ¿No tenés cuenta?{' '}
    <Link 
      to="/registro" 
      className="text-primary-600 hover:text-primary-700 font-medium"
    >
      Registrate acá
    </Link>
  </div>
</div>
            </form>

            {/* Links */}
            <div
              className={`mt-8 pt-6 space-y-3 text-center text-sm ${
                isDark ? 'border-t border-slate-800' : ''
              }`}
            >
              <Link
                to="/recuperar-password"
                className={`block font-medium transition ${
                  isDark
                    ? 'text-villamitre-green hover:text-emerald-400'
                    : 'text-villamitre-green hover:text-emerald-600'
                }`}
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                ¿No tenés cuenta?{' '}
                <Link
                  to="/registro"
                  className={`font-semibold transition ${
                    isDark
                      ? 'text-villamitre-green hover:text-emerald-400'
                      : 'text-villamitre-green hover:text-emerald-600'
                  }`}
                >
                  Registrate acá
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className={`text-center text-sm mt-8 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            © 2024 Club Villa Mitre · Bahía Blanca
          </p>
        </div>
      </div>
    </div>
  );
}
