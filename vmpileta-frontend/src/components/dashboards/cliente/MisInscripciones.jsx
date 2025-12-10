import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Award, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
  };

  useEffect(() => {
    cargarInscripciones();
  }, []);

  const cargarInscripciones = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/cliente/mis-inscripciones', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInscripciones(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar inscripciones');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (inscripciones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 mb-2">No tenés inscripciones activas</p>
        <p className="text-sm text-gray-500">
          Consultá con secretaría para inscribirte en un turno
        </p>
      </div>
    );
  }

  const inscripcionesActivas = inscripciones.filter((i) => i.activo);
  const inscripcionesInactivas = inscripciones.filter((i) => !i.activo);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mis Inscripciones</h2>
        <p className="text-gray-600">Turnos en los que estás inscripto</p>
      </div>

      {/* Inscripciones Activas */}
      {inscripcionesActivas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Activas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inscripcionesActivas.map((inscripcion) => (
              <div
                key={inscripcion.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-blue-600 font-semibold mb-1">
                      <Calendar size={18} />
                      <span className="capitalize">{diasSemana[inscripcion.turno.dia_semana]}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 text-sm mb-2">
                      <Clock size={16} />
                      <span>
                        {inscripcion.turno.hora_inicio} - {inscripcion.turno.hora_fin}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{inscripcion.turno.nivel}</p>
                  </div>
                  {inscripcion.pase_libre && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Pase Libre
                    </span>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span>Profesor: {inscripcion.turno.profesor}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Inscripto desde: {inscripcion.fecha_inscripcion}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inscripciones Inactivas */}
      {inscripcionesInactivas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Inactivas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inscripcionesInactivas.map((inscripcion) => (
              <div
                key={inscripcion.id}
                className="bg-gray-50 rounded-lg shadow p-6 border-l-4 border-gray-400 opacity-60"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-gray-600 font-semibold mb-1">
                      <Calendar size={18} />
                      <span className="capitalize">{diasSemana[inscripcion.turno.dia_semana]}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <Clock size={16} />
                      <span>
                        {inscripcion.turno.hora_inicio} - {inscripcion.turno.hora_fin}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                    Inactivo
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <AlertCircle size={16} className="mr-2" />
                  <span>Turno deshabilitado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          Tenés <strong>{inscripcionesActivas.length}</strong>{' '}
          {inscripcionesActivas.length === 1 ? 'inscripción activa' : 'inscripciones activas'}
        </p>
      </div>
    </div>
  );
}
