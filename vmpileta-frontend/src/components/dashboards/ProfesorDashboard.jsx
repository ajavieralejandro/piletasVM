import { useState } from 'react';
import Layout from '../Layout';
import { Calendar, CheckSquare, Users } from 'lucide-react';
import MisTurnos from './profesor/MisTurnos';
import TomarAsistencia from './profesor/TomarAsistencia';
import MisAlumnos from './profesor/MisAlumnos';

export default function ProfesorDashboard() {
  const [seccionActiva, setSeccionActiva] = useState('turnos');

  const secciones = [
    { id: 'turnos', nombre: 'Mis Turnos', icono: Calendar, color: 'green' },
    { id: 'asistencias', nombre: 'Asistencias', icono: CheckSquare, color: 'blue' },
    { id: 'alumnos', nombre: 'Alumnos', icono: Users, color: 'purple' },
  ];

  const getColorClasses = (color, activa) => {
    const colors = {
      green: activa ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100',
      blue: activa ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100',
      purple: activa ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100',
    };
    return colors[color];
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Profesor</h1>
          <p className="text-gray-600 mt-1">Gestión de turnos y asistencias</p>
        </div>

        {/* Navegación */}
        <div className="bg-white rounded-lg shadow p-2 flex gap-2 overflow-x-auto">
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

        {/* Contenido */}
        <div>
          {seccionActiva === 'turnos' && <MisTurnos />}
          {seccionActiva === 'asistencias' && <TomarAsistencia />}
          {seccionActiva === 'alumnos' && <MisAlumnos />}
        </div>
      </div>
    </Layout>
  );
}
