import { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function ModalCrearCuota({ onClose, onSuccess }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    alumno_id: '',
    monto: '',
    fecha_vencimiento: '',
    observaciones: '',
  });
  const [guardando, setGuardando] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/alumnos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar clientes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await axios.post(
        'http://localhost:8000/api/gestion/cuotas',
        {
          ...form,
          monto: parseFloat(form.monto),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cuota creada correctamente');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear cuota');
    }
    setGuardando(false);
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setForm({ ...form, alumno_id: clienteId });

    // Auto-rellenar monto si el cliente tiene monto_cuota configurado
    const cliente = clientes.find((c) => c.id === parseInt(clienteId));
    if (cliente && cliente.monto_cuota) {
      setForm((prev) => ({ ...prev, monto: cliente.monto_cuota }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Nueva Cuota</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente/Alumno *
            </label>
            <select
              value={form.alumno_id}
              onChange={handleClienteChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre_completo} - DNI: {cliente.dni}
                  {cliente.monto_cuota ? ` (Cuota: $${cliente.monto_cuota})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              value={form.fecha_vencimiento}
              onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Notas adicionales..."
            ></textarea>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {guardando ? 'Creando...' : 'Crear Cuota'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
