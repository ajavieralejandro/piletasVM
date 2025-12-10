import { useState, useEffect } from 'react';
import { Calendar, Check, X, FileText, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function MisAsistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const diasSemana = {
    lunes: 'Lun',
    martes: 'Mar',
    miercoles: 'Mié',
    jueves: 'Jue',
    viernes: 'Vie',
    sabado: 'Sáb',
    domingo: 'Dom',
  };

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/cliente/mis-asistencias', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAsistencias(response.data.data || []);
      setEstadisticas(response.data.estadisticas);
    } catch (error) {
      toast.error('Error al cargar asistencias');
    }
    setLoading(false);
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'presente':
        return <Check className="text-green-600" size={18} />;
      case 'ausente':
        return <X className="text-red-600" size={18} />;
      case 'justificado':
        return <FileText className="text-yellow-600" size={18} />;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      presente: 'bg-green-100 text-green-800',
      ausente: 'bg-red-100 text-red-800',
      justificado: 'bg-yellow-100 text-yellow-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  if (asistencias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No tenés asistencias registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mis Asistencias</h2>
        <p className="text-gray-600">Historial de tus clases</p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-800">{estadisticas.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{estadisticas.presentes}</div>
            <div className="text-sm text-gray-600">Presentes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{estadisticas.ausentes}</div>
            <div className="text-sm text-gray-600">Ausentes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-purple-600" size={20} />
              <div className="text-2xl font-bold text-purple-600">
                {estadisticas.porcentaje_asistencia}%
              </div>
            </div>
            <div className="text-sm text-gray-600">Asistencia</div>
          </div>
        </div>
      )}

      {/* Lista de Asistencias */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistencias.map((asistencia) => (
                <tr key={asistencia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {asistencia.fecha}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {diasSemana[asistencia.turno.dia_semana]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {asistencia.turno.hora_inicio} - {asistencia.turno.hora_fin}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {asistencia.turno.nivel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-2">
                      {getEstadoIcon(asistencia.estado)}
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(
                          asistencia.estado
                        )}`}
                      >
                        {asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {asistencia.observaciones || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <p className="text-sm text-green-800">
          Se muestran las últimas 50 asistencias registradas
        </p>
      </div>
    </div>
  );
}
