import { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Camera, Save, X, Edit } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/useAuthStore';

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/perfil', {
        headers: { Authorization: 'Bearer ' + token },
      });
      
      setPerfil(response.data.data);
      setForm({
        nombre: response.data.data.nombre,
        apellido: response.data.data.apellido,
        telefono: response.data.data.telefono,
        email: response.data.data.email || '',
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar perfil');
    }
    setLoading(false);
  };

  const handleGuardar = async () => {
    try {
      await axios.put('http://localhost:8000/api/perfil', form, {
        headers: { Authorization: 'Bearer ' + token },
      });
      
      toast.success('Perfil actualizado');
      setEditando(false);
      cargarPerfil();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleSubirFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    setSubiendoFoto(true);
    try {
      const response = await axios.post('http://localhost:8000/api/perfil/foto', formData, {
        headers: { 
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      toast.success('Foto actualizada');
      setPerfil({ ...perfil, foto_perfil: response.data.data.foto_perfil });
    } catch (error) {
      toast.error('Error al subir foto');
    }
    setSubiendoFoto(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600">No se pudo cargar tu perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
          <p className="text-gray-600 mt-1">Administra tu información personal</p>
        </div>
        
        {!editando ? (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Edit size={18} />
            <span>Editar</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleGuardar}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Save size={18} />
              <span>Guardar</span>
            </button>
            <button
              onClick={() => {
                setEditando(false);
                setForm({
                  nombre: perfil.nombre,
                  apellido: perfil.apellido,
                  telefono: perfil.telefono,
                  email: perfil.email || '',
                });
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              <X size={18} />
              <span>Cancelar</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="relative inline-block">
              {perfil.foto_perfil ? (
                <img
                  src={perfil.foto_perfil}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto border-4 border-gray-300">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
              
              <label 
                htmlFor="foto-upload" 
                className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition"
              >
                {subiendoFoto ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Camera size={20} />
                )}
              </label>
              
              <input
                id="foto-upload"
                type="file"
                accept="image/*"
                onChange={handleSubirFoto}
                className="hidden"
                disabled={subiendoFoto}
              />
            </div>
            
            <h3 className="mt-4 text-xl font-bold text-gray-800">{perfil.nombre_completo}</h3>
            <p className="text-sm text-gray-500 capitalize">{perfil.tipo_usuario}</p>
            {perfil.tipo_cliente && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {perfil.tipo_cliente === 'socio' ? 'Socio' : perfil.tipo_cliente === 'no_socio' ? 'No Socio' : 'Pase Libre'}
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Información Personal</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              {editando ? (
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User size={18} className="text-gray-400" />
                  <span>{perfil.nombre}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              {editando ? (
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User size={18} className="text-gray-400" />
                  <span>{perfil.apellido}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <CreditCard size={18} className="text-gray-400" />
                <span>{perfil.dni}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              {editando ? (
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Phone size={18} className="text-gray-400" />
                  <span>{perfil.telefono}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {editando ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Mail size={18} className="text-gray-400" />
                  <span>{perfil.email || 'No configurado'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
