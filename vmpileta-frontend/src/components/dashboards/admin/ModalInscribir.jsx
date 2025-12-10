import { useState } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { inscripcionesAPI, alumnosAPI } from '../../../services/api';
import toast from 'react-hot-toast';

export default function ModalInscribir({ turno, onClose, onSuccess }) {
  const [modo, setModo] = useState('nuevo'); // 'nuevo' o 'existente'
  const [busqueda, setBusqueda] = useState('');
  const [alumnosEncontrados, setAlumnosEncontrados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Datos para nuevo alumno
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  });

  const buscarAlumnos = async () => {
    if (busqueda.trim().length < 3) {
      toast.error('Ingresá al menos 3 caracteres para buscar');
      return;
    }

    setLoading(true);
    try {
      const response = await alumnosAPI.buscar(busqueda);
      setAlumnosEncontrados(response.data.data || []);
    } catch (error) {
      toast.error('Error al buscar alumnos');
    }
    setLoading(false);
  };

  const inscribirAlumno = async (alumnoId) => {
    setLoading(true);
    try {
      await inscripcionesAPI.crear({
        turno_id: turno.id,
        alumno_id: alumnoId,
        fecha_inscripcion: new Date().toISOString().split('T')[0],
      });
      toast.success('Alumno inscripto exitosamente');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al inscribir alumno');
    }
    setLoading(false);
  };

  const crearEInscribirAlumno = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Crear alumno
      const response = await alumnosAPI.crear({
        ...nuevoAlumno,
        password: nuevoAlumno.dni, // Contraseña = DNI por defecto
        tipo_usuario: 'cliente',
        tipo_cliente: 'normal',
      });
      
      const alumnoId = response.data.data.id;
      
      // Inscribir en el turno
      await inscribirAlumno(alumnoId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear alumno');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Inscribir Alumno</h2>
            <p className="text-sm text-gray-600 mt-1">
              {turno.dia_semana} {turno.hora_inicio} - {turno.hora_fin}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Selector de modo */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setModo('nuevo')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                modo === 'nuevo'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nuevo Alumno
            </button>
            <button
              onClick={() => setModo('existente')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                modo === 'existente'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alumno Existente
            </button>
          </div>

          {/* Modo: Nuevo Alumno */}
          {modo === 'nuevo' && (
            <form onSubmit={crearEInscribirAlumno} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nuevoAlumno.nombre}
                    onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={nuevoAlumno.apellido}
                    onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, apellido: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI
                </label>
                <input
                  type="text"
                  value={nuevoAlumno.dni}
                  onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, dni: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={nuevoAlumno.telefono}
                  onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, telefono: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Inscribiendo...' : 'Crear e Inscribir'}
              </button>
            </form>
          )}

          {/* Modo: Alumno Existente */}
          {modo === 'existente' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && buscarAlumnos()}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={buscarAlumnos}
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <Search size={20} />
                  <span>Buscar</span>
                </button>
              </div>

              {alumnosEncontrados.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alumnosEncontrados.map(alumno => (
                    <div
                      key={alumno.id}
                      className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {alumno.nombre_completo}
                        </p>
                        <p className="text-sm text-gray-600">
                          DNI: {alumno.dni} | Tel: {alumno.telefono}
                        </p>
                      </div>
                      <button
                        onClick={() => inscribirAlumno(alumno.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center space-x-2 disabled:opacity-50"
                      >
                        <UserPlus size={18} />
                        <span>Inscribir</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {busqueda.length > 0 && alumnosEncontrados.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-8">
                  No se encontraron alumnos
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
