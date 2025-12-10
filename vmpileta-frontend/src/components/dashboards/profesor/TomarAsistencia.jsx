import { useState, useEffect } from 'react';
import { Calendar, Check, X, FileText, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function TomarAsistencia() {
  const [turnos, setTurnos] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    cargarTurnos();
  }, []);

  useEffect(() => {
    if (turnoSeleccionado) {
      cargarAsistencias();
    }
  }, [turnoSeleccionado, fecha]);

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

  const cargarAsistencias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/profesor/turnos/${turnoSeleccionado}/asistencias`,
        {
          params: { fecha },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlumnos(response.data.data.alumnos || []);
    } catch (error) {
      toast.error('Error al cargar asistencias');
    }
    setLoading(false);
  };

  const handleEstadoChange = (alumnoId, nuevoEstado) => {
    setAlumnos((prev) =>
      prev.map((alumno) =>
        alumno.id === alumnoId ? { ...alumno, estado: nuevoEstado } : alumno
      )
    );
  };

  const handleObservacionChange = (alumnoId, observacion) => {
    setAlumnos((prev) =>
      prev.map((alumno) =>
        alumno.id === alumnoId ? { ...alumno, observaciones: observacion } : alumno
      )
    );
  };

  const handleGuardar = async () => {
    if (!turnoSeleccionado) {
      toast.error('Seleccioná un turno');
      return;
    }

    const asistenciasAGuardar = alumnos
      .filter((alumno) => alumno.estado)
      .map((alumno) => ({
        alumno_id: alumno.id,
        estado: alumno.estado,
        observaciones: alumno.observaciones || null,
      }));

    if (asistenciasAGuardar.length === 0) {
      toast.error('Marcá al menos una asistencia');
      return;
    }

    setGuardando(true);
    try {
      await axios.post(
        'http://localhost:8000/api/profesor/asistencias/masivas',
        {
          turno_id: turnoSeleccionado,
          fecha,
          asistencias: asistenciasAGuardar,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Asistencias guardadas correctamente');
    } catch (error) {
      toast.error('Error al guardar asistencias');
    }
    setGuardando(false);
  };

  const marcarTodosPresentes = () => {
    setAlumnos((prev) => prev.map((alumno) => ({ ...alumno, estado: 'presente' })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tomar Asistencia</h2>
        <p className="text-gray-600">Registrá la asistencia de tus alumnos</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
            <select
              value={turnoSeleccionado || ''}
              onChange={(e) => setTurnoSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar turno</option>
              {turnos.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {turno.dia_semana.charAt(0).toUpperCase() + turno.dia_semana.slice(1)} -{' '}
                  {turno.hora_inicio} - {turno.nivel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={marcarTodosPresentes}
              disabled={!turnoSeleccionado || alumnos.length === 0}
              className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition disabled:opacity-50"
            >
              Marcar todos presentes
            </button>
          </div>
        </div>
      </div>

      {/* Lista de alumnos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : alumnos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            {turnoSeleccionado ? 'No hay alumnos inscriptos en este turno' : 'Seleccioná un turno'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alumno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  DNI
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Asistencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alumnos.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {alumno.nombre_completo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alumno.dni}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEstadoChange(alumno.id, 'presente')}
                        className={`p-2 rounded-lg transition ${
                          alumno.estado === 'presente'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                        }`}
                        title="Presente"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleEstadoChange(alumno.id, 'ausente')}
                        className={`p-2 rounded-lg transition ${
                          alumno.estado === 'ausente'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                        }`}
                        title="Ausente"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => handleEstadoChange(alumno.id, 'justificado')}
                        className={`p-2 rounded-lg transition ${
                          alumno.estado === 'justificado'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                        }`}
                        title="Justificado"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={alumno.observaciones || ''}
                      onChange={(e) => handleObservacionChange(alumno.id, e.target.value)}
                      placeholder="Observaciones..."
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botón guardar */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{guardando ? 'Guardando...' : 'Guardar Asistencias'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
