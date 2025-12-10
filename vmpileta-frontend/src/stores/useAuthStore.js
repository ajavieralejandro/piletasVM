import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),

  login: async (dni, password) => {
    try {
      const response = await authAPI.login(dni, password);
      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token, user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Verificar rol del usuario
  esSecretaria: () => {
    const { user } = useAuthStore.getState();
    return user?.tipo_usuario === 'secretaria';
  },

  esProfesor: () => {
    const { user } = useAuthStore.getState();
    return user?.tipo_usuario === 'profesor';
  },

  esCliente: () => {
    const { user } = useAuthStore.getState();
    return user?.tipo_usuario === 'cliente';
  },

  esCoordinador: () => {
    const { user } = useAuthStore.getState();
    return user?.tipo_usuario === 'coordinador';
  },

  tienePaseLibre: () => {
    const { user } = useAuthStore.getState();
    return user?.tipo_cliente === 'pase_libre';
  },
}));

export default useAuthStore;
