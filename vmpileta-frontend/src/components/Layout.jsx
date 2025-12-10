import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useThemeStore from '../stores/useThemeStore';
import ThemeSwitcher from './ThemeSwitcher';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-gray-100'}`}>
      {/* Navbar */}
      <nav className={`shadow-lg ${isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <img src="/logo-villamitre.png" alt="Villa Mitre" className="h-10 w-10" />
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-villamitre-black'}`}>
                  Club Villa Mitre
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sistema de Gestión de Pileta
                </p>
              </div>
            </div>

            {/* Usuario y acciones */}
            <div className="flex items-center space-x-4">
              {/* Info de usuario */}
              <div className={`hidden md:flex items-center space-x-3 px-4 py-2 rounded-lg ${
                isDark ? 'bg-slate-800' : 'bg-gray-100'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-villamitre-green/20' : 'bg-villamitre-green/10'
                }`}>
                  <User className="text-villamitre-green" size={18} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {user?.nombre_completo}
                  </p>
                  <p className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user?.tipo_usuario}
                  </p>
                </div>
              </div>

              {/* Botón de tema */}
              <ThemeSwitcher />

              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
