import { useState, useEffect } from 'react';
import { X, UserMinus, Users } from 'lucide-react';
import { inscripcionesAPI } from '../../../services/api';
import toast from 'react-hot-toast';

export default function ModalVerInscriptos({ turno, onClose, onRecargar }) {
  const [inscriptos, setInscriptos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarInscriptos();
  }, []);

  const cargarInscriptos = async () => {
    try {
      const response = await inscripcionesAPI.getPorTurno(turno.id);
      setInscriptos(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar inscriptos');
    }
    setLoading(false);
  };

  const darDeBaja = async (inscripcionId, nombreAlumno) => {
    if (!confirm(`¿Estás seguro de dar de baja a ${nombreAlumno}?`)) {
      return;
    }

    try {
      await inscripcionesAPI.eliminar(inscripcionId);
      toast.success('Alumno dado de baja');
      cargarInscriptos();
      onRecargar();
    } catch (error) {
      toast.error('Error al dar de baja al alumno');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Lista de Inscriptos</h2>
            <p className="text-sm text-gray-600 mt-1">
              {turno.dia_semana} {turno.hora_inicio} - {turno.hora_fin}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Users size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {inscriptos.filter(i => i.estado === 'activo').length} inscriptos activos
              </span>
            </div>
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando...</p>
            </div>
          ) : inscriptos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No hay alumnos inscriptos en este turno</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inscriptos.map((inscripcion) => (
                <div
                  key={inscripcion.id}
                  className={`flex justify-between items-center p-4 rounded-lg transition ${
                    inscripcion.estado === 'activo'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200 opacity-60'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {inscripcion.alumno.nombre_completo}
                    </p>
                    <p className="text-sm text-gray-600">
                      DNI: {inscripcion.alumno.dni} | Tel: {inscripcion.alumno.telefono}
                    </p>
                    {inscripcion.pase_libre && (
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Pase Libre
                      </span>
                    )}
                    {inscripcion.estado !== 'activo' && (
                      <span className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {inscripcion.estado}
                      </span>
                    )}
                  </div>
                  
                  {inscripcion.estado === 'activo' && (
                    <button
                      onClick={() => darDeBaja(inscripcion.id, inscripcion.alumno.nombre_completo)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center space-x-2"
                    >
                      <UserMinus size={18} />
                      <span>Dar de Baja</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
