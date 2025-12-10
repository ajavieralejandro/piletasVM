import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Briefcase, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useThemeStore from '../stores/useThemeStore';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function RegistroPage() {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    password: '',
    password_confirmation: '',
    tipo_registro: 'cliente',
  });

  const [touched, setTouched] = useState({
    nombre: false,
    apellido: false,
    dni: false,
    telefono: false,
    email: false,
    password: false,
    password_confirmation: false,
  });

  const validaciones = {
    nombre: form.nombre.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre),
    apellido: form.apellido.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.apellido),
    dni: form.dni.length >= 7 && form.dni.length <= 8 && /^[0-9]+$/.test(form.dni),
    telefono: form.telefono.length >= 10 && form.telefono.length <= 15 && /^[0-9]+$/.test(form.telefono),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    password: form.password.length >= 6,
    password_confirmation: form.password_confirmation.length >= 6 && form.password === form.password_confirmation,
  };

  const handleBlur = (campo) => {
    setTouched({ ...touched, [campo]: true });
  };

  const handleNombreChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      setForm({ ...form, nombre: value });
    }
  };

  const handleApellidoChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      setForm({ ...form, apellido: value });
    }
  };

  const handleDniChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 8) {
      setForm({ ...form, dni: value });
    }
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 15) {
      setForm({ ...form, telefono: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      nombre: true,
      apellido: true,
      dni: true,
      telefono: true,
      email: true,
      password: true,
      password_confirmation: true,
    });

    if (!Object.values(validaciones).every((v) => v)) {
      toast.error('Por favor completá todos los campos correctamente');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/registro', form);
      toast.success(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errors.forEach((err) => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || 'Error al registrar');
      }
    }
    setLoading(false);
  };

  const MensajeValidacion = ({ campo, mensajeError, mensajeExito }) => {
    if (!touched[campo] || !form[campo]) return null;
    const esValido = validaciones[campo];
    return (
      <div className={`flex items-center space-x-2 text-sm mt-1 ${esValido ? 'text-green-600' : 'text-red-600'}`}>
        {esValido ? <CheckCircle size={16} /> : <XCircle size={16} />}
        <span>{esValido ? mensajeExito : mensajeError}</span>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Lado izquierdo */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-villamitre-green to-emerald-700'
        }`}
      >
        {isDark && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-villamitre-green rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className={isDark ? 'relative' : ''}>
            {isDark && (
              <div className="absolute inset-0 bg-villamitre-green/20 rounded-full filter blur-2xl"></div>
            )}
            <img
              src="/logo-villamitre.png"
              alt="Club Villa Mitre"
              className="relative w-40 h-40 mb-8 drop-shadow-2xl"
            />
          </div>

          <h1
            className={`text-5xl font-bold mb-4 ${
              isDark
                ? 'bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent'
                : 'text-white'
            }`}
          >
            Unite al Club
          </h1>
          <p className={`text-xl mb-12 ${isDark ? 'text-emerald-200' : 'text-white'}`}>
            Completá tu registro y comenzá a nadar
          </p>

          <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
            {[
              { value: '25m', label: 'Pileta Semi-olímpica' },
              { value: '6', label: 'Carriles' },
              { value: '+50', label: 'Alumnos' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 border transition ${
                  isDark
                    ? 'bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-villamitre-green/50'
                    : 'bg-white/20 border-white/30 backdrop-blur-sm'
                }`}
              >
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-white/90'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado derecho */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto ${
          isDark ? 'bg-slate-950' : 'bg-gray-50'
        }`}
      >
        <div className="w-full max-w-2xl py-8">
          <div className="lg:hidden text-center mb-8">
            <img src="/logo-villamitre.png" alt="Club Villa Mitre" className="w-20 h-20 mx-auto mb-4" />
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-villamitre-black'}`}>
              Registro
            </h1>
          </div>

          <div
            className={`rounded-2xl shadow-xl p-8 ${
              isDark
                ? 'bg-slate-900 border border-slate-800'
                : 'bg-white border-t-4 border-villamitre-green'
            }`}
          >
            <div className={`mb-6 ${isDark ? 'border-b border-slate-800 pb-6' : ''}`}>
              {isDark && (
                <div className="w-12 h-1 bg-gradient-to-r from-villamitre-green to-emerald-400 rounded-full mb-4"></div>
              )}
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-villamitre-black'}`}>
                Crear Cuenta
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Completá tus datos para registrarte
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tipo de registro */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    isDark ? 'text-gray-300' : 'text-villamitre-black'
                  }`}
                >
                  ¿Cómo te querés registrar? *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'cliente', label: 'Cliente/Alumno', icon: User },
                    { id: 'profesor', label: 'Profesor', icon: Briefcase },
                  ].map((tipo) => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setForm({ ...form, tipo_registro: tipo.id })}
                      className={`p-4 border-2 rounded-xl transition ${
                        form.tipo_registro === tipo.id
                          ? isDark
                            ? 'border-villamitre-green bg-villamitre-green/10'
                            : 'border-villamitre-green bg-green-50'
                          : isDark
                          ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <tipo.icon
                        className={`mx-auto mb-2 ${
                          form.tipo_registro === tipo.id
                            ? 'text-villamitre-green'
                            : isDark
                            ? 'text-gray-400'
                            : 'text-gray-400'
                        }`}
                        size={32}
                      />
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {tipo.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-villamitre-black'}`}>
                    Nombre *{' '}
                    <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      (solo letras)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={handleNombreChange}
                    onBlur={() => handleBlur('nombre')}
                    className={`w-full px-4 py-2 rounded-xl transition ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                        : 'border-2 border-gray-200 focus:border-villamitre-green focus:ring-4 focus:ring-green-100'
                    }`}
                    placeholder="Juan"
                    required
                  />
                  <MensajeValidacion
                    campo="nombre"
                    mensajeError="Mínimo 2 caracteres"
                    mensajeExito="✓ Válido"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-villamitre-black'}`}>
                    Apellido *{' '}
                    <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      (solo letras)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={handleApellidoChange}
                    onBlur={() => handleBlur('apellido')}
                    className={`w-full px-4 py-2 rounded-xl transition ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                        : 'border-2 border-gray-200 focus:border-villamitre-green focus:ring-4 focus:ring-green-100'
                    }`}
                    placeholder="Pérez"
                    required
                  />
                  <MensajeValidacion
                    campo="apellido"
                    mensajeError="Mínimo 2 caracteres"
                    mensajeExito="✓ Válido"
                  />
                </div>
              </div>

              {/* DNI y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-villamitre-black'}`}>
                    DNI *{' '}
                    <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      (solo números, sin puntos)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.dni}
                    onChange={handleDniChange}
                    onBlur={() => handleBlur('dni')}
                    className={`w-full px-4 py-2 rounded-xl transition ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                        : 'border-2 border-gray-200 focus:border-villamitre-green focus:ring-4 focus:ring-green-100'
                    }`}
                    placeholder="12345678"
                    required
                  />
                  <MensajeValidacion campo="dni" mensajeError="7-8 dígitos" mensajeExito="✓ Válido" />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-villamitre-black'}`}>
                    Teléfono *{' '}
                    <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      (solo números, sin guiones)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={handleTelefonoChange}
                    onBlur={() => handleBlur('telefono')}
                    className={`w-full px-4 py-2 rounded-xl transition ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                        : 'border-2 border-gray-200 focus:border-villamitre-green focus:ring-4 focus:ring-green-100'
                    }`}
                    placeholder="2914567890"
                    required
                  />
                  <MensajeValidacion campo="telefono" mensajeError="10-15 dígitos" mensajeExito="✓ Válido" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-villamitre-black'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-4 py-2 rounded-xl transition ${
                    isDark
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                      : 'border-2 border-gray-200 focus:border-villamitre-green focus:ring-4 focus:ring-green-100'
                  }`}
                  placeholder="correo@ejemplo.com"
                  required
                />
                <MensajeValidacion campo="email" mensajeError="Email inválido" mensajeExito="✓ Válido" />
              </div>

              {/* Contraseña */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-villamitre-black'}`}>
                  Contraseña *{' '}
                  <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    (mínimo 6 caracteres)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onBlur={() => handleBlur('password')}
                    className={`w-full px-4 py-2 rounded-xl transition ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                        : 'border-2 border-gray-200 focus:border-villamitre-green focus:ring-4 focus:ring-green-100'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-villamitre-green"
                  >
                    {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <MensajeValidacion campo="password" mensajeError="Muy corta" mensajeExito="✓ Válida" />
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-villamitre-black'}`}>
                  Confirmar Contraseña *
                </label>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  onBlur={() => handleBlur('password_confirmation')}
                  className={`w-full px-4 py-2 rounded-xl transition ${
                    isDark
                      ? 'bg-slate-800 border border-slate-700 text-white focus:border-villamitre-green focus:ring-2 focus:ring-villamitre-green/50 placeholder-gray-500'
                      : 'border-2 border-gray-200 focus:border-villamitre-green focus:ring-4 focus:ring-green-100'
                  }`}
                  required
                />
                <MensajeValidacion
                  campo="password_confirmation"
                  mensajeError="No coinciden"
                  mensajeExito="✓ Coinciden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg ${
                  isDark
                    ? 'bg-gradient-to-r from-villamitre-green to-emerald-500 hover:from-emerald-600 hover:to-emerald-500 text-white shadow-villamitre-green/20'
                    : 'bg-villamitre-green hover:bg-emerald-600 text-white'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Registrarse</span>
                  </>
                )}
              </button>

              <Link
                to="/login"
                className={`flex items-center justify-center space-x-2 transition mt-4 ${
                  isDark ? 'text-gray-400 hover:text-villamitre-green' : 'text-gray-600 hover:text-villamitre-green'
                }`}
              >
                <ArrowLeft size={18} />
                <span>Volver al login</span>
              </Link>
            </form>
          </div>

          <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            © 2024 Club Villa Mitre · Bahía Blanca
          </p>
        </div>
      </div>
    </div>
  );
}
