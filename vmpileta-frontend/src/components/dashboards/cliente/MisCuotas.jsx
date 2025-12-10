import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function MisCuotas() {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    cargarCuotas();
  }, []);

  const cargarCuotas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/gestion/cuotas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const todasCuotas = response.data.data || [];
      console.log('TODAS las cuotas:', todasCuotas);
      console.log('User ID:', user.id);
      console.log('Primera cuota ejemplo:', todasCuotas[0]);
      
      // Filtrar solo MIS cuotas
      const misCuotas = todasCuotas.filter(c => {
        const alumnoId = c.alumno ? c.alumno.id : c.alumno_id;
        console.log('Comparando cuota:', c.id, 'alumno_id:', alumnoId, 'con user.id:', user.id);
        return alumnoId === user.id;
      });
      
      console.log('Mis cuotas filtradas:', misCuotas);
      setCuotas(misCuotas);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar cuotas');
    }
    setLoading(false);
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icono: <AlertTriangle size={14} />,
        label: 'Pendiente',
      },
      pagada: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icono: <CheckCircle size={14} />,
        label: 'Pagada',
      },
      vencida: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icono: <XCircle size={14} />,
        label: 'Vencida',
      },
    };

    const config = estados[estado] || estados.pendiente;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icono}
        <span>{config.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente').length;
  const cuotasVencidas = cuotas.filter(c => c.estado === 'vencida').length;
  const totalPendiente = cuotas
    .filter(c => c.estado !== 'pagada')
    .reduce((sum, c) => sum + parseFloat(c.monto), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mis Cuotas</h2>
        <p className="text-gray-600 mt-1">Estado de tus pagos mensuales</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{cuotasPendientes}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Vencidas</p>
              <p className="text-2xl font-bold text-red-900">{cuotasVencidas}</p>
            </div>
            <XCircle className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total a Pagar</p>
              <p className="text-2xl font-bold text-blue-900">${totalPendiente.toFixed(2)}</p>
            </div>
            <DollarSign className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Lista de cuotas */}
      {cuotas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No tenés cuotas registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Pago
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuotas.map((cuota) => (
                <tr key={cuota.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cuota.mes_anio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    ${parseFloat(cuota.monto).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cuota.fecha_vencimiento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(cuota.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cuota.fecha_pago || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Información adicional */}
      {(cuotasPendientes > 0 || cuotasVencidas > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Recordatorio:</strong> Podés abonar tus cuotas en la secretaría del club.
            Llevá tu DNI para identificarte.
          </p>
        </div>
      )}
    </div>
  );
}
