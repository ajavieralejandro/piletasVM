import { useState } from 'react';
import { Calendar, User, CreditCard } from 'lucide-react';
import Layout from '../Layout';
import InscripcionTurnos from './InscripcionTurnos';
import MisCuotas from './cliente/MisCuotas';
import MiPerfil from './cliente/MiPerfil';

export default function ClienteDashboard() {
  const [pestanaActiva, setPestanaActiva] = useState('turnos');

  const pestanas = [
    { id: 'turnos', nombre: 'Mis Turnos', icono: Calendar },
    { id: 'cuotas', nombre: 'Cuotas', icono: CreditCard },
    { id: 'perfil', nombre: 'Mi Perfil', icono: User },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Cliente</h1>
          <p className="text-gray-600 mt-1">Gestioná tus turnos, cuotas y datos personales</p>
        </div>

        {/* Pestañas */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            {pestanas.map((pestana) => {
              const Icono = pestana.icono;
              return (
                <button
                  key={pestana.id}
                  onClick={() => setPestanaActiva(pestana.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition ${
                    pestanaActiva === pestana.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icono size={20} />
                  <span>{pestana.nombre}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido */}
        <div>
          {pestanaActiva === 'turnos' && <InscripcionTurnos />}
          {pestanaActiva === 'cuotas' && <MisCuotas />}
          {pestanaActiva === 'perfil' && <MiPerfil />}
        </div>
      </div>
    </Layout>
  );
}
