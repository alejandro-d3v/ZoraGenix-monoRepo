import axios from 'axios';
import toast from 'react-hot-toast';

// Configuración base de axios
const api = axios.create({
  baseURL: '/api', // Usa el proxy de Vite
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de requests en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    // Log de responses exitosas en desarrollo
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error) => {
    // Log de errores
    console.error('Error en response:', error);

    // Manejar errores específicos
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido
          if (data.message?.includes('Token') || data.message?.includes('token')) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            
            // Redirigir al login si no estamos ya ahí
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
              toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
          }
          break;

        case 403:
          toast.error('No tienes permisos para realizar esta acción');
          break;

        case 404:
          toast.error('Recurso no encontrado');
          break;

        case 429:
          toast.error('Demasiadas solicitudes. Intenta de nuevo más tarde.');
          break;

        case 500:
          toast.error('Error interno del servidor. Intenta de nuevo más tarde.');
          break;

        default:
          // Mostrar mensaje de error del servidor si existe
          if (data.message) {
            toast.error(data.message);
          }
      }
    } else if (error.request) {
      // Error de red
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Error desconocido
      toast.error('Ha ocurrido un error inesperado');
    }

    return Promise.reject(error);
  }
);

// Funciones de API específicas

// Autenticación
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  verify: () => api.get('/auth/verify'),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout')
};

// Usuarios
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (currentPassword, newPassword) => 
    api.post('/users/change-password', { currentPassword, newPassword }),
  getStats: () => api.get('/users/stats'),
  deleteAccount: () => api.delete('/users/me')
};

// Imágenes
export const imageAPI = {
  generate: (toolId, selectedOptions, baseImage, customPrompt) => 
    api.post('/images/generate', { toolId, selectedOptions, baseImage, customPrompt }),
  getUserImages: (page = 1, limit = 20) => 
    api.get(`/images?page=${page}&limit=${limit}`),
  getImage: (id) => api.get(`/images/${id}`),
  deleteImage: (id) => api.delete(`/images/${id}`),
  searchImages: (query, page = 1, limit = 20) => 
    api.get(`/images/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
};

// Herramientas
export const toolAPI = {
  getUserTools: () => api.get('/tools'),
  getAllTools: () => api.get('/tools/all'),
  getTool: (id) => api.get(`/tools/${id}`),
  getToolConfig: (id) => api.get(`/tools/${id}/config`),
  buildPrompt: (toolId, selectedOptions) => 
    api.post('/tools/build-prompt', { toolId, selectedOptions }),
  getStats: () => api.get('/tools/stats')
};

// Administración
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Usuarios
  getAllUsers: () => api.get('/admin/users'),
  createUser: (user) => api.post('/admin/users', user),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserQuota: (id, quota) => api.patch(`/admin/users/${id}/quota`, { quota }),
  resetUserPassword: (id, newPassword) => 
    api.patch(`/admin/users/${id}/reset-password`, { newPassword }),
  updateUserRole: (id, roleId) => api.patch(`/admin/users/${id}/role`, { roleId }),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Imágenes
  getAllImages: (page = 1, limit = 50) => 
    api.get(`/admin/images?page=${page}&limit=${limit}`),
  
  // Herramientas
  createTool: (toolData) => api.post('/admin/tools', toolData),
  updateTool: (id, toolData) => api.put(`/admin/tools/${id}`, toolData),
  deleteTool: (id) => api.delete(`/admin/tools/${id}`),
  toggleTool: (id) => api.patch(`/admin/tools/${id}/toggle`),
  
  // Roles
  getAllRoles: () => api.get('/admin/roles'),
  assignToolsToRole: (roleId, toolIds) => 
    api.post(`/admin/roles/${roleId}/tools`, { toolIds }),
  createRole: (roleData) => api.post('/roles', roleData),
  updateRole: (id, roleData) => api.put(`/roles/${id}`, roleData),
  deleteRole: (id) => api.delete(`/roles/${id}`),
  getRole: (id) => api.get(`/roles/${id}`),
  getRoleTools: (id) => api.get(`/roles/${id}/tools`),
  
  // Configuración
  setApiKey: (apiKey) => api.post('/admin/api-key', { apiKey }),
  verifyApiKey: () => api.get('/admin/api-key/verify'),
  getSystemConfig: () => api.get('/admin/config')
};

// Función helper para manejar errores de forma consistente
export const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
  const message = error.response?.data?.message || defaultMessage;
  toast.error(message);
  return { success: false, error: message };
};

// Función helper para manejar respuestas exitosas
export const handleApiSuccess = (response, successMessage) => {
  if (successMessage) {
    toast.success(successMessage);
  }
  return { success: true, data: response.data };
};

export { api };