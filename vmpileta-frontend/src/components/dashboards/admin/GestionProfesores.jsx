import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, User, Power, PowerOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';
import useThemeStore from '../../../stores/useThemeStore';
import ModalProfesor from './ModalProfesor';

export default function GestionProfesores() {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [profesorEditar, setProfesorEditar] = useState(null);
  const token = useAuthStore((state) => state.token);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    cargarProfesores();
  }, []);

  const cargarProfesores = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/profesores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfesores(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar profesores');
    }
    setLoading(false);
  };

  const handleNuevoProfesor = () => {
    setProfesorEditar(null);
    setModalAbierto(true);
  };

  const handleEditarProfesor = (profesor) => {
    setProfesorEditar(profesor);
    setModalAbierto(true);
  };

  const handleEliminarProfesor = async (profesor) => {
    if (!confirm(`¿Eliminar a ${profesor.nombre_completo}?`)) return;

    try {
      await axios.delete(`http://localhost:8000/api/profesores/${profesor.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Profesor eliminado');
      cargarProfesores();
    } catch (error) {
      toast.error('Error al eliminar profesor');
    }
  };

  const handleCambiarEstado = async (profesor) => {
    const nuevoEstado = !profesor.activo;
    
    try {
      await axios.put(
        `http://localhost:8000/api/gestion/usuarios/${profesor.id}/estado`,
        { activo: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(nuevoEstado ? 'Profesor activado' : 'Profesor desactivado');
      cargarProfesores();
    } catch (error) {
      toast.error('Error al cambiar estado');
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Gestión de Profesores
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {profesores.length} {profesores.length === 1 ? 'profesor registrado' : 'profesores registrados'}
          </p>
        </div>
        <button
          onClick={handleNuevoProfesor}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
        >
          <UserPlus size={20} />
          <span>Nuevo Profesor</span>
        </button>
      </div>

      {profesores.length === 0 ? (
        <div className={`rounded-lg shadow p-12 text-center ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <User className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            No hay profesores registrados
          </p>
          <button
            onClick={handleNuevoProfesor}
            className={`mt-4 px-4 py-2 rounded-lg transition ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-green-400' 
                : 'bg-green-50 hover:bg-green-100 text-green-700'
            }`}
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className={`rounded-lg shadow overflow-hidden ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={isDark ? 'bg-slate-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Profesor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  DNI
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Teléfono
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Email
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
              {profesores.map((profesor) => (
                <tr key={profesor.id} className={isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-green-900' : 'bg-green-100'
                      }`}>
                        <User className={isDark ? 'text-green-400' : 'text-green-600'} size={20} />
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {profesor.nombre_completo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {profesor.dni}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {profesor.telefono}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {profesor.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleCambiarEstado(profesor)}
                      className={`px-3 py-1 inline-flex items-center space-x-1 text-xs leading-5 font-semibold rounded-full transition ${
                        profesor.activo
                          ? isDark 
                            ? 'bg-green-900 text-green-300 hover:bg-green-800'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                          : isDark
                            ? 'bg-red-900 text-red-300 hover:bg-red-800'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      title={profesor.activo ? 'Click para desactivar' : 'Click para activar'}
                    >
                      {profesor.activo ? (
                        <>
                          <Power size={12} />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <PowerOff size={12} />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditarProfesor(profesor)}
                        className={`p-2 rounded-lg transition ${
                          isDark 
                            ? 'bg-blue-900 hover:bg-blue-800 text-blue-400' 
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                        }`}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminarProfesor(profesor)}
                        className={`p-2 rounded-lg transition ${
                          isDark 
                            ? 'bg-red-900 hover:bg-red-800 text-red-400' 
                            : 'bg-red-50 hover:bg-red-100 text-red-700'
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <ModalProfesor
          profesor={profesorEditar}
          onClose={() => {
            setModalAbierto(false);
            setProfesorEditar(null);
          }}
          onSuccess={() => {
            cargarProfesores();
            setModalAbierto(false);
            setProfesorEditar(null);
          }}
        />
      )}
    </div>
  );
}
