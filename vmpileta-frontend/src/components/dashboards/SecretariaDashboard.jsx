import { useState, useEffect } from 'react';
import { Calendar, Users, UserPlus, UserMinus, AlertTriangle } from 'lucide-react';
import { turnosAPI, alumnosAPI } from '../../services/api';
import useThemeStore from '../../stores/useThemeStore';
import SelectorDias from './secretaria/SelectorDias';
import TurnoCard from './secretaria/TurnoCard';
import ModalInscribir from './secretaria/ModalInscribir';
import toast from 'react-hot-toast';

export default function SecretariaDashboard() {
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alumnosInasistentes, setAlumnosInasistentes] = useState([]);
  const [modalInscribir, setModalInscribir] = useState({ open: false, turno: null });
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Cargar alumnos inasistentes
  useEffect(() => {
    cargarAlumnosInasistentes();
  }, []);

  const cargarAlumnosInasistentes = async () => {
    try {
      const response = await alumnosAPI.getInasistentes();
      setAlumnosInasistentes(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar inasistentes:', error);
    }
  };

  // Cargar turnos cuando cambian los días seleccionados
  useEffect(() => {
    if (diasSeleccionados.length > 0) {
      cargarTurnos();
    } else {
      setTurnos([]);
    }
  }, [diasSeleccionados]);

  const cargarTurnos = async () => {
    setLoading(true);
    try {
      const response = await turnosAPI.getPorDias(diasSeleccionados);
      setTurnos(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar turnos');
      console.error(error);
    }
    setLoading(false);
  };

  const handleInscribir = (turno) => {
    setModalInscribir({ open: true, turno });
  };

  const handleInscripcionExitosa = () => {
    setModalInscribir({ open: false, turno: null });
    cargarTurnos(); // Recargar turnos
    toast.success('Alumno inscripto exitosamente');
  };

  // Agrupar turnos por día
  const turnosPorDia = diasSeleccionados.reduce((acc, dia) => {
    acc[dia] = turnos.filter(t => t.dia_semana === dia)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    return acc;
  }, {});

  const nombresDias = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Panel de Secretaría
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Gestión de turnos e inscripciones
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg shadow p-6 ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Turnos Activos
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {turnos.length}
              </p>
            </div>
            <Calendar className="text-primary-500" size={32} />
          </div>
        </div>

        <div className={`rounded-lg shadow p-6 ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Alumnos Inasistentes
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {alumnosInasistentes.length}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={32} />
          </div>
        </div>

        <div className={`rounded-lg shadow p-6 ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Cupos Ocupados
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {turnos.reduce((sum, t) => sum + (t.cupo_maximo - t.cupo_disponible), 0)}
              </p>
            </div>
            <Users className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Selector de días */}
      <SelectorDias
        diasSeleccionados={diasSeleccionados}
        setDiasSeleccionados={setDiasSeleccionados}
      />

      {/* Turnos agrupados por día */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando turnos...
          </p>
        </div>
      ) : diasSeleccionados.length === 0 ? (
        <div className={`rounded-lg shadow p-12 text-center ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <Calendar className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Seleccioná los días para ver los turnos disponibles
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {diasSeleccionados.map(dia => (
            <div 
              key={dia} 
              className={`rounded-lg shadow p-6 ${
                isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
              }`}
            >
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {nombresDias[dia]}
              </h2>
              
              {turnosPorDia[dia]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {turnosPorDia[dia].map(turno => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      onInscribir={handleInscribir}
                      onRecargar={cargarTurnos}
                    />
                  ))}
                </div>
              ) : (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay turnos para este día
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alumnos con inasistencias */}
      {alumnosInasistentes.length > 0 && (
        <div className={`rounded-lg p-6 border ${
          isDark 
            ? 'bg-orange-900/20 border-orange-800' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="text-orange-600" size={24} />
            <h3 className={`text-lg font-bold ${
              isDark ? 'text-orange-400' : 'text-orange-800'
            }`}>
              Alumnos con Inasistencias Frecuentes
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alumnosInasistentes.map(alumno => (
              <div 
                key={alumno.id} 
                className={`rounded-lg p-4 shadow-sm ${
                  isDark ? 'bg-slate-800' : 'bg-white'
                }`}
              >
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {alumno.nombre_completo}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  DNI: {alumno.dni}
                </p>
                <p className="text-sm text-orange-600 font-medium mt-1">
                  {alumno.inasistencias} inasistencias
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de inscripción */}
      {modalInscribir.open && (
        <ModalInscribir
          turno={modalInscribir.turno}
          onClose={() => setModalInscribir({ open: false, turno: null })}
          onSuccess={handleInscripcionExitosa}
        />
      )}
    </div>
  );
}
