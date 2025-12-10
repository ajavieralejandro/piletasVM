import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function GestionUsuariosPendientes() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    cargarPendientes();
  }, []);

  const cargarPendientes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/gestion/usuarios-pendientes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Pendientes:', response.data.data);
      setPendientes(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios pendientes');
    }
    setLoading(false);
  };

  const handleAprobar = async (usuario) => {
    if (!confirm(`Aprobar a ${usuario.nombre_completo}?`)) return;

    try {
      await axios.put(
        `http://localhost:8000/api/gestion/usuarios/${usuario.id}/aprobar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Usuario aprobado');
      cargarPendientes();
    } catch (error) {
      toast.error('Error al aprobar usuario');
    }
  };

  const handleRechazar = async (usuario) => {
    if (!confirm(`Rechazar a ${usuario.nombre_completo}? Esta accion no se puede deshacer.`)) return;

    try {
      await axios.delete(`http://localhost:8000/api/gestion/usuarios/${usuario.id}/rechazar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Usuario rechazado');
      cargarPendientes();
    } catch (error) {
      toast.error('Error al rechazar usuario');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Usuarios Pendientes</h2>
        <p className="text-gray-600 mt-1">
          {pendientes.length} {pendientes.length === 1 ? 'registro pendiente' : 'registros pendientes'} de aprobacion
        </p>
      </div>

      {pendientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No hay usuarios pendientes de aprobacion</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendientes.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{usuario.nombre_completo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.dni}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.telefono}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ' + 
                      (usuario.tipo_usuario === 'profesor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800')}>
                      {usuario.tipo_usuario === 'profesor' ? 'Profesor' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.fecha_registro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleAprobar(usuario)}
                        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition"
                        title="Aprobar"
                      >
                        <UserCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleRechazar(usuario)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                        title="Rechazar"
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
