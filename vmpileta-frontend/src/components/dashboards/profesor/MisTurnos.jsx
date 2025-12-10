import { useState, useEffect } from 'react';
import { Clock, Users, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function MisTurnos() {
  const [turnos, setTurnos] = useState([]);
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
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/profesor/mis-turnos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTurnos(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar turnos');
    }
    setLoading(false);
  };

  // Agrupar turnos por día
  const turnosPorDia = turnos.reduce((acc, turno) => {
    if (!acc[turno.dia_semana]) {
      acc[turno.dia_semana] = [];
    }
    acc[turno.dia_semana].push(turno);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No tenés turnos asignados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mis Turnos</h2>
        <p className="text-gray-600">Horarios asignados durante la semana</p>
      </div>

      {Object.keys(diasSemana).map((dia) => {
        const turnosDia = turnosPorDia[dia];
        if (!turnosDia || turnosDia.length === 0) return null;

        return (
          <div key={dia} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 capitalize">{diasSemana[dia]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turnosDia.map((turno) => (
                <div
                  key={turno.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-5 border-l-4 border-green-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 text-green-600 font-semibold mb-1">
                        <Clock size={18} />
                        <span>
                          {turno.hora_inicio} - {turno.hora_fin}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{turno.nivel}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users size={16} />
                      <span>
                        {turno.inscriptos}/{turno.cupo_maximo}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        turno.cupo_disponible > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {turno.cupo_disponible > 0
                        ? `${turno.cupo_disponible} disponibles`
                        : 'Completo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
