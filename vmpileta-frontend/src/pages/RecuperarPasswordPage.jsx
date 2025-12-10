import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: verificar usuario, 2: cambiar password
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formVerificar, setFormVerificar] = useState({
    dni: '',
    telefono: '',
  });
  const [formPassword, setFormPassword] = useState({
    password: '',
    password_confirmation: '',
  });

  const handleVerificar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/recuperar-password/verificar',
        formVerificar
      );

      setToken(response.data.data.token);
      toast.success(response.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al verificar usuario');
    }
    setLoading(false);
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    if (formPassword.password !== formPassword.password_confirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/recuperar-password/cambiar', {
        token,
        ...formPassword,
      });

      toast.success('Contraseña cambiada exitosamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={40} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Recuperar Contraseña</h1>
          <p className="text-gray-600 mt-2">
            {step === 1 ? 'Verificá tu identidad' : 'Ingresá tu nueva contraseña'}
          </p>
        </div>

        {/* Paso 1: Verificar usuario */}
        {step === 1 && (
          <form onSubmit={handleVerificar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input
                type="text"
                value={formVerificar.dni}
                onChange={(e) => setFormVerificar({ ...formVerificar, dni: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Tu número de DNI"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="text"
                value={formVerificar.telefono}
                onChange={(e) => setFormVerificar({ ...formVerificar, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Tu número de teléfono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        )}

        {/* Paso 2: Nueva contraseña */}
        {step === 2 && (
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña *</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={formPassword.password}
                  onChange={(e) => setFormPassword({ ...formPassword, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={formPassword.password_confirmation}
                onChange={(e) =>
                  setFormPassword({ ...formPassword, password_confirmation: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

        {/* Volver */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={18} />
            <span>Volver al login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
