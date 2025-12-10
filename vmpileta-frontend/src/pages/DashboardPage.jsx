import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ProfesorDashboard from '../components/dashboards/ProfesorDashboard';
import ClienteDashboard from '../components/dashboards/ClienteDashboard';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Coordinador y Secretaria ven el panel de administración
  if (user.tipo_usuario === 'coordinador' || user.tipo_usuario === 'secretaria') {
    return <AdminDashboard />;
  }

  // Profesor
  if (user.tipo_usuario === 'profesor') {
    return <ProfesorDashboard />;
  }

  // Cliente (temporalmente deshabilitado)
  if (user.tipo_usuario === 'cliente') {
  return <ClienteDashboard />;
  }

  return <div>Tipo de usuario no reconocido</div>;
}