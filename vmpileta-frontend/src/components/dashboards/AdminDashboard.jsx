import { useState } from 'react';
import Layout from '../Layout';
import { Users, Calendar, Layers, UserPlus, UserCheck, DollarSign } from 'lucide-react';
import GestionProfesores from './admin/GestionProfesores';
import GestionNiveles from './admin/GestionNiveles';
import GestionTurnos from './admin/GestionTurnos';
import SecretariaDashboard from './SecretariaDashboard';
import GestionUsuariosPendientes from './admin/GestionUsuariosPendientes';
import useThemeStore from '../../stores/useThemeStore';
import GestionCuotas from './admin/GestionCuotas';

export default function AdminDashboard() {
  const [seccionActiva, setSeccionActiva] = useState('secretaria');
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const secciones = [
    { id: 'secretaria', nombre: 'Inscripciones', icono: UserPlus, color: 'primary' },
    { id: 'turnos', nombre: 'Turnos', icono: Calendar, color: 'blue' },
    { id: 'profesores', nombre: 'Profesores', icono: Users, color: 'green' },
    { id: 'niveles', nombre: 'Niveles', icono: Layers, color: 'purple' },
    { id: 'pendientes', nombre: 'Pendientes', icono: UserCheck, color: 'yellow' },
    { id: 'cuotas', nombre: 'Cuotas', icono: DollarSign, color: 'cyan' },
  ];

  const getColorClasses = (color, activa) => {
    if (isDark) {
      // Modo oscuro
      const darkColors = {
        primary: activa ? 'bg-villamitre-green text-white' : 'text-gray-300 hover:bg-slate-800',
        blue: activa ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-800',
        green: activa ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-slate-800',
        purple: activa ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-800',
        yellow: activa ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-slate-800',
        cyan: activa ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-slate-800',
      };
      return darkColors[color];
    } else {
      // Modo claro
      const lightColors = {
        primary: activa ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100',
        blue: activa ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100',
        green: activa ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100',
        purple: activa ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100',
        yellow: activa ? 'bg-yellow-600 text-white' : 'text-gray-700 hover:bg-gray-100',
        cyan: activa ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-100',
      };
      return lightColors[color];
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Panel de Gestión
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Administración completa del sistema
          </p>
        </div>

        {/* Navegación de secciones */}
        <div className={`rounded-lg shadow p-2 flex gap-2 overflow-x-auto ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          {secciones.map((seccion) => {
            const Icon = seccion.icono;
            const activa = seccionActiva === seccion.id;

            return (
              <button
                key={seccion.id}
                onClick={() => setSeccionActiva(seccion.id)}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${getColorClasses(
                  seccion.color,
                  activa
                )}`}
              >
                <Icon size={20} />
                <span>{seccion.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido de la sección activa */}
        <div>
          {seccionActiva === 'secretaria' && <SecretariaDashboard />}
          {seccionActiva === 'turnos' && <GestionTurnos />}
          {seccionActiva === 'profesores' && <GestionProfesores />}
          {seccionActiva === 'niveles' && <GestionNiveles />}
          {seccionActiva === 'pendientes' && <GestionUsuariosPendientes />}
          {seccionActiva === 'cuotas' && <GestionCuotas />}
        </div>
      </div>
    </Layout>
  );
}