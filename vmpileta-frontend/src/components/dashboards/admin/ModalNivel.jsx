import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { nivelesAPI } from '../../../services/api';
import toast from 'react-hot-toast';

export default function ModalNivel({ nivel, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    orden: '',
  });

  useEffect(() => {
    if (nivel) {
      setForm({
        nombre: nivel.nombre || '',
        descripcion: nivel.descripcion || '',
        orden: nivel.orden || '',
      });
    }
  }, [nivel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...form,
        orden: form.orden ? parseInt(form.orden) : undefined,
      };

      if (nivel) {
        await nivelesAPI.update(nivel.id, data);
        toast.success('Nivel actualizado');
      } else {
        await nivelesAPI.create(data);
        toast.success('Nivel creado');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {nivel ? 'Editar Nivel' : 'Nuevo Nivel'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: Principiante, Intermedio, Avanzado"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Descripción del nivel (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => setForm({...form, orden: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="1, 2, 3... (opcional)"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Orden en el que se muestran los niveles</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
