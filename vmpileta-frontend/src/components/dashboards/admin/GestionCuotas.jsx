import { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar, CheckCircle, AlertCircle, Mail, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';
import ModalCrearCuota from './ModalCrearCuota';
import useThemeStore from '../../../stores/useThemeStore';

export default function GestionCuotas() {
  const [cuotas, setCuotas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const token = useAuthStore((state) => state.token);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    cargarCuotas();
    cargarEstadisticas();
  }, [filtro]);

  const cargarCuotas = async () => {
    try {
      let params = {};
      if (filtro === 'pendientes') params.estado = 'pendiente';
      if (filtro === 'pagadas') params.estado = 'pagada';
      if (filtro === 'vencidas') params.vencidas = true;

      const response = await axios.get('http://localhost:8000/api/gestion/cuotas', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setCuotas(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar cuotas');
    }
    setLoading(false);
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/gestion/cuotas/estadisticas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEstadisticas(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas');
    }
  };

  const handleMarcarPagada = async (cuota) => {
    if (!confirm(`¿Marcar cuota de ${cuota.alumno.nombre_completo} como pagada?`)) return;

    try {
      await axios.put(
        `http://localhost:8000/api/gestion/cuotas/${cuota.id}/pagar`,
        { fecha_pago: new Date().toISOString().split('T')[0] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cuota marcada como pagada');
      cargarCuotas();
      cargarEstadisticas();
    } catch (error) {
      toast.error('Error al marcar como pagada');
    }
  };

  const handleEnviarRecordatorio = async (cuota) => {
    try {
      await axios.post(
        `http://localhost:8000/api/gestion/cuotas/${cuota.id}/recordatorio`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Recordatorio enviado');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar recordatorio');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { 
        bg: isDark ? 'bg-yellow-900' : 'bg-yellow-100', 
        text: isDark ? 'text-yellow-300' : 'text-yellow-800', 
        label: 'Pendiente' 
      },
      pagada: { 
        bg: isDark ? 'bg-green-900' : 'bg-green-100', 
        text: isDark ? 'text-green-300' : 'text-green-800', 
        label: 'Pagada' 
      },
      vencida: { 
        bg: isDark ? 'bg-red-900' : 'bg-red-100', 
        text: isDark ? 'text-red-300' : 'text-red-800', 
        label: 'Vencida' 
      },
    };
    return badges[estado] || badges.pendiente;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Gestión de Cuotas
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Control de cobros y pagos
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          <Plus size={20} />
          <span>Nueva Cuota</span>
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`rounded-lg shadow p-6 border-l-4 border-yellow-500 ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {estadisticas.cantidad.pendientes}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Cuotas Pendientes
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              ${estadisticas.montos.pendiente.toLocaleString()}
            </div>
          </div>

          <div className={`rounded-lg shadow p-6 border-l-4 border-red-500 ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-red-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {estadisticas.cantidad.vencidas}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Cuotas Vencidas
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              ${estadisticas.montos.vencido.toLocaleString()}
            </div>
          </div>

          <div className={`rounded-lg shadow p-6 border-l-4 border-green-500 ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.cantidad.pagadas}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Cuotas Pagadas
            </div>
          </div>

          <div className={`rounded-lg shadow p-6 border-l-4 border-blue-500 ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${estadisticas.montos.pagado_mes_actual.toLocaleString()}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Cobrado este mes
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className={`rounded-lg shadow p-4 ${
        isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
      }`}>
        <div className="flex space-x-2">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'pendientes', label: 'Pendientes' },
            { id: 'vencidas', label: 'Vencidas' },
            { id: 'pagadas', label: 'Pagadas' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtro === f.id
                  ? 'bg-blue-600 text-white'
                  : isDark
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de cuotas */}
      {cuotas.length === 0 ? (
        <div className={`rounded-lg shadow p-12 text-center ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <DollarSign className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            No hay cuotas {filtro !== 'todas' ? filtro : ''}
          </p>
        </div>
      ) : (
        <div className={`rounded-lg shadow overflow-hidden ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={isDark ? 'bg-slate-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Alumno
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Monto
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Vencimiento
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Estado
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
                {cuotas.map((cuota) => {
                  const badge = getEstadoBadge(cuota.estado);
                  const diasVencer = Math.floor(cuota.dias_para_vencer);  
                  const vencida = diasVencer < 0;
                  const proximaVencer = diasVencer >= 0 && diasVencer <= 7;

                  return (
                    <tr key={cuota.id} className={isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {cuota.alumno.nombre_completo}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            DNI: {cuota.alumno.dni}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${cuota.monto.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {cuota.fecha_vencimiento_formatted}
                        </div>
                        {cuota.estado === 'pendiente' && (
                          <div className={`text-xs mt-1 ${vencida ? 'text-red-600' : proximaVencer ? 'text-orange-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {vencida
                              ? `Vencida hace ${Math.abs(diasVencer)} días`
                              : proximaVencer
                              ? `Vence en ${Math.abs(diasVencer)} ${Math.abs(diasVencer) === 1 ? 'día' : 'días'}`
                              : ''}
                          </div>
                        )}
                        {cuota.estado === 'pagada' && cuota.fecha_pago && (
                          <div className="text-xs text-green-600 mt-1">
                            Pagada el {cuota.fecha_pago}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {cuota.estado !== 'pagada' && (
                            <>
                              <button
                                onClick={() => handleMarcarPagada(cuota)}
                                className={`p-2 rounded-lg transition ${
                                  isDark
                                    ? 'bg-green-900 hover:bg-green-800 text-green-400'
                                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                                }`}
                                title="Marcar como pagada"
                              >
                                <CheckCircle size={16} />
                              </button>
                              {cuota.alumno.email && (
                                <button
                                  onClick={() => handleEnviarRecordatorio(cuota)}
                                  className={`p-2 rounded-lg transition ${
                                    isDark
                                      ? 'bg-blue-900 hover:bg-blue-800 text-blue-400'
                                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                  }`}
                                  title="Enviar recordatorio"
                                >
                                  <Mail size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal crear cuota */}
      {modalAbierto && (
        <ModalCrearCuota
          onClose={() => setModalAbierto(false)}
          onSuccess={() => {
            setModalAbierto(false);
            cargarCuotas();
            cargarEstadisticas();
          }}
        />
      )}
    </div>
  );
}
