import { useState, useEffect } from 'react';
import { User, Phone, Calendar, Award } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function MisAlumnos() {
  const [turnos, setTurnos] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    cargarTurnos();
  }, []);

  useEffect(() => {
    if (turnoSeleccionado) {
      cargarAlumnos();
    }
  }, [turnoSeleccionado]);

  const cargarTurnos = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/profesor/mis-turnos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTurnos(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar turnos');
    }
  };

  const cargarAlumnos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/profesor/turnos/${turnoSeleccionado}/alumnos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlumnos(response.data.data.alumnos || []);
    } catch (error) {
      toast.error('Error al cargar alumnos');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mis Alumnos</h2>
        <p className="text-gray-600">Lista de alumnos inscriptos en tus turnos</p>
      </div>

      {/* Selector de turno */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Turno
        </label>
        <select
          value={turnoSeleccionado || ''}
          onChange={(e) => setTurnoSeleccionado(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Todos los turnos</option>
          {turnos.map((turno) => (
            <option key={turno.id} value={turno.id}>
              {turno.dia_semana.charAt(0).toUpperCase() + turno.dia_semana.slice(1)} -{' '}
              {turno.hora_inicio} - {turno.nivel} ({turno.inscriptos} alumnos)
            </option>
          ))}
        </select>
      </div>

      {/* Lista de alumnos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : alumnos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            {turnoSeleccionado ? 'No hay alumnos inscriptos en este turno' : 'Seleccioná un turno para ver los alumnos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alumnos.map((alumno) => (
            <div
              key={alumno.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-purple-500"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-purple-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {alumno.nombre_completo}
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 flex-shrink-0" size={16} />
                      <span className="truncate">DNI: {alumno.dni}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 flex-shrink-0" size={16} />
                      <span className="truncate">{alumno.telefono}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Award className="mr-2 flex-shrink-0" size={16} />
                      {alumno.pase_libre ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Pase Libre
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Regular
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Inscripto: {alumno.fecha_inscripcion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {alumnos.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>{alumnos.length}</strong> {alumnos.length === 1 ? 'alumno inscripto' : 'alumnos inscriptos'} en este turno
          </p>
        </div>
      )}
    </div>
  );
}
