import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { turnosAdminAPI, profesoresAPI, nivelesAPI } from '../../../services/api';
import toast from 'react-hot-toast';

export default function ModalTurno({ turno, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [form, setForm] = useState({
    profesor_id: '',
    nivel_id: '',
    hora_inicio: '',
    hora_fin: '',
    cupo_maximo: '15',
    dia_semana: 'lunes',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (turno) {
      setForm({
        profesor_id: turno.profesor?.id || '',
        nivel_id: turno.nivel?.id || '',
        hora_inicio: turno.hora_inicio || '',
        hora_fin: turno.hora_fin || '',
        cupo_maximo: turno.cupo_maximo || '15',
        dia_semana: turno.dia_semana || 'lunes',
      });
    }
  }, [turno]);

  const cargarDatos = async () => {
    try {
      const [profResponse, nivResponse] = await Promise.all([
        profesoresAPI.getAll(),
        nivelesAPI.getAll(),
      ]);
      setProfesores(profResponse.data.data || []);
      setNiveles(nivResponse.data.data || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...form,
        profesor_id: parseInt(form.profesor_id),
        nivel_id: form.nivel_id ? parseInt(form.nivel_id) : null,
        cupo_maximo: parseInt(form.cupo_maximo),
      };

      if (turno) {
        await turnosAdminAPI.update(turno.id, data);
        toast.success('Turno actualizado');
      } else {
        await turnosAdminAPI.create(data);
        toast.success('Turno creado');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {turno ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesor *</label>
            <select
              value={form.profesor_id}
              onChange={(e) => setForm({...form, profesor_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar profesor</option>
              {profesores.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.nombre_completo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              value={form.nivel_id}
              onChange={(e) => setForm({...form, nivel_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin nivel específico</option>
              {niveles.map(nivel => (
                <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana *</label>
            <select
              value={form.dia_semana}
              onChange={(e) => setForm({...form, dia_semana: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="lunes">Lunes</option>
              <option value="martes">Martes</option>
              <option value="miercoles">Miércoles</option>
              <option value="jueves">Jueves</option>
              <option value="viernes">Viernes</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio *</label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm({...form, hora_inicio: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin *</label>
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e) => setForm({...form, hora_fin: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cupo máximo *</label>
            <input
              type="number"
              value={form.cupo_maximo}
              onChange={(e) => setForm({...form, cupo_maximo: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="50"
              required
            />
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
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
