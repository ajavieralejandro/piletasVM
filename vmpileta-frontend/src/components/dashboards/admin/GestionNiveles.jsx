import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { nivelesAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import useThemeStore from '../../../stores/useThemeStore';
import ModalNivel from './ModalNivel';

export default function GestionNiveles() {
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nivelEditar, setNivelEditar] = useState(null);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    cargarNiveles();
  }, []);

  const cargarNiveles = async () => {
    try {
      const response = await nivelesAPI.getAll();
      setNiveles(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar niveles');
    }
    setLoading(false);
  };

  const handleEliminar = async (nivel) => {
    if (!confirm(`¿Eliminar el nivel "${nivel.nombre}"?`)) return;

    try {
      await nivelesAPI.delete(nivel.id);
      toast.success('Nivel eliminado');
      cargarNiveles();
    } catch (error) {
      toast.error('Error al eliminar nivel');
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
            Niveles
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {niveles.length} registrados
          </p>
        </div>
        <button
          onClick={() => { setNivelEditar(null); setModalOpen(true); }}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium shadow-md"
        >
          <Plus size={20} />
          <span>Nuevo Nivel</span>
        </button>
      </div>

      {niveles.length === 0 ? (
        <div className={`rounded-lg shadow p-12 text-center ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <Layers className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            No hay niveles registrados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {niveles.map(nivel => (
            <div 
              key={nivel.id} 
              className={`rounded-lg shadow hover:shadow-lg transition p-6 ${
                isDark 
                  ? 'bg-slate-900 border border-slate-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-purple-900' : 'bg-purple-100'
                  }`}>
                    <Layers className={isDark ? 'text-purple-400' : 'text-purple-600'} size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {nivel.nombre}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Orden: {nivel.orden}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  nivel.activo 
                    ? isDark 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-green-100 text-green-700'
                    : isDark
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {nivel.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {nivel.descripcion && (
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {nivel.descripcion}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setNivelEditar(nivel); setModalOpen(true); }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition ${
                    isDark
                      ? 'bg-blue-900 hover:bg-blue-800 text-blue-400'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleEliminar(nivel)}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg transition ${
                    isDark
                      ? 'bg-red-900 hover:bg-red-800 text-red-400'
                      : 'bg-red-50 hover:bg-red-100 text-red-700'
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ModalNivel
          nivel={nivelEditar}
          onClose={() => { setModalOpen(false); setNivelEditar(null); }}
          onSuccess={() => { setModalOpen(false); setNivelEditar(null); cargarNiveles(); }}
        />
      )}
    </div>
  );
}
