import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';

export default function InscripcionTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [turnosInscritos, setTurnosInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    
    try {
      const resTurnos = await axios.get('http://localhost:8000/api/turnos', {
        headers: { Authorization: 'Bearer ' + token },
      });
      
      const todosTurnos = resTurnos.data.data || [];
      console.log('Turnos cargados:', todosTurnos);
      setTurnos(todosTurnos);

      const inscrito = [];
      
      console.log('Verificando inscripciones para', todosTurnos.length, 'turnos');
      console.log('User ID:', user.id);
      
      for (const turno of todosTurnos) {
        try {
          console.log('Verificando turno', turno.id, turno.dia_semana);
          
          const resInsc = await axios.get('http://localhost:8000/api/turnos/' + turno.id + '/inscripciones', {
            headers: { Authorization: 'Bearer ' + token },
          });
          
          console.log('Inscripciones en turno', turno.id, ':', resInsc.data.data);
          
          const inscripciones = resInsc.data.data || [];
          const estoyAqui = inscripciones.some(i => {
            const alumnoId = i.alumno ? i.alumno.id : i.alumno_id;
            console.log('Comparando:', alumnoId, '===', user.id, '?', alumnoId === user.id);
            return alumnoId === user.id;
          });
          
          if (estoyAqui) {
            inscrito.push(turno.id);
            console.log('✓ INSCRITO en turno', turno.id);
          } else {
            console.log('✗ NO inscrito en turno', turno.id);
          }
        } catch (error) {
          console.error('Error verificando turno', turno.id, ':', error);
        }
      }
      
      console.log('Turnos inscritos:', inscrito);
      setTurnosInscritos(inscrito);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar turnos');
    }
    
    setLoading(false);
  };

  const estoyInscrito = (turnoId) => {
    return turnosInscritos.includes(turnoId);
  };

  const handleInscribirse = async (turno) => {
    if (estoyInscrito(turno.id)) {
      toast.error('YA ESTAS INSCRITO EN ESTE TURNO');
      return;
    }

    if (!confirm('Inscribirte en: ' + turno.dia_semana.toUpperCase() + ' ' + turno.hora_inicio + '-' + turno.hora_fin + '?')) {
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/inscripciones',
        { 
          turno_id: turno.id,
          alumno_id: user.id,
          fecha_inscripcion: new Date().toISOString().split('T')[0]
        },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      
      toast.success('Inscripcion exitosa');
      setTimeout(() => cargarDatos(), 1000);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error);
      toast.error(error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Error al inscribirse');
    }
  };

  const handleDarseDeBaja = async (turno) => {
    if (!confirm('Confirmar baja del turno ' + turno.dia_semana.toUpperCase() + '?')) return;

    try {
      const resInsc = await axios.get('http://localhost:8000/api/turnos/' + turno.id + '/inscripciones', {
        headers: { Authorization: 'Bearer ' + token },
      });
      
      const miInscripcion = (resInsc.data.data || []).find(i => {
        const alumnoId = i.alumno ? i.alumno.id : i.alumno_id;
        return alumnoId === user.id;
      });
      
      if (!miInscripcion) {
        toast.error('No se encontro tu inscripcion');
        return;
      }

      await axios.delete('http://localhost:8000/api/inscripciones/' + miInscripcion.id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      
      toast.success('Baja exitosa');
      setTimeout(() => cargarDatos(), 1000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al darse de baja');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando turnos...</p>
      </div>
    );
  }

  const misInscripciones = turnos.filter(t => estoyInscrito(t.id));
  const turnosDisponibles = turnos.filter(t => t.activo && !estoyInscrito(t.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mis Turnos</h2>
        <p className="text-gray-600 mt-1">Gestiona tus inscripciones</p>
      </div>

      {misInscripciones.length > 0 ? (
        <div className="bg-white border-2 border-green-500 rounded-lg shadow overflow-hidden">
          <div className="bg-green-50 px-6 py-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <h3 className="font-bold text-green-900 text-lg">Turnos Inscritos</h3>
                <p className="text-sm text-green-700">
                  Estas inscrito en {misInscripciones.length} {misInscripciones.length === 1 ? 'turno' : 'turnos'}
                </p>
              </div>
            </div>
          </div>

          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {misInscripciones.map((turno) => (
                <tr key={turno.id} className="hover:bg-green-50">
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 uppercase">{turno.dia_semana}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-primary-600" />
                      <span className="text-gray-900">{turno.hora_inicio} - {turno.hora_fin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {turno.profesor && turno.profesor.nombre_completo ? turno.profesor.nombre_completo : 'Sin profesor'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {turno.nivel && turno.nivel.nombre ? turno.nivel.nombre : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDarseDeBaja(turno)}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition font-medium"
                    >
                      <XCircle size={16} />
                      <span>Darme de baja</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Calendar className="mx-auto text-blue-400 mb-4" size={56} />
          <p className="text-blue-900 font-bold text-lg">NO ESTAS INSCRITO EN NINGUN TURNO</p>
          <p className="text-sm text-blue-700 mt-2">Elegi un turno disponible abajo</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Turnos Disponibles</h3>
        
        {turnosDisponibles.length === 0 ? (
          <div className="bg-gray-50 border p-8 text-center rounded-lg">
            <p className="text-gray-600">Ya estas inscrito en todos los turnos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turnosDisponibles.map((turno) => {
              const sinCupo = turno.cupo_disponible === 0;
              
              return (
                <div key={turno.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg text-gray-900 uppercase">{turno.dia_semana}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock size={16} className="text-primary-600" />
                        <span className="text-gray-700">{turno.hora_inicio} - {turno.hora_fin}</span>
                      </div>
                    </div>
                    <span className={'px-3 py-1 rounded-full text-xs font-bold ' + (sinCupo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                      {sinCupo ? 'SIN CUPO' : turno.cupo_disponible + ' lugares'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <p><strong>Profesor:</strong> {turno.profesor.nombre_completo}</p>
                    {turno.nivel && <p><strong>Nivel:</strong> {turno.nivel.nombre}</p>}
                    <p><strong>Cupo:</strong> {turno.cupo_maximo} alumnos</p>
                  </div>
                  
                  <button
                    onClick={() => handleInscribirse(turno)}
                    disabled={sinCupo}
                    className={'w-full py-3 rounded-lg font-medium transition ' + (sinCupo ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white')}
                  >
                    {sinCupo ? 'Sin cupo' : 'Inscribirme'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
