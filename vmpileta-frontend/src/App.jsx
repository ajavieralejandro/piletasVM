import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import useAuthStore from './stores/useAuthStore';
import RegistroPage from './pages/RegistroPage';
import RecuperarPasswordPage from './pages/RecuperarPasswordPage';


// Componente para proteger rutas
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
    }
     />
</Routes>
    </BrowserRouter>
  );
}

export default App;
