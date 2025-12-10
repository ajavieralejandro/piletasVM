import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Agregar token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH
// ============================================
export const authAPI = {
  login: (dni, password) => api.post('/login', { dni, password }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// ============================================
// TURNOS
// ============================================
export const turnosAPI = {
  getAll: (params) => api.get('/turnos', { params }),
  getById: (id) => api.get(`/turnos/${id}`),
  getPorDias: (dias) => api.get('/turnos', { params: { dias: dias.join(',') } }),
};

// ============================================
// INSCRIPCIONES
// ============================================
export const inscripcionesAPI = {
  crear: (data) => api.post('/inscripciones', data),
  eliminar: (id) => api.delete(`/inscripciones/${id}`),
  getPorTurno: (turnoId) => api.get(`/turnos/${turnoId}/inscripciones`),
};

// ============================================
// ALUMNOS
// ============================================
export const alumnosAPI = {
  crear: (data) => api.post('/alumnos', data),
  buscar: (query) => api.get('/alumnos', { params: { search: query } }),
  getInasistentes: () => api.get('/alumnos/inasistentes'),
};

// ============================================
// ASISTENCIAS
// ============================================
export const asistenciasAPI = {
  registrar: (claseId, asistencias) => 
    api.post(`/clases/${claseId}/asistencias`, { asistencias }),
  getPorTurno: (turnoId, mes, anio) => 
    api.get(`/turnos/${turnoId}/asistencias`, { params: { mes, anio } }),
};

// ============================================
// CAMBIOS DE NIVEL
// ============================================
export const cambiosNivelAPI = {
  getPendientes: () => api.get('/cambios-nivel/pendientes'),
  sugerir: (data) => api.post('/cambios-nivel', data),
  aprobar: (id) => api.post(`/cambios-nivel/${id}/aprobar`),
  rechazar: (id) => api.post(`/cambios-nivel/${id}/rechazar`),
};

// ============================================
// PASES LIBRE (para clientes)
// ============================================
export const pasesLibreAPI = {
  getTurnosDisponibles: (fecha) => 
    api.get('/pases-libre/disponibles', { params: { fecha } }),
  reservar: (turnoId, fecha) => 
    api.post('/pases-libre', { turno_id: turnoId, fecha }),
  getMisReservas: () => api.get('/pases-libre/mis-reservas'),
  cancelar: (id) => api.delete(`/pases-libre/${id}`),
};

// ============================================
// ESTADO DE CUENTA (para clientes)
// ============================================
export const estadoCuentaAPI = {
  getMiEstado: () => api.get('/mi-estado-cuenta'),
  getMovimientos: () => api.get('/mi-estado-cuenta/movimientos'),
};

// ============================================
// NOTIFICACIONES
// ============================================
export const notificacionesAPI = {
  getAll: () => api.get('/notificaciones'),
  marcarLeida: (id) => api.post(`/notificaciones/${id}/leer`),
  marcarTodasLeidas: () => api.post('/notificaciones/leer-todas'),
};

// ============================================
// PROFESORES (ADMIN)
// ============================================
export const profesoresAPI = {
  getAll: () => api.get('/profesores'),
  create: (data) => api.post('/profesores', data),
  update: (id, data) => api.put(`/profesores/${id}`, data),
  delete: (id) => api.delete(`/profesores/${id}`),
};

// ============================================
// NIVELES (ADMIN)
// ============================================
export const nivelesAPI = {
  getAll: () => api.get('/niveles'),
  create: (data) => api.post('/niveles', data),
  update: (id, data) => api.put(`/niveles/${id}`, data),
  delete: (id) => api.delete(`/niveles/${id}`),
};

// ============================================
// TURNOS ADMIN
// ============================================
export const turnosAdminAPI = {
  create: (data) => api.post('/turnos', data),
  update: (id, data) => api.put(`/turnos/${id}`, data),
  delete: (id) => api.delete(`/turnos/${id}`),
};
export default api;
