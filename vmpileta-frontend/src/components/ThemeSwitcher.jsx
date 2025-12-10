import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../stores/useThemeStore';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-xl transition-all ${
        theme === 'dark'
          ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
          : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
      }`}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
