import Layout from '../Layout';
import { Users, Calendar, Settings, BarChart } from 'lucide-react';

export default function CoordinadorDashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de Coordinación
          </h1>
          <p className="text-gray-600 mt-1">
            Vista general y administración del sistema
          </p>
        </div>

        {/* En construcción */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Settings className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Dashboard en Construcción
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Aquí tendrás acceso completo a todas las funcionalidades del sistema.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-primary-50 rounded-lg p-6">
              <Users className="mx-auto text-primary-600 mb-3" size={32} />
              <h3 className="font-semibold text-gray-800">Usuarios</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gestionar alumnos y profesores
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <Calendar className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="font-semibold text-gray-800">Turnos</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ver y modificar horarios
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <BarChart className="mx-auto text-orange-600 mb-3" size={32} />
              <h3 className="font-semibold text-gray-800">Estadísticas</h3>
              <p className="text-sm text-gray-600 mt-1">
                Reportes y análisis
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <Settings className="mx-auto text-blue-600 mb-3" size={32} />
              <h3 className="font-semibold text-gray-800">Configuración</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ajustes del sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
