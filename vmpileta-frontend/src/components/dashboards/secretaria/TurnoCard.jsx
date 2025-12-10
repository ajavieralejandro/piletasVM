import { Clock, Users, UserPlus, UserMinus, Eye } from 'lucide-react';
import { useState } from 'react';
import ModalVerInscriptos from './ModalVerInscriptos';

export default function TurnoCard({ turno, onInscribir, onRecargar }) {
  const [showInscriptos, setShowInscriptos] = useState(false);

  const porcentajeOcupado = ((turno.cupo_maximo - turno.cupo_disponible) / turno.cupo_maximo) * 100;

  const getColorCupo = () => {
    if (porcentajeOcupado >= 90) return 'text-red-600 bg-red-50';
    if (porcentajeOcupado >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md hover:shadow-lg transition p-5 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 text-gray-700 mb-1">
              <Clock size={16} />
              <span className="font-bold text-lg">
                {turno.hora_inicio} - {turno.hora_fin}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Prof: {turno.profesor.nombre_completo}
            </p>
            {turno.nivel && (
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {turno.nivel.nombre}
              </span>
            )}
          </div>
        </div>

        {/* Cupos */}
        <div className={`mb-4 p-3 rounded-lg ${getColorCupo()}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users size={18} />
              <span className="font-semibold">Cupos</span>
            </div>
            <span className="text-2xl font-bold">
              {turno.cupo_maximo - turno.cupo_disponible}/{turno.cupo_maximo}
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-current transition-all"
              style={{ width: `${porcentajeOcupado}%` }}
            />
          </div>
          
          <p className="text-xs mt-1">
            {turno.cupo_disponible} disponibles
          </p>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowInscriptos(true)}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
          >
            <Eye size={16} />
            <span>Ver Lista</span>
          </button>
          
          <button
            onClick={() => onInscribir(turno)}
            disabled={turno.esta_completo}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} />
            <span>Inscribir</span>
          </button>
        </div>

        {turno.esta_completo && (
          <p className="text-center text-xs text-red-600 font-medium mt-2">
            ¡Turno completo!
          </p>
        )}
      </div>

      {/* Modal ver inscriptos */}
      {showInscriptos && (
        <ModalVerInscriptos
          turno={turno}
          onClose={() => setShowInscriptos(false)}
          onRecargar={onRecargar}
        />
      )}
    </>
  );
}
